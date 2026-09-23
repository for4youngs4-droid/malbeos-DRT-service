"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CalendarCheck, CalendarClock, Clock, Mic, Users, X } from "lucide-react";
import { Button } from "./ui";
import { useStore } from "@/lib/store";

const subscribe = () => () => {};

// 서비스 흐름을 그대로 따라가며 실제 화면 안의 진짜 부분을 하나씩 짚어준다.
// 화면(section) 하나가 끝나면 다음 화면으로 실제로 이동해서 이어간다.
// optional: 지금 데이터로는 없을 수 있는 부분(예: 예약이 아직 없을 때의 "함께 타기")이라,
//           화면에 없으면 조용히 건너뛴다.
export const TOUR_STEPS = [
  {
    section: "홈",
    href: "/rider",
    target: "home-mic",
    icon: Mic,
    title: "말로 편하게 예약해요",
    desc: "마이크를 누르고 “내일 병원 가고 싶어요”처럼 편하게 말씀해보세요. 예약이 그 자리에서 끝나요.",
  },
  {
    section: "홈",
    href: "/rider",
    target: "home-next",
    icon: CalendarClock,
    title: "예약한 이동을 한눈에",
    desc: "예약하시면 다음 이동이 바로 여기에 나타나요. 눌러서 자세히 볼 수 있어요.",
  },
  {
    section: "홈",
    href: "/rider",
    target: "home-alert",
    icon: Bell,
    title: "루틴은 미리 알려드려요",
    desc: "자주 다니시는 길이 있으면, 하루 전 저녁에 여기 알림으로 먼저 여쭤봐요.",
  },
  {
    section: "내 이동",
    href: "/rider/chain",
    target: "chain",
    icon: CalendarCheck,
    title: "가는 길과 오는 길을 한 번에",
    desc: "예약하시면 가는 편과 오는 편을 하루 계획으로 모아서 여기에 보여드려요.",
  },
  {
    section: "내 이동",
    href: "/rider/chain",
    target: "chain-together",
    icon: Users,
    title: "같은 방향이면 자동으로 함께",
    desc: "비슷한 시간, 같은 방향으로 가는 분이 있으면 차 한 대로 묶어서 알려드려요.",
    optional: true, // 예약이 없으면 이 카드가 없어서 조용히 건너뛴다
  },
  {
    section: "내 루틴",
    href: "/rider/routines",
    target: "routine-upcoming",
    icon: CalendarClock,
    title: "곧 있을 루틴도 바로 예약",
    desc: "루틴으로 찾은 다음 이동을 여기서 바로 예약할 수 있어요.",
  },
  {
    section: "내 루틴",
    href: "/rider/routines",
    target: "routine",
    icon: Clock,
    title: "알림, 직접 켜고 끌 수 있어요",
    desc: "필요 없는 루틴은 알림을 꺼 두시면 다시 여쭤보지 않아요.",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

// 설정에서 도움말을 켜면 서비스 흐름을 따라 실제 화면으로 이동하며,
// 그 안의 핵심 부분만 남기고 나머지는 어둡게 가린다
export default function HelpTour() {
  const step = useStore((s) => s.tourStep);
  const nextTourStep = useStore((s) => s.nextTourStep);
  const endTour = useStore((s) => s.endTour);
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [rect, setRect] = useState<Rect | null>(null);
  const tries = useRef(0);

  const current = step !== null && step < TOUR_STEPS.length ? TOUR_STEPS[step] : null;

  // 화면이 바뀌는 단계면 그 화면으로 실제로 들어간다 (같은 화면 안의 다음 부분이면 이동하지 않는다)
  useEffect(() => {
    if (current && pathname !== current.href) router.push(current.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // 그 부분이 화면에 나타날 때까지 잠깐씩 다시 재본다 (페이지 전환 애니메이션 시간만큼).
  // 있어도 되고 없어도 되는 부분(optional)이면, 못 찾아도 조용히 다음으로 넘어간다.
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
      if (tries.current > 40) {
        if (current.optional) nextTourStep();
        else endTour(); // 꼭 있어야 할 부분을 끝내 못 찾으면(다른 곳으로 벗어난 경우) 조용히 끈다
        return;
      }
      timer = setTimeout(attempt, 120);
    };
    attempt();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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
  const hole = rect && { top: rect.top - PAD, left: rect.left - PAD, width: Math.max(rect.width + PAD * 2, 0), height: Math.max(rect.height + PAD * 2, 0) };
  const Icon = current.icon;
  const isLast = step === TOUR_STEPS.length - 1;
  const progress = ((step! + 1) / TOUR_STEPS.length) * 100;
  const DIM = "rgba(15, 23, 42, 0.72)"; // 어둡게 가리는 색 (투명도 유틸 클래스 대신 직접 지정해 어느 기기에서도 확실히 보이게 한다)

  return createPortal(
    <div className="pointer-events-none absolute inset-0 z-[60]">
      {hole ? (
        <>
          <div className="pointer-events-auto absolute inset-x-0 top-0" style={{ height: hole.top, backgroundColor: DIM }} />
          <div className="pointer-events-auto absolute inset-x-0 bottom-0" style={{ top: hole.top + hole.height, backgroundColor: DIM }} />
          <div className="pointer-events-auto absolute" style={{ top: hole.top, height: hole.height, left: 0, width: hole.left, backgroundColor: DIM }} />
          <div className="pointer-events-auto absolute" style={{ top: hole.top, height: hole.height, left: hole.left + hole.width, right: 0, backgroundColor: DIM }} />
          <div
            aria-hidden
            className="breathe pointer-events-none absolute rounded-2xl ring-2 ring-white"
            style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}
          />
        </>
      ) : (
        <div className="pointer-events-auto absolute inset-0" style={{ backgroundColor: DIM }} />
      )}

      <div
        key={step}
        className="page-in-up pointer-events-auto absolute inset-x-5 rounded-[28px] bg-white p-5 shadow-[0_20px_50px_rgba(15,37,64,0.35)]"
        style={{ bottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-pill bg-brand-soft px-3 py-1 text-[13px] font-semibold text-brand">{current.section}</span>
          <button type="button" aria-label="도움말 닫기" onClick={endTour} className="-mr-1.5 flex h-9 w-9 items-center justify-center text-sub">
            <X size={20} />
          </button>
        </div>
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Icon size={24} />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">{current.title}</h2>
        <p className="mt-1.5 text-lg text-sub">{current.desc}</p>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" aria-label={`${step! + 1} / ${TOUR_STEPS.length}`}>
            <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[13px] text-sub">
            {step! + 1} / {TOUR_STEPS.length}
          </span>
        </div>
        <Button size="sm" className="mt-3" onClick={() => (isLast ? endTour() : nextTourStep())}>
          {isLast ? "확인했어요" : "다음 →"}
        </Button>
      </div>
    </div>,
    host,
  );
}
