"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bus, CalendarCheck, Check, Hospital, House } from "lucide-react";
import { Button, Card, InfoRow, PhoneFrame, Timeline, TopBar } from "@/components/ui";
import { placeById } from "@/lib/data";
import { groupOfMine, myPickup } from "@/lib/pooling";
import { speak, stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { koTime, spokenTime, weekdayName } from "@/lib/time";
import { nextReservation, tripTimes } from "@/lib/trip";

// 예약 상세: 진행 상태 세로 줄 (완료는 체크, 예정은 빈 원)
function StatusLine({ steps }: { steps: { label: string; time: string; done?: boolean }[] }) {
  return (
    <ol>
      {steps.map((s, i) => (
        <li key={s.label} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                s.done ? "bg-brand text-white" : "bg-white ring-2 ring-brand/50"
              }`}
            >
              {s.done && <Check size={14} strokeWidth={3} />}
            </span>
            {i < steps.length - 1 && <span className="my-1 w-0.5 flex-1 bg-line" />}
          </div>
          <div className="pb-5">
            <p className="text-xl font-medium leading-6">{s.label}</p>
            <p className="text-lg text-sub">{s.time}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function ChainPage() {
  const router = useRouter();
  const r = useStore((s) => nextReservation(s.reservations, s.now));
  const reservations = useStore((s) => s.reservations);
  const update = useStore((s) => s.updateReservation);
  const remove = useStore((s) => s.removeReservation);
  const [open, setOpen] = useState(false);

  const rid = r?.id;
  useEffect(() => {
    if (!rid) return;
    const cur = useStore.getState().reservations.find((x) => x.id === rid)!;
    speak(`${weekdayName(cur.date)}요일 이동 계획이에요. ${spokenTime(cur.goTime)}에 집 앞으로 차가 가요.`);
    return stopSpeaking;
  }, [rid]);

  if (!r) {
    return (
      <PhoneFrame tabs>
        <TopBar title="이동 계획" />
        <div className="space-y-5 px-5 pt-4">
          <Card>
            <InfoRow icon={House} title="예정된 이동이 없어요" desc="홈에서 말로 예약해 보세요" />
          </Card>
          <Button onClick={() => router.push("/rider")}>홈으로</Button>
        </div>
      </PhoneFrame>
    );
  }

  const place = placeById(r.placeId)!;
  const t = tripTimes(r);
  const group = groupOfMine(r, reservations);
  const allOn = r.goOn && r.stopOn && r.returnOn;
  const errand = place.kind === "병원" ? "진료" : "볼일";

  const change = (patch: Partial<typeof r>, on: boolean, offSpeech: string) => {
    update(r.id, patch);
    speak(on ? "다시 함께 계획했어요." : offSpeech);
  };

  return (
    <PhoneFrame tabs>
      <TopBar title="이동 계획" />
      <div className="space-y-5 px-5 pt-1">
        <p className="text-lg text-sub">
          {weekdayName(r.date)}요일 {place.kind === "병원" ? "병원" : place.name} 방문 (왕복)
        </p>

        <Card className="pb-0">
          <Timeline
            items={[
              {
                icon: House,
                title: "집",
                desc: koTime(t.depart),
                on: r.goOn,
                dim: !r.goOn,
                tag: r.goOn ? undefined : "따로 이동",
                onToggle: (on) => change({ goOn: on }, on, "가시는 길은 따로 가시는 걸로 바꿨어요"),
              },
              {
                icon: Hospital,
                title: `${place.name} (${place.kind})`,
                desc: `${koTime(t.arrive)} - ${koTime(t.leave)} (대기 예약)`,
                on: r.stopOn,
                dim: !r.stopOn,
                tag: r.stopOn ? undefined : "따로 이동",
                onToggle: (on) => change({ stopOn: on }, on, "이 일정은 따로 이동하는 걸로 바꿨어요"),
              },
              {
                icon: House,
                title: "집",
                desc: `${koTime(t.home)} (예정)`,
                on: r.returnOn,
                dim: !r.returnOn,
                tag: r.returnOn ? undefined : "따로 이동",
                onToggle: (on) => change({ returnOn: on }, on, "오시는 길은 따로 오시는 걸로 바꿨어요"),
              },
            ]}
          />
        </Card>

        <p className="px-1 text-center text-lg text-sub">
          {allOn ? "왕복 이동이 함께 계획되어 있어요." : "따로 이동하는 곳이 있어요."}
        </p>

        <Card className="space-y-4">
          <InfoRow
            icon={CalendarCheck}
            title={`${errand}가 끝나면`}
            desc="'귀가하기' 버튼을 눌러 주세요. 귀가 차량을 바로 연결해 드려요."
          />
          <Button onClick={() => router.push("/rider/live")}>귀가하기</Button>
        </Card>

        <Button variant="outline" onClick={() => setOpen(!open)}>
          {open ? "예약 상세 접기" : "예약 상세 보기"}
        </Button>

        {open && (
          <Card className="space-y-5">
            <StatusLine
              steps={[
                { label: "예약 완료", time: "예약이 접수됐어요", done: true },
                { label: "탑승 예정", time: group ? koTime(myPickup(group, r)) : koTime(t.depart) },
                { label: "도착 예정", time: koTime(t.arrive) },
              ]}
            />
            <InfoRow
              icon={Bus}
              title={`가는 차: ${group?.vehicle ?? "배정 중"}`}
              desc={
                group
                  ? `${group.seats}인승${group.members.length > 1 ? ` · 함께 ${group.members.length - 1}명` : ""}`
                  : "곧 배정돼요"
              }
            />
            <InfoRow icon={Bus} title="오시는 차" desc="불러주시면 15분 뒤 도착해요" />
            <Button
              variant="outline"
              onClick={() => {
                remove(r.id);
                speak("예약을 취소했어요.");
                router.push("/rider");
              }}
            >
              예약 취소
            </Button>
          </Card>
        )}
      </div>
    </PhoneFrame>
  );
}
