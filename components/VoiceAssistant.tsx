"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, CalendarClock, MapPin, Mic, Repeat, Send, Users } from "lucide-react";
import { Badge, Button, Card, InfoRow } from "@/components/ui";
import { angle } from "@/components/ui/gradientAngle";
import { avgStayMin, placeById } from "@/lib/data";
import { isNo, isYes, parseDate, parsePlace, parseTime } from "@/lib/intent";
import { groupOfMine } from "@/lib/pooling";
import { nextOccurrence, offerText, routineForPlace } from "@/lib/routine";
import { listen, speak, stopListening, stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { newReservation } from "@/lib/trip";
import {
  addMinutes,
  dateKey,
  dayLabel,
  koDate,
  koTime,
  roundHalfHour,
  spokenClock,
  spokenTime,
  weekdayName,
  weekdayOf,
} from "@/lib/time";

// rest: 대화를 잠시 끝낸 상태 (예: 루틴 알림에 "나중에"라고 답함)
type Step = "place" | "date" | "time" | "confirm" | "done" | "rest";
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

// 음성 예약 대화 전체 (홈 화면과 /rider/voice 에서 같이 쓴다)
// routineOffers: 루틴 알림이 있으면 그 질문에 마이크로 바로 답하게 한다 (홈에서 켠다)
export default function VoiceAssistant({ intro = true, routineOffers = false }: { intro?: boolean; routineOffers?: boolean }) {
  const router = useRouter();
  const addReservation = useStore((s) => s.addReservation);
  const reservations = useStore((s) => s.reservations);
  const routines = useStore((s) => s.routines);
  const alert = useStore((s) => (routineOffers ? s.notifications.find((n) => !n.read) : undefined));
  const alertRoutine = useStore((s) => (alert ? s.routines.find((r) => r.id === alert.routineId) : undefined));

  // 대화 상태는 ref에 (비동기 흐름에서 최신 값을 읽기 위해), 화면에 필요한 것만 state에 복사
  const d = useRef<{ place?: string; date?: string; time?: string; step: Step; fails: number }>({ step: "place", fails: 0 });
  const gen = useRef(0); // 새 입력이 들어오면 옛 대화 흐름을 멈추기 위한 번호

  const [prompt, setPrompt] = useState(FIRST_PROMPT);
  const [heard, setHeard] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [hint, setHint] = useState("");
  const [choices, setChoices] = useState<Choice[]>([]);
  const [confirm, setConfirm] = useState<{ date: string; time: string; placeId: string; fromRoutine: boolean } | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [typed, setTyped] = useState("");

  const offering = !!(alert && alertRoutine) && !doneId && !confirm; // 루틴 알림 질문 중

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

  // 예약을 만들고 안내 문장을 돌려준다
  function book(date: string, time: string, placeId: string, stay: number): string {
    const p = placeById(placeId)!;
    const res = newReservation(date, time, placeId, stay);
    addReservation(res);
    d.current.step = "done";
    setConfirm(null);
    setChoices([]);
    setDoneId(res.id);
    const end = roundHalfHour(addMinutes(time, 30 + stay)); // 이동 30분 + 평균 체류
    return `가는 차는 ${spokenTime(time)}에 집 앞으로 가요. 오시는 차는 ${
      p.kind === "병원" ? "진료" : "볼일"
    } 끝나고 불러주시면 바로 갈게요. 보통 ${spokenClock(end)}쯤 끝나세요.`;
  }

  // 들은 말을 받아서 다음에 할 말(앱의 대답)을 돌려준다
  function respond(text: string, silent = false): string {
    const st = useStore.getState();
    const now = st.now;
    setHeard(silent ? "" : text); // 버튼으로 누른 것은 말한 글로 남기지 않는다
    setHint("");
    const s = d.current;

    // 루틴 알림 질문에 대한 대답
    const offerAlert = routineOffers ? st.notifications.find((n) => !n.read) : undefined;
    const offerRoutine = offerAlert ? st.routines.find((r) => r.id === offerAlert.routineId) : undefined;
    if (offerAlert && offerRoutine && s.step !== "done") {
      if (isYes(text) || /예약/.test(text)) {
        return book(offerAlert.date, offerRoutine.time, offerRoutine.placeId, offerRoutine.avgStayMin);
      }
      st.markRead(offerAlert.id); // 나중에, 또는 다른 말을 하면 알림은 닫는다
      if (isNo(text)) {
        s.step = "rest";
        setPrompt(FIRST_PROMPT);
        return "알겠어요. 필요하시면 말씀해 주세요.";
      }
    }

    if (s.step === "confirm") {
      if (isNo(text)) {
        s.place = s.date = s.time = undefined;
        s.step = "place";
        s.fails = 0;
        setConfirm(null);
        setPrompt(FIRST_PROMPT);
        return `다시 말씀해 주세요. ${QUESTION.place}`;
      }
      if (isYes(text)) return book(s.date!, s.time!, s.place!, avgStayMin(s.place!));
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

    // 루틴이 있는 곳인데 시간을 말하지 않았으면, 매주 가시던 시간으로 먼저 제안한다
    let fromRoutine = false;
    if (s.place && !s.time) {
      const r = routineForPlace(st.routines, s.place);
      if (r && !s.date) {
        s.date = nextOccurrence(r, now);
        s.time = r.time;
        fromRoutine = true;
      } else if (r && s.date && weekdayOf(s.date) === r.weekday) {
        s.time = r.time;
        fromRoutine = true;
      }
    }

    const missing = !s.place ? "place" : !s.date ? "date" : !s.time ? "time" : null;
    if (!missing) {
      s.step = "confirm";
      setConfirm({ date: s.date!, time: s.time!, placeId: s.place!, fromRoutine });
      setChoices([]);
      return confirmSentence() + (fromRoutine ? " 매주 가시던 시간이에요." : "");
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
    if (d.current.step === "done" || d.current.step === "rest") return setStatus("idle");

    setStatus("listening");
    setHeard("");
    const text = await listen((t) => g === gen.current && setHeard(t));
    if (g !== gen.current) return;
    setStatus("idle");

    if (text === null) {
      setHint("음성 인식을 쓸 수 없어요, 글자로 입력해 주세요");
      return;
    }
    if (text === "") {
      d.current.fails += 1;
      const s = d.current.step;
      if (d.current.fails >= 2 && CHOICES[s]) setChoices(CHOICES[s]);
      setHint("잘 못 들었어요, 마이크를 눌러 다시 말씀해 주세요");
      await speak("잘 못 들었어요. 마이크를 눌러 다시 말씀해 주세요.");
      return;
    }
    await converse(g, respond(text));
  }

  function resetDialog() {
    d.current = { step: "place", fails: 0 };
    setDoneId(null);
    setConfirm(null);
    setChoices([]);
    setPrompt(FIRST_PROMPT);
    setHeard("");
  }

  function submit(text: string, silent = false) {
    const t = text.trim();
    if (!t) return;
    const g = ++gen.current;
    stopListening();
    stopSpeaking();
    setStatus("idle");
    setTyped("");
    if (d.current.step === "done" || d.current.step === "rest") resetDialog();
    void converse(g, respond(t, silent));
  }

  function onMic() {
    if (status === "listening") {
      gen.current++;
      stopListening();
      setStatus("idle");
      return;
    }
    if (status === "speaking") return stopSpeaking(); // 말 건너뛰기: 곧바로 듣기 시작
    if (d.current.step === "done" || d.current.step === "rest") resetDialog();
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
    status === "listening" ? "듣고 있어요" : status === "speaking" ? "안내하고 있어요" : "";
  const shownPrompt = (offering && alert && alertRoutine ? offerText(alert, alertRoutine) : prompt).replace(/\.\s*/g, "\n").trim(); // 화면에는 마침표 없이

  // 예약이 끝났을 때 보여줄 세 가지 요약 (왕복 / 함께 타기 / 루틴)
  const doneRes = doneId ? reservations.find((r) => r.id === doneId) : undefined;
  const doneGroup = doneRes ? groupOfMine(doneRes, reservations) : undefined;
  const doneOthers = doneGroup ? doneGroup.members.length - 1 : 0;
  const donePlace = doneRes ? placeById(doneRes.placeId) : undefined;
  const doneRoutine = doneRes
    ? routines.find((r) => r.placeId === doneRes.placeId && r.frequency === "weekly" && r.weekday === weekdayOf(doneRes.date))
    : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-72 w-72 items-center justify-center">
          <span style={angle(315)} className={`absolute inset-0 rounded-full bg-rec-gradient opacity-15 ${status === "listening" ? "breathe" : ""}`} />
          <span style={angle(200)} className={`absolute inset-9 rounded-full bg-rec-gradient opacity-25 ${status === "listening" ? "breathe" : ""}`} />
          <button
            type="button"
            onClick={onMic}
            aria-label="말하기"
            style={angle(145)}
            className={`relative flex h-40 w-40 items-center justify-center rounded-full bg-rec-gradient text-white shadow-[inset_0_3px_4px_rgba(255,255,255,0.5),inset_0_-8px_14px_rgba(32,127,186,0.35),0_12px_32px_rgba(86,181,197,0.45)] ${
              status === "listening" ? "breathe" : ""
            }`}
          >
            <Mic size={64} strokeWidth={1.75} />
          </button>
        </div>

        {offering && (
          <div className="mt-2">
            <Badge>루틴 알림 · 먼저 알려드려요</Badge>
          </div>
        )}
        <h1 className="mt-2 whitespace-pre-line text-[22px] font-semibold leading-snug tracking-tight text-navy">{shownPrompt}</h1>
        {/* 안내 문구는 제목 하나로 (반복 삭제) */}
        {heard && <p className="mt-2 text-2xl font-medium">{heard}</p>}
        {hint ? (
          <p className="mt-3 text-lg font-medium text-navy">{hint}</p>
        ) : (
          (offering || pill) && (
            <p className="mt-3 text-lg text-sub">{offering ? "마이크로 '네' 또는 '나중에'라고 답해도 돼요" : pill}</p>
          )
        )}
        {status !== "idle" && (
          <Button variant="secondary" size="sm" full={false} className="mt-4 px-8" onClick={onCancel}>
            취소
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {offering && (
          <div className="flex gap-3">
            <Button onClick={() => submit("예약해줘", true)}>예약하기</Button>
            <Button variant="secondary" onClick={() => submit("나중에", true)}>
              나중에
            </Button>
          </div>
        )}

        {choices.length > 0 && (
          <div className="space-y-3">
            {choices.map((c) => (
              <Button key={c.label} variant="secondary" onClick={() => submit(c.text, true)}>
                {c.label}
              </Button>
            ))}
          </div>
        )}

        {confirm && place && (
          <Card className="space-y-4">
            {confirm.fromRoutine && <Badge>루틴 · 매주 가시던 시간이에요</Badge>}
            <InfoRow icon={CalendarClock} title={`${koDate(confirm.date)} ${koTime(confirm.time)}`} desc="가는 시간" />
            <InfoRow icon={MapPin} title={place.name} desc={place.kind} />
            <div className="space-y-3 pt-1">
              <Button onClick={() => submit("네", true)}>맞아요</Button>
              <Button variant="secondary" onClick={() => submit("아니요", true)}>
                다시 말할게요
              </Button>
            </div>
          </Card>
        )}

        {doneRes && donePlace && (
          <Card className="space-y-4">
            <InfoRow
              icon={CalendarCheck}
              title="왕복을 한 번에 예약했어요"
              desc={`가는 차 ${koTime(doneRes.goTime)} · 오는 차는 ${donePlace.kind === "병원" ? "진료" : "볼일"} 후 호출`}
            />
            <InfoRow
              icon={Users}
              title={doneOthers > 0 ? `이웃 ${doneOthers}분과 한 차로 가요` : "이번에는 혼자 타요"}
              desc={doneOthers > 0 ? `차 ${doneOthers + 1}대가 1대로 줄어요` : "같은 방향 분이 있으면 묶어 드려요"}
            />
            <InfoRow
              icon={Repeat}
              title={doneRoutine ? `매주 ${dayLabel(doneRoutine.weekday)}요일 루틴이에요` : "자주 가시면 루틴으로 알려드려요"}
              desc={doneRoutine ? "전날 저녁에 먼저 알려드려요" : "이동 기록을 보고 배워요"}
            />
            <Button onClick={() => router.push("/rider/chain")}>내 이동 보기</Button>
          </Card>
        )}

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
              placeholder="내일 병원 가고 싶어요"
              className="h-11 min-w-0 flex-1 rounded-pill inset px-4 text-xl outline-none focus:ring-2 focus:ring-brand/40"
            />
            <button
              type="submit"
              aria-label="보내기"
              style={angle(50)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rec-gradient rec-3d text-white"
            >
              <Send size={20} />
            </button>
          </form>
      </div>
    </div>
  );
}
