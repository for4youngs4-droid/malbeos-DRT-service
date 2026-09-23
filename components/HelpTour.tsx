"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { CalendarCheck, Clock, Users, X } from "lucide-react";
import { Button } from "./ui";
import { useStore } from "@/lib/store";

const subscribe = () => () => {};

// 핵심 기능 3가지를 하단 탭에 맞춰 하나씩 안내한다 (CLAUDE.md 핵심 기능 순서: Routine → Chain → Community)
const STEPS = [
  {
    href: "/rider/routines",
    icon: Clock,
    title: "반복되는 이동, 먼저 알려드려요",
    desc: "자주 다니시는 길을 스스로 찾아내고, 시간이 되면 미리 여쭤봐요.",
    cta: "내 루틴 눌러보기",
  },
  {
    href: "/rider/chain",
    icon: CalendarCheck,
    title: "가는 길과 오는 길을 한 번에",
    desc: "예약하시면 가는 편과 오는 편을 하루 계획으로 모아서 보여드려요.",
    cta: "내 이동 눌러보기",
  },
  {
    href: "/rider",
    icon: Users,
    title: "같은 방향이면 함께 타요",
    desc: "비슷한 시간, 같은 방향으로 가는 분이 있으면 차 한 대로 함께 모셔다드려요.",
    cta: "홈에서 마이크 눌러보기",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

// 설정에서 도움말을 켜면, 하단 탭 중 해당 기능을 빼고 나머지를 어둡게 덮어 자연스럽게 눌러보도록 이끈다
export default function HelpTour() {
  const step = useStore((s) => s.tourStep);
  const nextTourStep = useStore((s) => s.nextTourStep);
  const endTour = useStore((s) => s.endTour);
  const pathname = usePathname();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [rect, setRect] = useState<Rect | null>(null);

  const current = step !== null && step < STEPS.length ? STEPS[step] : null;

  // 안내 중인 탭을 실제로 누르면 자동으로 다음 단계로
  useEffect(() => {
    if (current && pathname === current.href) nextTourStep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // 가리킬 탭의 위치를 찾는다 (창 크기가 바뀌어도 다시 잰다)
  useEffect(() => {
    if (!current) return;
    const update = () => {
      const host = document.getElementById("phone-overlay");
      const target = document.querySelector(`[data-tour="${current.href}"]`);
      if (!host || !target) return setRect(null);
      const h = host.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      setRect({ top: t.top - h.top, left: t.left - h.left, width: t.width, height: t.height });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [current]);

  if (!mounted || !current) return null;
  const host = document.getElementById("phone-overlay");
  if (!host) return null;

  const PAD = 6;
  const hole = rect && { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 };
  const Icon = current.icon;

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

      <div className="page-in-up pointer-events-auto absolute inset-x-5 rounded-[28px] bg-white p-5 shadow-[0_20px_50px_rgba(15,37,64,0.35)]" style={{ bottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2" aria-label={`${step! + 1} / ${STEPS.length}`}>
            {STEPS.map((_, i) => (
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
        <Button size="sm" className="mt-4" onClick={nextTourStep}>
          {step === STEPS.length - 1 ? "확인했어요" : `${current.cta} →`}
        </Button>
      </div>
    </div>,
    host,
  );
}
