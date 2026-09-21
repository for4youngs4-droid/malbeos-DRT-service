"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarClock, ChevronRight, Users } from "lucide-react";
import { Button, Card, Illustration, InfoRow, PhoneFrame } from "@/components/ui";
import { placeById, HERO } from "@/lib/data";
import { speak, stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { dateKey, koDate, koTime } from "@/lib/time";
import { groupOfMine } from "@/lib/pooling";
import { nextReservation } from "@/lib/trip";

export default function RiderHome() {
  const router = useRouter();
  const now = useStore((s) => s.now);
  const reservations = useStore((s) => s.reservations);
  const notifications = useStore((s) => s.notifications);
  const setTime = useStore((s) => s.setTime);

  useEffect(() => {
    speak(`안녕하세요, ${HERO.name}님. 오늘도 안전한 이동을 응원해요.`);
    return stopSpeaking;
  }, []);

  const unread = notifications.filter((n) => !n.read);
  const next = nextReservation(reservations, now);
  const group = next ? groupOfMine(next, reservations) : undefined;
  const others = group ? group.members.length - 1 : 0;
  const moving = !!next && next.date === dateKey(now); // 이동 당일
  const nextPlace = next ? placeById(next.placeId) : undefined;

  return (
    <PhoneFrame tabs>
      <div className="space-y-5 px-5 pt-6">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-lg text-sub">안녕하세요,</p>
            <h1 className="text-[22px] font-bold">{HERO.name}님</h1>
          </div>
          <Link
            href={unread.length ? "/rider/routine-alert" : "/rider"}
            aria-label="알림"
            className="relative flex h-12 w-12 items-center justify-center rounded-full text-ink"
          >
            <Bell size={26} />
            {unread.length > 0 && <span className="absolute right-2.5 top-2.5 h-3.5 w-3.5 rounded-full bg-brand" />}
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
            title={moving ? "지금 이동 중이에요" : "다음 이동 예정"}
            desc={next ? `${koDate(next.date)} ${koTime(next.goTime)}` : "예정된 이동이 없어요"}
          />
          {next && nextPlace ? (
            <>
              <p className="text-xl font-bold">
                {nextPlace.name} ({nextPlace.kind})
              </p>
              {others > 0 && (
                <Link href="/rider/together" className="flex min-h-14 items-center gap-3 rounded-pill bg-sky px-4 text-xl font-bold text-navy">
                  <Users size={26} />
                  다른 분 {others}명과 함께 타세요
                </Link>
              )}
              <Button variant="secondary" onClick={() => router.push("/rider/chain")}>
                일정 보기 &rarr;
              </Button>
              {moving && <Button onClick={() => router.push("/rider/live")}>이동 보기</Button>}
            </>
          ) : (
            <Button onClick={() => router.push("/rider/voice")}>말로 예약하기</Button>
          )}
        </Card>

        {/* 임시: 블록 6의 시연 조작판이 생기면 지운다 */}
        <button
          type="button"
          onClick={() => setTime(new Date(2026, 8, 21, 19, 0).getTime())}
          className="block min-h-14 w-full rounded-pill border border-dashed border-line text-lg text-sub"
        >
          (임시) 월요일 저녁 7시로 바꾸기
        </button>
      </div>
    </PhoneFrame>
  );
}
