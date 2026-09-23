"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "./ui";
import { useStore } from "@/lib/store";
import { TOUR_STEPS } from "@/lib/tour";

const subscribe = () => () => {};

type Rect = { top: number; left: number; width: number; height: number; hostH: number };

// 설정에서 도움말을 켜면 서비스 흐름을 따라 실제 화면으로 이동하며,
// 그 부분만 밝게 남기고 나머지는 어둡게 가린다. 설명 글은 뜬 카드가 아니라
// 어둡게 가려진 자리 위에 바로 놓이고, 가리키는 부분을 안 가리도록 위/아래 중 자리가
// 넉넉한 쪽에 나타난다.
export default function HelpTour() {
  const step = useStore((s) => s.tourStep);
  const nextTourStep = useStore((s) => s.nextTourStep);
  const endTour = useStore((s) => s.endTour);
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [rect, setRect] = useState<Rect | null>(null);
  const tries = useRef(0);
  const scrolled = useRef(false);

  const current = step !== null && step < TOUR_STEPS.length ? TOUR_STEPS[step] : null;

  // 화면이 바뀌는 단계면 그 화면으로 실제로 들어간다 (같은 화면 안의 다음 부분이면 이동하지 않는다)
  useEffect(() => {
    if (current && pathname !== current.href) router.push(current.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // 그 부분이 화면에 나타날 때까지 잠깐씩 다시 재본다 (페이지 전환 애니메이션 시간만큼).
  // 화면이 밀려 들어오는 애니메이션(320ms)이 끝나기 전에 재면 자리가 살짝 어긋난 채로 굳어버리므로,
  // 값이 두 번 연속 똑같이 나올 때까지는 확정하지 않는다.
  // 있어도 되고 없어도 되는 부분(optional)이면, 못 찾아도 조용히 다음으로 넘어간다.
  useEffect(() => {
    setRect(null);
    tries.current = 0;
    scrolled.current = false;
    if (!current) return;
    let timer: ReturnType<typeof setTimeout>;
    let last: Rect | null = null;
    const attempt = () => {
      const host = document.getElementById("phone-overlay");
      const target = document.querySelector(`[data-tour-target="${current.target}"]`);
      if (host && target) {
        // 가리킬 부분이 화면 밖(스크롤 아래)에 있으면 보이는 자리로 직접 스크롤한다
        if (!scrolled.current) {
          scrolled.current = true;
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          timer = setTimeout(attempt, 120); // 스크롤이 끝날 때까지 기다렸다가 다시 잰다
          return;
        }
        const h = host.getBoundingClientRect();
        const t = target.getBoundingClientRect();
        const measured: Rect = { top: t.top - h.top, left: t.left - h.left, width: t.width, height: t.height, hostH: h.height };
        const same = last && last.top === measured.top && last.left === measured.left && last.width === measured.width && last.height === measured.height;
        last = measured;
        if (same) {
          setRect(measured);
          return;
        }
        timer = setTimeout(attempt, 90); // 애니메이션이 아직 진행 중일 수 있으니 다시 한번 확인한다
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
      setRect({ top: t.top - h.top, left: t.left - h.left, width: t.width, height: t.height, hostH: h.height });
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!rect]);

  if (!mounted || !current) return null;
  const host = document.getElementById("phone-overlay");
  if (!host) return null;

  const PAD = 8;
  // 화면 안쪽으로 clamp: 계산이 살짝 어긋나도 구멍이 화면 밖으로 나가 한쪽이 안 가려지는 일을 막는다
  const hole = rect && {
    top: Math.max(rect.top - PAD, 0),
    left: Math.max(rect.left - PAD, 0),
    width: Math.min(rect.width + PAD * 2, host.getBoundingClientRect().width - Math.max(rect.left - PAD, 0)),
    height: Math.max(rect.height + PAD * 2, 0),
  };
  const Icon = current.icon;
  const isLast = step === TOUR_STEPS.length - 1;
  const progress = ((step! + 1) / TOUR_STEPS.length) * 100;
  const DIM = "rgba(15, 23, 42, 0.62)"; // 어둡게 가리는 색. 뒤 화면이 알아볼 수 있게 은은히 비치는 정도
  const RADIUS = 0; // 모서리를 둥글게 깎지 않는다 (모서리 값이 실제 대상과 안 맞을 때 튀어나와 보이는 것을 막는다)

  // 가리키는 부분을 설명 글이 덮지 않도록, 아래/위 중 자리가 넉넉한 쪽을 고른다
  // (아래쪽은 하단 탭이 차지하는 자리만큼 미리 빼고 계산한다). 가리키는 부분이 화면
  // 대부분을 차지해서 위아래 어디에도 자리가 없으면, 하단에 고정해서라도 보이게 한다
  const MIN_SPACE = 150;
  const BOTTOM_RESERVE = 92;
  const spaceBelow = rect ? rect.hostH - BOTTOM_RESERVE - (hole!.top + hole!.height) : 0;
  const spaceAbove = rect ? hole!.top - 16 : 0;
  const captionStyle = !hole
    ? { top: "50%", transform: "translateY(-50%)" }
    : spaceBelow >= MIN_SPACE
      ? { top: hole.top + hole.height + 20 }
      : spaceAbove >= MIN_SPACE
        ? { bottom: rect!.hostH - hole.top + 20 }
        : { bottom: "calc(96px + env(safe-area-inset-bottom, 0px))" };

  return createPortal(
    <div className="pointer-events-none absolute inset-0 z-[60]">
      {hole ? (
        <>
          {/* 어둡게 가리기: 네 조각으로 나눠서 가운데(가리킬 부분)만 비운다.
              각 조각이 구멍 쪽 모서리만 둥글게 깎여서, 뚫린 자리가 실제 카드처럼 둥글어 보인다 */}
          <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: hole.top, backgroundColor: DIM }} />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{ top: hole.top + hole.height, backgroundColor: DIM }}
          />
          <div
            className="pointer-events-none absolute"
            style={{ top: hole.top, height: hole.height, left: 0, width: hole.left, backgroundColor: DIM, borderTopRightRadius: RADIUS, borderBottomRightRadius: RADIUS }}
          />
          <div
            className="pointer-events-none absolute"
            style={{ top: hole.top, height: hole.height, left: hole.left + hole.width, right: 0, backgroundColor: DIM, borderTopLeftRadius: RADIUS, borderBottomLeftRadius: RADIUS }}
          />
          <div
            aria-hidden
            className="ring-pulse pointer-events-none absolute ring-2 ring-white/85"
            style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height, borderRadius: RADIUS }}
          />
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0" style={{ backgroundColor: DIM }} />
      )}

      <div key={step} className="page-in-up pointer-events-auto absolute inset-x-6" style={captionStyle}>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 rounded-pill bg-white/15 py-1 pl-1.5 pr-3 text-[13px] font-semibold text-white backdrop-blur-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <Icon size={14} />
            </span>
            {current.section} · {step! + 1}/{TOUR_STEPS.length}
          </span>
          <button type="button" aria-label="도움말 닫기" onClick={endTour} className="flex h-9 w-9 items-center justify-center text-white/90">
            <X size={20} />
          </button>
        </div>
        <h2 className="mt-3 text-xl font-semibold text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">{current.title}</h2>
        <p className="mt-1.5 text-lg text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">{current.desc}</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <Button size="sm" variant="outline" flat className="mt-3" onClick={() => (isLast ? endTour() : nextTourStep())}>
          {isLast ? "확인했어요" : "다음 →"}
        </Button>
      </div>
    </div>,
    host,
  );
}
