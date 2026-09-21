"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Illustration, PhoneFrame, TopBar } from "@/components/ui";
import { placeById } from "@/lib/data";
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

  return (
    <PhoneFrame>
      <TopBar left="close" title={alert.title} />
      <div className="space-y-6 px-5 pt-4">
        <p className="text-lg text-sub">DRT를 예약하시겠어요?</p>
        <Card className="flex flex-col items-center gap-3 text-center">
          <Illustration name="routine-calendar" className="h-32 w-32" />
          <p className="text-xl font-bold">
            {weekdayName(alert.date)}요일 {koTime(routine.time)}
          </p>
          <p className="text-xl">
            {place.name} ({place.kind})
          </p>
        </Card>
        <div className="space-y-3">
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
      </div>
    </PhoneFrame>
  );
}
