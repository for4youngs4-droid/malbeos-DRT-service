"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, CalendarClock, MapPin, Mic, Send } from "lucide-react";
import { Button, Card, InfoRow } from "@/components/ui";
import { avgStayMin, placeById } from "@/lib/data";
import { isNo, isYes, parseDate, parsePlace, parseTime } from "@/lib/intent";
import { listen, speak, stopListening, stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { newReservation } from "@/lib/trip";
import { addMinutes, dateKey, koDate, koTime, roundHalfHour, spokenClock, spokenTime, weekdayName } from "@/lib/time";

type Step = "place" | "date" | "time" | "confirm" | "done";
type Choice = { label: string; text: string };
type Status = "idle" | "speaking" | "listening";

const FIRST_PROMPT = "어디로 가실까요?";
const QUESTION: Record<string, string> = {
  place: "어디로 가세요?",
  date: "언제 가세요?",
  time: "몇 시쯤 나가실까요?",
};
const CHOICES: Record<string, Choice[]> = {
  place: [
    { label: "행복내과", text: "행복내과" },
    { label: "읍내 장터", text: "읍내 장터" },
    { label: "보건소", text: "보건소" },
  ],
  date: [
    { label: "내일", text: "내일" },
    { label: "모레", text: "모레" },
  ],
  time: [
    { label: "아침 9시", text: "아침 9시" },
    { label: "오전 10시", text: "오전 10시" },
    { label: "오후 2시", text: "오후 2시" },
  ],
};

function spokenDay(date: string, now: number) {
  const today = dateKey(now);
  const tomorrow = dateKey(new Date(now).setDate(new Date(now).getDate() + 1));
  if (date === today) return "오늘";
  if (date === tomorrow) return "내일";
  return `${weekdayName(date)}요일`;
}

// 마이크 양옆 음파 막대 (듣는 중에 움직인다)
function Waves({ listening, side }: { listening: boolean; side: string }) {
  const heights = [22, 40, 28];
  return (
    <span className={`absolute ${side} flex items-center gap-1.5`} aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-1 rounded-full bg-[#56b5c5]/70 ${listening ? "wave-bar" : ""}`}
          style={{ height: h, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

// 음성 예약 대화 전체 (홈 화면과 /rider/voice 에서 같이 쓴다)
export default function VoiceAssistant({ intro = true }: { intro?: boolean }) {
  const router = useRouter();
  const addReservation = useStore((s) => s.addReservation);

  // 대화 상태는 ref에 (비동기 흐름에서 최신 값을 읽기 위해), 화면에 필요한 것만 state에 복사
  const d = useRef<{ place?: string; date?: string; time?: string; step: Step; fails: number }>({ step: "place", fails: 0 });
  const gen = useRef(0); // 새 입력이 들어오면 옛 대화 흐름을 멈추기 위한 번호

  const [prompt, setPrompt] = useState(FIRST_PROMPT);
  const [first, setFirst] = useState(true);
  const [heard, setHeard] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [hint, setHint] = useState("");
  const [choices, setChoices] = useState<Choice[]>([]);
  const [confirm, setConfirm] = useState<{ date: string; time: string; placeId: string } | null>(null);
  const [done, setDone] = useState(false);
  const [textMode, setTextMode] = useState(false);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (intro) speak(`${FIRST_PROMPT} 말씀해 주세요.`);
    return () => {
      gen.current += 1000; // 화면을 떠나면 진행 중인 대화를 멈춘다
      stopSpeaking();
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function confirmSentence() {
    const { date, time, place } = d.current;
    return `${spokenDay(date!, useStore.getState().now)} ${spokenTime(time!)}에 ${placeById(place!)!.name}로 가시는 거 맞으세요?`;
  }

  function finalize(): string {
    const { date, time, place } = d.current;
    const p = placeById(place!)!;
    const stay = avgStayMin(p.id);
    addReservation(newReservation(date!, time!, p.id, stay));
    d.current.step = "done";
    setConfirm(null);
    setChoices([]);
    setDone(true);
    const end = roundHalfHour(addMinutes(time!, 30 + stay)); // 이동 30분 + 평균 체류
    return `가는 차는 ${spokenTime(time!)}에 집 앞으로 가요. 오시는 차는 ${
      p.kind === "병원" ? "진료" : "볼일"
    } 끝나고 불러주시면 바로 갈게요. 보통 ${spokenClock(end)}쯤 끝나세요.`;
  }

  // 들은 말을 받아서 다음에 할 말(앱의 대답)을 돌려준다
  function respond(text: string): string {
    const now = useStore.getState().now;
    setHeard(text);
    setHint("");
    const s = d.current;

    if (s.step === "confirm") {
      if (isNo(text)) {
        s.place = s.date = s.time = undefined;
        s.step = "place";
        s.fails = 0;
        setConfirm(null);
        setPrompt(FIRST_PROMPT);
        setFirst(true);
        return `다시 말씀해 주세요. ${QUESTION.place}`;
      }
      if (isYes(text)) return finalize();
      return `${confirmSentence()} 맞으면 네, 아니면 아니요라고 말씀해 주세요.`;
    }

    const p = parsePlace(text);
    const dt = parseDate(text, now);
    const tm = parseTime(text);
    if (p) s.place = p;
    if (dt) s.date = dt;
    if (tm) s.time = tm;
    const understood = !!(p || dt || tm);
    s.fails = understood ? 0 : s.fails + 1;

    const missing = !s.place ? "place" : !s.date ? "date" : !s.time ? "time" : null;
    setFirst(false);
    if (!missing) {
      s.step = "confirm";
      setConfirm({ date: s.date!, time: s.time!, placeId: s.place! });
      setChoices([]);
      return confirmSentence();
    }
    s.step = missing;
    setConfirm(null);
    // 두 번 못 알아들으면 큰 버튼으로 고르게 한다
    setChoices(s.fails >= 2 ? CHOICES[missing] : []);
    const q = QUESTION[missing];
    return understood ? q : s.fails >= 2 ? `잘 못 알아들었어요. 아래에서 골라 주세요. ${q}` : `잘 못 알아들었어요. ${q}`;
  }

  // 앱이 말하고(reply), 이어서 사용자의 말을 듣는다
  async function converse(g: number, reply: string | null) {
    if (reply) {
      setPrompt(d.current.step === "done" ? "예약이 끝났어요" : reply); // 긴 안내는 음성으로만
      setStatus("speaking");
      await speak(reply);
      if (g !== gen.current) return;
    }
    if (d.current.step === "done") return setStatus("idle");

    setStatus("listening");
    setHeard("");
    const text = await listen((t) => g === gen.current && setHeard(t));
    if (g !== gen.current) return;
    setStatus("idle");

    if (text === null) {
      setTextMode(true);
      setHint("음성 인식을 쓸 수 없어요. 글자로 입력해 주세요.");
      return;
    }
    if (text === "") {
      d.current.fails += 1;
      const s = d.current.step;
      if (d.current.fails >= 2 && CHOICES[s]) setChoices(CHOICES[s]);
      setHint("잘 못 들었어요. 마이크를 눌러 다시 말씀해 주세요.");
      await speak("잘 못 들었어요. 마이크를 눌러 다시 말씀해 주세요.");
      return;
    }
    await converse(g, respond(text));
  }

  function submit(text: string) {
    const t = text.trim();
    if (!t) return;
    const g = ++gen.current;
    stopListening();
    stopSpeaking();
    setStatus("idle");
    setTyped("");
    if (d.current.step === "done") resetDialog();
    void converse(g, respond(t));
  }

  function resetDialog() {
    d.current = { step: "place", fails: 0 };
    setDone(false);
    setConfirm(null);
    setChoices([]);
    setPrompt(FIRST_PROMPT);
    setFirst(true);
    setHeard("");
  }

  function onMic() {
    if (status === "listening") {
      gen.current++;
      stopListening();
      setStatus("idle");
      return;
    }
    if (status === "speaking") return stopSpeaking(); // 말 건너뛰기: 곧바로 듣기 시작
    if (d.current.step === "done") resetDialog();
    void converse(++gen.current, null);
  }

  // 취소: 듣기와 말하기를 멈추고 처음 상태로
  function onCancel() {
    gen.current++;
    stopListening();
    stopSpeaking();
    setStatus("idle");
    setHeard("");
    setHint("");
  }

  const place = confirm ? placeById(confirm.placeId) : undefined;
  const pill =
    status === "listening" ? "듣고 있어요. 말씀하세요" : status === "speaking" ? "안내하고 있어요" : "마이크를 누르고 말해보세요";

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-72 w-72 items-center justify-center">
          <span className={`absolute inset-0 rounded-full bg-rec-gradient opacity-15 ${status === "listening" ? "breathe" : ""}`} />
          <span className={`absolute inset-9 rounded-full bg-rec-gradient opacity-25 ${status === "listening" ? "breathe" : ""}`} />
          <Waves listening={status === "listening"} side="left-2" />
          <Waves listening={status === "listening"} side="right-2" />
          <button
            type="button"
            onClick={onMic}
            aria-label="말하기"
            className={`relative flex h-40 w-40 items-center justify-center rounded-full bg-rec-gradient text-white shadow-[0_12px_32px_rgba(86,181,197,0.45)] ${
              status === "listening" ? "breathe" : ""
            }`}
          >
            <Mic size={64} strokeWidth={1.75} />
          </button>
        </div>

        <h1 className="mt-2 text-[22px] font-semibold leading-snug tracking-tight text-navy">{prompt}</h1>
        {first && <p className="mt-1 text-xl font-medium text-brand">말씀해 주세요.</p>}
        {first && !heard && <p className="mt-2 text-lg text-sub">예) 내일 아침에 읍내 병원 가야 돼</p>}
        {heard && <p className="mt-2 text-2xl font-medium">{heard}</p>}
        {hint ? (
          <p className="mt-3 text-lg font-medium text-navy">{hint}</p>
        ) : (
          <p className="mt-3 text-lg text-sub">{pill}</p>
        )}
        {status !== "idle" && (
          <Button variant="secondary" size="sm" full={false} className="mt-4 px-8" onClick={onCancel}>
            취소
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {choices.length > 0 && (
          <div className="space-y-3">
            {choices.map((c) => (
              <Button key={c.label} variant="secondary" onClick={() => submit(c.text)}>
                {c.label}
              </Button>
            ))}
          </div>
        )}

        {confirm && place && (
          <Card className="space-y-4">
            <InfoRow icon={CalendarClock} title={`${koDate(confirm.date)} ${koTime(confirm.time)}`} desc="가는 시간" />
            <InfoRow icon={MapPin} title={place.name} desc={place.kind} />
            <div className="space-y-3 pt-1">
              <Button onClick={() => submit("네")}>맞아요</Button>
              <Button variant="secondary" onClick={() => submit("아니요")}>
                다시 말할게요
              </Button>
            </div>
          </Card>
        )}

        {done && (
          <Card className="space-y-4">
            <InfoRow icon={CalendarCheck} title="왕복 이동을 계획했어요" desc="가는 편과 오는 편을 함께 준비했어요" />
            <Button onClick={() => router.push("/rider/chain")}>일정 보기</Button>
          </Card>
        )}

        {!textMode ? (
          <button type="button" onClick={() => setTextMode(true)} className="mx-auto block min-h-12 text-lg text-sub underline">
            글자로 입력하기
          </button>
        ) : (
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit(typed);
            }}
          >
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="예) 내일 병원 가고 싶어요"
              className="min-h-14 min-w-0 flex-1 rounded-pill border border-line bg-white px-5 text-xl outline-none focus:border-brand"
            />
            <button
              type="submit"
              aria-label="보내기"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy text-white"
            >
              <Send size={22} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
