"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, CalendarClock, Package, ShoppingBasket, Stethoscope } from "lucide-react";
import { Button, Card, InfoRow, ListGroup, ListRow, PhoneFrame, SectionTitle, TopBar } from "@/components/ui";
import { PAST_TRIPS, placeById } from "@/lib/data";
import { isNo, isYes } from "@/lib/intent";
import { listen, speak, stopListening, stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { koTime, weekdayName } from "@/lib/time";
import { newReservation } from "@/lib/trip";

export default function RoutineAlertPage() {
  const router = useRouter();
  const alert = useStore((s) => s.notifications.find((n) => !n.read));
  const routine = useStore((s) => s.routines.find((r) => r.id === alert?.routineId));
  const place = routine ? placeById(routine.placeId) : undefined;
  const alive = useRef(true);

  const book = () => {
    if (!alert || !routine) return;
    stopListening();
    stopSpeaking();
    useStore.getState().addReservation(newReservation(alert.date, routine.time, routine.placeId, routine.avgStayMin));
    void speak("예약했어요. 하루 이동 계획을 보여드릴게요.");
    router.push("/rider/chain");
  };

  const later = () => {
    if (!alert) return;
    stopListening();
    stopSpeaking();
    useStore.getState().markRead(alert.id);
    router.push("/rider");
  };

  // 화면이 뜨면 읽어주고, 이어서 대답을 듣는다
  const answered = useRef(false);
  useEffect(() => {
    alive.current = true;
    if (!alert) return;
    (async () => {
      await speak(`${alert.title}. DRT를 예약하시겠어요?`);
      if (!alive.current) return;
      const heard = await listen();
      if (!alive.current || !heard || answered.current) return;
      if (isNo(heard) || /나중/.test(heard)) later();
      else if (isYes(heard) || /예약/.test(heard)) book();
    })();
    return () => {
      alive.current = false;
      stopListening();
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert?.id]);

  if (!alert || !routine || !place) {
    return (
      <PhoneFrame>
        <TopBar left="close" title="새 알림이 없어요" />
        <div className="px-5 pt-6">
          <Button onClick={() => router.push("/rider")}>홈으로</Button>
        </div>
      </PhoneFrame>
    );
  }

  // 최근 이동 기록 3건 (최신순)
  const recent = [...PAST_TRIPS].sort((x, y) => y.date.localeCompare(x.date)).slice(0, 3);
  const dayWord = alert.title.split(" ")[0]; // "내일", "오늘", "화요일"

  return (
    <PhoneFrame>
      <TopBar left="close" title={`${dayWord}의 이동이 있어요`} />
      <div className="space-y-5 px-5 pt-3">
        <ul className="space-y-1.5 text-lg text-sub">
          <li className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" />
            {weekdayName(alert.date)}요일 {koTime(routine.time)}
          </li>
          <li className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-tint" />
            {place.name} ({place.kind})
          </li>
        </ul>

        <Card className="space-y-4">
          <InfoRow
            icon={CalendarClock}
            title={`${weekdayName(alert.date)}요일 ${place.kind === "병원" ? "병원 방문" : `${place.name} 방문`} 예정입니다.`}
            desc="DRT를 예약하시겠어요?"
          />
          <div className="flex gap-3">
            <Button
              onClick={() => {
                answered.current = true;
                book();
              }}
            >
              예약하기
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                answered.current = true;
                later();
              }}
            >
              나중에
            </Button>
          </div>
        </Card>

        <SectionTitle>최근 이동 기록</SectionTitle>
        <ListGroup>
          {recent.map((t) => {
            const p = placeById(t.placeId)!;
            return (
              <ListRow
                key={t.date}
                icon={p.kind === "병원" ? Stethoscope : p.kind === "장보기" ? ShoppingBasket : Package}
                title={p.name}
                desc={`${weekdayName(t.date)}요일 ${t.departTime}`}
                right={<Check size={20} className="text-brand" />}
              />
            );
          })}
        </ListGroup>
      </div>
    </PhoneFrame>
  );
}
