"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarClock, ChevronRight } from "lucide-react";
import { Button, Card, Illustration, InfoRow, PhoneFrame } from "@/components/ui";
import { placeById, HERO } from "@/lib/data";
import { speak, stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { dateKey, koDate, koTime } from "@/lib/time";

export default function RiderHome() {
  const router = useRouter();
  const now = useStore((s) => s.now);
  const reservations = useStore((s) => s.reservations);
  const notifications = useStore((s) => s.notifications);

  useEffect(() => {
    speak(`안녕하세요, ${HERO.name}님. 오늘도 안전한 이동을 응원해요.`);
    return stopSpeaking;
  }, []);

  const unread = notifications.filter((n) => !n.read);
  const today = dateKey(now);
  const next = reservations
    .filter((r) => r.date >= today)
    .sort((a, b) => (a.date + a.goTime).localeCompare(b.date + b.goTime))[0];
  const nextPlace = next ? placeById(next.placeId) : undefined;

  return (
    <PhoneFrame tabs>
      <div className="space-y-5 px-5 pt-6">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-lg text-sub">안녕하세요,</p>
            <h1 className="text-[28px] font-bold">{HERO.name}님</h1>
          </div>
          <Link
            href={unread.length ? "/rider/routine-alert" : "/rider"}
            aria-label="알림"
            className="relative flex h-14 w-14 items-center justify-center rounded-full text-ink"
          >
            <Bell size={30} />
            {unread.length > 0 && <span className="absolute right-3 top-3 h-3.5 w-3.5 rounded-full bg-brand" />}
          </Link>
        </header>

        {unread.map((n) => (
          <Link key={n.id} href="/rider/routine-alert" className="block">
            <Card className="border-2 border-brand">
              <InfoRow icon={Bell} title="새 알림" desc={n.title} right={<ChevronRight size={28} className="text-sub" />} />
            </Card>
          </Link>
        ))}

        <Card className="flex flex-col items-center bg-brand-soft text-center">
          <Illustration name="home-bus" className="h-36 w-full" />
          <p className="mt-3 text-xl font-bold">오늘도 안전한 이동을 응원해요!</p>
        </Card>

        <Card className="space-y-4">
          <InfoRow
            icon={CalendarClock}
            title="다음 이동 예정"
            desc={next ? `${koDate(next.date)} ${koTime(next.goTime)}` : "예정된 이동이 없어요"}
          />
          {next && nextPlace ? (
            <>
              <p className="text-xl font-bold">
                {nextPlace.name} ({nextPlace.kind})
              </p>
              <Button variant="secondary" onClick={() => router.push("/rider/chain")}>
                일정 보기 &rarr;
              </Button>
            </>
          ) : (
            <Button onClick={() => router.push("/rider/voice")}>말로 예약하기</Button>
          )}
        </Card>
      </div>
    </PhoneFrame>
  );
}
