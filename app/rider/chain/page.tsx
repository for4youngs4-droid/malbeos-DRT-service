"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Hospital, House, Navigation, Users } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import TripStage, { tripPhase } from "@/components/TripStage";
import { Button, Card, InfoRow, PhoneFrame, SectionTitle, Timeline, Toggle, TopBar } from "@/components/ui";
import { placeById } from "@/lib/data";
import { groupOfMine, myPickup } from "@/lib/pooling";
import { speak, stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { koDate, koTime, spokenTime, weekdayName } from "@/lib/time";
import { isTourTarget } from "@/lib/tour";
import { nextReservation, newReservation, tripTimes } from "@/lib/trip";

const STEPS = ["예약", "이동", "도착", "귀가", "완료"];

// 지금 어디까지 왔는지 한눈에 (지난 단계는 체크, 지금 단계는 강조)
function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-start justify-between px-1">
      {STEPS.map((label, i) => (
        <li key={label} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex w-full items-center">
            <span className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : i <= current ? "bg-brand" : "bg-line"}`} />
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${
                i < current
                  ? "bg-brand text-white"
                  : i === current
                    ? "bg-brand text-white ring-4 ring-brand/20"
                    : "bg-white text-sub ring-1 ring-line"
              }`}
            >
              {i < current ? <Check size={13} strokeWidth={3} /> : i + 1}
            </span>
            <span className={`h-0.5 flex-1 ${i === STEPS.length - 1 ? "opacity-0" : i < current ? "bg-brand" : "bg-line"}`} />
          </div>
          <span className={`text-[12px] ${i === current ? "font-semibold text-brand" : "font-medium text-sub"}`}>{label}</span>
        </li>
      ))}
    </ol>
  );
}

