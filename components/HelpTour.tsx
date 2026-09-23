"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CalendarCheck, Clock, Users, X } from "lucide-react";
import { Button } from "./ui";
import { useStore } from "@/lib/store";

const subscribe = () => () => {};

// 핵심 기능 3가지를 실제 화면으로 직접 들어가서 하나씩 안내한다
// (CLAUDE.md 핵심 기능 순서: Routine → Chain → Community)
export const TOUR_STEPS = [
  {
    href: "/rider/routines",
    target: "routine", // data-tour-target="routine" (내 루틴 화면 안)
    icon: Clock,
    title: "반복되는 이동, 먼저 알려드려요",
    desc: "자주 다니시는 길을 스스로 찾아내고, 시간이 되면 미리 여쭤봐요. 여기서 알림을 켜고 끌 수 있어요.",
  },
  {
    href: "/rider/chain",
    target: "chain", // data-tour-target="chain" (내 이동 화면 안)
    icon: CalendarCheck,
    title: "가는 길과 오는 길을 한 번에",
    desc: "예약하시면 가는 편과 오는 편을 하루 계획으로 모아서 여기에 보여드려요.",
  },
  {
    href: "/rider",
    target: "community", // data-tour-target="community" (홈 화면 안)
    icon: Users,
    title: "같은 방향이면 함께 타요",
    desc: "여기 마이크로 말씀하시면, 같은 방향으로 가는 분이 있을 때 차 한 대로 함께 모셔다드려요.",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

// 설정에서 도움말을 켜면 실제 화면으로 하나씩 이동하며, 그 안의 핵심 부분만 남기고 나머지는 어둡게 가린다
export default function HelpTour() {
  const step = useStore((s) => s.tourStep);
  const nextTourStep = useStore((s) => s.nextTourStep);
  const endTour = useStore((s) => s.endTour);
  const router = useRouter();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [rect, setRect] = useState<Rect | null>(null);
  const tries = useRef(0);

  const current = step !== null && step < TOUR_STEPS.length ? TOUR_STEPS[step] : null;

  // 단계가 바뀌면 그 화면으로 실제로 들어간다
  useEffect(() => {
    if (current) router.push(current.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.href]);

  // 그 화면 안의 대상이 나타날 때까지 잠깐 기다렸다가 자리를 잰다 (페이지 전환 애니메이션 시간만큼)
  useEffect(() => {
    setRect(null);
    tries.current = 0;
    if (!current) return;
    let timer: ReturnType<typeof setTimeout>;
    const attempt = () => {
      const host = document.getElementById("phone-overlay");
      const target = document.querySelector(`[data-tour-target="${current.target}"]`);
      if (host && target) {
        const h = host.getBoundingClientRect();
        const t = target.getBoundingClientRect();
        setRect({ top: t.top - h.top, left: t.left - h.left, width: t.width, height: t.height });
        return;
      }
      tries.current += 1;
      if (tries.current > 12) {
        endTour(); // 대상을 끝내 못 찾으면(다른 곳으로 벗어난 경우) 조용히 끈다
        return;
      }
      timer = setTimeout(attempt, 100);
    };
    attempt();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.href]);

  useEffect(() => {
    if (!rect) return;
    const update = () => {
      const host = document.getElementById("phone-overlay");
      const target = current && document.querySelector(`[data-tour-target="${current.target}"]`);
      if (!host || !target) return;
      const h = host.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      setRect({ top: t.top - h.top, left: t.left - h.left, width: t.width, height: t.height });
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!rect]);

  if (!mounted || !current) return null;
  const host = document.getElementById("phone-overlay");
  if (!host) return null;

  const PAD = 8;
  const hole = rect && { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 };
  const Icon = current.icon;
  const isLast = step === TOUR_STEPS.length - 1;

  return createPortal(
    <div className="pointer-events-none absolute inset-0 z-[60]">
      {hole ? (
        <>
          <div className="pointer-events-auto absolute inset-x-0 top-0 bg-ink/60" style={{ height: hole.top }} />
          <div className="pointer-events-auto absolute inset-x-0 bottom-0 bg-ink/60" style={{ top: hole.top + hole.height }} />
          <div className="pointer-events-auto absolute bg-ink/60" style={{ top: hole.top, height: hole.height, left: 0, width: hole.left }} />
          <div className="pointer-events-auto absolute bg-ink/60" style={{ top: hole.top, height: hole.height, left: hole.left + hole.width, right: 0 }} />
          <div
            aria-hidden
            className="breathe pointer-events-none absolute rounded-2xl ring-2 ring-white"
            style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
          />
        </>
      ) : (
        <div className="pointer-events-auto absolute inset-0 bg-ink/60" />
      )}

      <div
        className="page-in-up pointer-events-auto absolute inset-x-5 rounded-[28px] bg-white p-5 shadow-[0_20px_50px_rgba(15,37,64,0.35)]"
        style={{ bottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2" aria-label={`${step! + 1} / ${TOUR_STEPS.length}`}>
            {TOUR_STEPS.map((_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-brand" : "w-2 bg-line"}`} />
            ))}
          </div>
          <button type="button" aria-label="도움말 닫기" onClick={endTour} className="-mr-1.5 flex h-9 w-9 items-center justify-center text-sub">
            <X size={20} />
          </button>
        </div>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Icon size={24} />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{current.title}</h2>
        <p className="mt-1.5 text-lg text-sub">{current.desc}</p>
        <Button size="sm" className="mt-4" onClick={() => (isLast ? endTour() : nextTourStep())}>
          {isLast ? "확인했어요" : "다음 →"}
        </Button>
      </div>
    </div>,
    host,
  );
}
