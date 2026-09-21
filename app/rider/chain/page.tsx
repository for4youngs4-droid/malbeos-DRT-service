"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bus, Hospital, House } from "lucide-react";
import { Button, Card, InfoRow, PhoneFrame, Timeline, TopBar } from "@/components/ui";
import { placeById } from "@/lib/data";
import { speak, stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { koTime, spokenTime, weekdayName } from "@/lib/time";
import { groupOfMine, myPickup } from "@/lib/pooling";
import { nextReservation, tripTimes } from "@/lib/trip";

export default function ChainPage() {
  const router = useRouter();
  const r = useStore((s) => nextReservation(s.reservations, s.now));
  const reservations = useStore((s) => s.reservations);
  const update = useStore((s) => s.updateReservation);
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
            <InfoRow icon={House} title="예정된 이동이 없어요" desc="말로 예약해 보세요" />
          </Card>
          <Button onClick={() => router.push("/rider/voice")}>말로 예약하기</Button>
        </div>
      </PhoneFrame>
    );
  }

  const place = placeById(r.placeId)!;
  const t = tripTimes(r);
  const group = groupOfMine(r, reservations);
  const allOn = r.goOn && r.stopOn && r.returnOn;

  const change = (patch: Partial<typeof r>, on: boolean, offSpeech: string) => {
    update(r.id, patch);
    speak(on ? "다시 함께 계획했어요." : offSpeech);
  };

  return (
    <PhoneFrame tabs>
      <TopBar title={`${weekdayName(r.date)}요일 이동 계획`} />
      <div className="space-y-5 px-5 pt-5">
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

        <p className="rounded-pill bg-white px-5 py-3 text-center text-lg font-medium text-sub ring-1 ring-line">
          {allOn ? "왕복 이동이 함께 계획되어 있어요." : "따로 이동하는 곳이 있어요."}
        </p>

        <Button variant="secondary" onClick={() => setOpen(!open)}>
          {open ? "접기" : "상세보기"} {open ? "↑" : "↓"}
        </Button>

        {open && (
          <Card className="space-y-4">
            <InfoRow
              icon={Bus}
              title={`가는 차: ${group?.vehicle ?? "배정 중"}`}
              desc={
                group
                  ? `${group.seats}인승 · 집 앞 도착 ${koTime(myPickup(group, r))}${group.members.length > 1 ? ` · 함께 ${group.members.length - 1}명` : ""}`
                  : "곧 배정돼요"
              }
            />
            <InfoRow icon={Bus} title="오시는 차" desc="불러주시면 15분 뒤 도착해요" />
          </Card>
        )}
      </div>
    </PhoneFrame>
  );
}