export default function TripPage() {
  const router = useRouter();
  const now = useStore((s) => s.now);
  const r = useStore((s) => nextReservation(s.reservations, s.now));
  const reservations = useStore((s) => s.reservations);
  const update = useStore((s) => s.updateReservation);
  const remove = useStore((s) => s.removeReservation);
  const tourStep = useStore((s) => s.tourStep);
  const touringChain = isTourTarget(tourStep, "chain") || isTourTarget(tourStep, "chain-together");
  const [finished, setFinished] = useState(false); // 집에 돌아옴

  const rid = r?.id;
  useEffect(() => {
    if (!rid) return;
    const cur = useStore.getState().reservations.find((x) => x.id === rid)!;
    if (tripPhase(cur, useStore.getState().now) !== "before") return; // 이동 중에는 단계별 안내가 대신 나온다
    speak(`${weekdayName(cur.date)}요일 이동이에요. ${spokenTime(cur.goTime)}에 집 앞으로 차가 가요.`);
    return stopSpeaking;
  }, [rid]);

  useEffect(() => {
    if (finished) speak("집에 도착했어요. 오늘도 수고하셨어요.");
  }, [finished]);

  if (finished) {
    return (
      <PhoneFrame tabs>
        <TopBar title="내 이동" />
        <div data-tour-target="chain" className="space-y-4 px-5 pt-3">
          <Stepper current={STEPS.length} />
          <Card flat>
            <InfoRow icon={Navigation} title="집에 도착했어요" desc="오늘도 수고하셨어요" />
          </Card>
          <Button flat onClick={() => router.push("/rider")}>홈으로</Button>
        </div>
      </PhoneFrame>
    );
  }

  // 도움말 가이드 중에는 예약이 없어도 임시 예시로 화면을 채워서 보여준다.
  // 실제로 저장하지 않으므로 가이드를 끄면 그대로 빈 화면으로 돌아간다
  if (!r && touringChain) {
    const demo = newReservation("2026-09-22", "09:00", "hospital", 30);
    const place = placeById(demo.placeId)!;
    const t = tripTimes(demo);
    const group = groupOfMine(demo, [...reservations, demo]);
    const others = group ? group.members.length - 1 : 0;
    return (
      <PhoneFrame tabs>
        <TopBar title="내 이동" />
        <div className="space-y-5 px-5 pt-1">
          <p className="text-lg text-sub">
            {koDate(demo.date)} {place.name} 방문 (예시)
          </p>
          <div data-tour-target="chain" className="space-y-5">
            <SectionTitle>왕복 계획</SectionTitle>
            <Card flat className="pb-0">
              <Timeline
                items={[
                  { icon: House, title: "집", desc: `${koTime(t.depart)} 출발` },
                  { icon: Hospital, title: place.name, desc: `${koTime(t.arrive)} - ${koTime(t.leave)}` },
                  { icon: House, title: "집", desc: `${koTime(t.home)} 도착 예정` },
                ]}
              />
            </Card>
          </div>
          <div data-tour-target="chain-together" className="space-y-5">
            <SectionTitle>함께 타기</SectionTitle>
            <Card flat>
              <InfoRow
                icon={Users}
                title={others > 0 ? `이웃 ${others}분과 함께 타요` : "이번에는 혼자 타요"}
                desc={group && others > 0 ? `${group.vehicle} · 집 앞 ${koTime(myPickup(group, demo))} · 차 ${others + 1}대가 1대로` : ""}
                right={<ChevronRight size={22} className="text-sub" />}
              />
            </Card>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  if (!r) {
    return (
      <PhoneFrame tabs>
        <TopBar title="내 이동" />
        <EmptyState
          title="예정된 이동이 없어요"
          desc="홈에서 말로 예약해 보세요"
          actionLabel="홈으로"
          onAction={() => router.push("/rider")}
          tourTarget="chain"
        />
      </PhoneFrame>
    );
  }

  const place = placeById(r.placeId)!;
  const t = tripTimes(r);
  const group = groupOfMine(r, reservations);
  const others = group ? group.members.length - 1 : 0;
  const phase = tripPhase(r, now);
  const current = { before: 0, riding: 1, stay: 2, returning: 3 }[phase];

  return (
    <PhoneFrame tabs>
      <TopBar title="내 이동" />
      <div className="space-y-5 px-5 pt-1">
        <p className="text-lg text-sub">
          {koDate(r.date)} {place.kind === "병원" ? "병원" : place.name} 방문
        </p>

        <Stepper current={current} />

        <TripStage r={r} onFinished={() => setFinished(true)} />

        <div data-tour-target="chain" className="space-y-5">
          <SectionTitle>왕복 계획</SectionTitle>
          <Card flat className="pb-0">
            <Timeline
              items={[
                { icon: House, title: "집", desc: `${koTime(t.depart)} 출발` },
                { icon: Hospital, title: place.name, desc: `${koTime(t.arrive)} - ${koTime(t.leave)}` },
                {
                  icon: House,
                  title: "집",
                  desc: r.returnOn ? `${koTime(t.home)} 도착 예정` : "오시는 길은 따로 이동해요",
                  dim: !r.returnOn,
                },
              ]}
            />
          </Card>
        </div>
        <Card flat>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xl font-semibold">오시는 차도 함께 예약</p>
              <p className="text-lg text-sub">
                {r.returnOn ? `${place.kind === "병원" ? "진료" : "볼일"} 끝나면 바로 불러요` : "오시는 길은 따로 이동해요"}
              </p>
            </div>
            <Toggle
              flat
              checked={r.returnOn}
              onChange={(on) => {
                update(r.id, { returnOn: on });
                speak(on ? "오시는 차도 함께 예약했어요." : "오시는 길은 따로 오시는 걸로 바꿨어요.");
              }}
              label="오시는 차도 함께 예약"
            />
          </div>
        </Card>

        <div data-tour-target="chain-together" className="space-y-5">
          <SectionTitle>함께 타기</SectionTitle>
          <Link href="/rider/together" className="block">
            <Card flat>
              <InfoRow
                icon={Users}
                title={others > 0 ? `이웃 ${others}분과 함께 타요` : "이번에는 혼자 타요"}
                desc={
                  group
                    ? others > 0
                      ? `${group.vehicle} · 집 앞 ${koTime(myPickup(group, r))} · 차 ${others + 1}대가 1대로`
                      : "같은 방향 분이 있으면 묶어 드려요"
                    : ""
                }
                right={<ChevronRight size={22} className="text-sub" />}
              />
            </Card>
          </Link>
        </div>

        {phase === "before" && (
          <Button
            flat
            variant="outline"
            onClick={() => {
              remove(r.id);
              speak("예약을 취소했어요.");
              router.push("/rider");
            }}
          >
            예약 취소
          </Button>
        )}
      </div>
    </PhoneFrame>
  );
}
