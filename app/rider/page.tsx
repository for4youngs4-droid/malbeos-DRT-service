"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Bus, CalendarClock, ChevronRight, Users, Volume2, VolumeX } from "lucide-react";
import VoiceAssistant from "@/components/VoiceAssistant";
import { Button, Card, InfoRow, PhoneFrame, SectionTitle, Toggle } from "@/components/ui";
import { HERO, placeById } from "@/lib/data";
import { groupOfMine } from "@/lib/pooling";
import { offerText } from "@/lib/routine";
import { speak, stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { dateKey, koDate, koNow, koTime } from "@/lib/time";
import { nextReservation } from "@/lib/trip";

export default function RiderHome() {
  const router = useRouter();
  const now = useStore((s) => s.now);
  const reservations = useStore((s) => s.reservations);
  const alert = useStore((s) => s.notifications.find((n) => !n.read));
  const alertRoutine = useStore((s) => (alert ? s.routines.find((r) => r.id === alert.routineId) : undefined));
  const setTime = useStore((s) => s.setTime);
  const voiceOn = useStore((s) => s.voiceOn);
  const setVoiceOn = useStore((s) => s.setVoiceOn);

  // 음성 안내 스위치: 켜면 확인 음성이 나오고, 끄면 말하던 것도 바로 멈춘다
  const changeVoice = (on: boolean) => {
    setVoiceOn(on);
    if (on) void speak("음성 안내를 켰어요");
    else stopSpeaking();
  };

  // 루틴 알림이 있으면 그 질문을, 없으면 인사를 읽어준다
  const spoken = alert && alertRoutine ? offerText(alert, alertRoutine) : `안녕하세요, ${HERO.name}님. 어디로 가실까요? 마이크를 누르고 말씀해 주세요.`;
  useEffect(() => {
    speak(spoken);
    return stopSpeaking;
  }, [spoken]);

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
            <p className="mt-0.5 text-[13px] text-sub">{koNow(now)}</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-2">
              {voiceOn ? <Volume2 size={22} className="text-brand" /> : <VolumeX size={22} className="text-sub" />}
              <Toggle checked={voiceOn} onChange={changeVoice} label="음성 안내" />
            </div>
            <span aria-label={alert ? "새 알림이 있어요" : "알림"} className="relative flex h-12 w-12 items-center justify-center text-ink">
              <Bell size={26} />
              {alert && <span className="absolute right-2.5 top-2.5 h-3.5 w-3.5 rounded-full bg-alert ring-2 ring-white" />}
            </span>
          </div>
        </header>

        <VoiceAssistant intro={false} routineOffers />

        <SectionTitle>{moving ? "지금 이동 중이에요" : "예정된 이동"}</SectionTitle>
        {next && nextPlace ? (
          <Card className="space-y-4">
            <InfoRow
              icon={moving ? Bus : CalendarClock}
              title={nextPlace.name}
              desc={moving ? `${nextPlace.name} 가는 중 · ${koTime(next.goTime)} 출발` : `${koDate(next.date)} ${koTime(next.goTime)}`}
              right={!moving && <ChevronRight size={22} className="text-sub" />}
            />
            {others > 0 && (
              <Link href="/rider/together" className="flex min-h-11 items-center gap-2 rounded-pill raised-blue px-4 text-lg font-medium text-navy">
                <Users size={20} />
                다른 분 {others}명과 함께 타세요
              </Link>
            )}
            <Button size="sm" gradient onClick={() => router.push("/rider/chain")}>
              {moving ? "실시간 위치 보기" : "내 이동 보기 →"}
            </Button>
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
          월요일 저녁 7시로 바꾸기
        </button>
      </div>
    </PhoneFrame>
  );
}
