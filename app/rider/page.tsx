"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Bus, CalendarClock, ChevronRight, Users } from "lucide-react";
import VoiceAssistant from "@/components/VoiceAssistant";
import { Button, Card, InfoRow, PhoneFrame, SectionTitle } from "@/components/ui";
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
    speak(`안녕하세요, ${HERO.name}님. 어디로 가실까요? 마이크를 누르고 말씀해 주세요.`);
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
            <h1 className="text-[22px] font-semibold tracking-tight">{HERO.name}님</h1>
          </div>
          <Link
            href={unread.length ? "/rider/routine-alert" : "/rider"}
            aria-label="알림"
            className="relative flex h-12 w-12 items-center justify-center rounded-full text-ink"
          >
            <Bell size={26} />
            {unread.length > 0 && <span className="absolute right-2.5 top-2.5 h-3.5 w-3.5 rounded-full bg-alert ring-2 ring-white" />}
          </Link>
        </header>

        {unread.map((n) => (
          <Link key={n.id} href="/rider/routine-alert" className="block">
            <Card className="ring-2 ring-brand/60">
              <InfoRow icon={Bell} title="새 알림" desc={n.title} right={<ChevronRight size={28} className="text-sub" />} />
            </Card>
          </Link>
        ))}

        <VoiceAssistant intro={false} />

        <SectionTitle>{moving ? "지금 이동 중이에요" : "예정된 이동"}</SectionTitle>
        {next && nextPlace ? (
          <Card className="space-y-4">
            <InfoRow
              icon={moving ? Bus : CalendarClock}
              title={`${nextPlace.name} (${nextPlace.kind})`}
              desc={moving ? `${nextPlace.name} 가는 중 · ${koTime(next.goTime)} 출발` : `${koDate(next.date)} ${koTime(next.goTime)}`}
              right={!moving && <ChevronRight size={22} className="text-sub" />}
            />
            {others > 0 && (
              <Link href="/rider/together" className="flex min-h-11 items-center gap-2 rounded-pill bg-brand-soft px-4 text-lg font-medium text-navy">
                <Users size={20} />
                다른 분 {others}명과 함께 타세요
              </Link>
            )}
            {moving ? (
              <Button size="sm" onClick={() => router.push("/rider/live")}>
                실시간 위치 보기
              </Button>
            ) : (
              <Button size="sm" onClick={() => router.push("/rider/chain")}>
                예약 확인하기 &rarr;
              </Button>
            )}
          </Card>
        ) : (
          <Card>
            <InfoRow icon={CalendarClock} title="예정된 이동이 없어요" desc="위의 마이크로 말씀해 보세요" />
          </Card>
        )}

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
