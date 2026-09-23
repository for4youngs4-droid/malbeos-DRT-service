"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button, Illustration, PhoneFrame } from "@/components/ui";
import { angle } from "@/components/ui/gradientAngle";

const subscribe = () => () => {};

// 로고 시작 화면: 폰 틀 전체(상단 상태바 자리·하단 여백까지)를 덮도록 #phone-overlay에 그린다
function IntroSplash({ onStart }: { onStart: () => void }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  if (!mounted) return null;
  const host = document.getElementById("phone-overlay");
  if (!host) return null;

  return createPortal(
    <div
      className="pointer-events-auto absolute inset-0 z-50 flex flex-col items-center bg-rec-gradient px-6 text-center"
      style={angle(160)}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-9">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <span aria-hidden className="breathe absolute inset-0 rounded-full bg-white/15" />
          <Illustration name="brand-symbol" className="splash-in relative h-24 w-full" />
        </div>
        <Illustration name="brand-wordmark" className="splash-in h-12 w-40 [animation-delay:150ms]" />
      </div>
      <div className="w-full pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-4">
        <Button variant="outline" flat onClick={onStart} className="splash-in [animation-delay:300ms]">
          시작하기
        </Button>
      </div>
    </div>,
    host,
  );
}

const SLIDES = [
  {
    title: "당신의 이동을\n먼저 생각하는 DRT",
    desc: "말로 부르면 오는 버스, 말벗이 가장 편한 방법으로 알려드려요",
    button: "시작하기",
  },
  {
    title: "말로 부르면,\n바로 오는 버스",
    desc: "복잡한 조작 없이, 음성으로 간편하게 예약할 수 있어요",
    button: "다음",
  },
  {
    title: "당신의 이동 패턴을\n먼저 예측해요",
    desc: "반복되는 이동을 학습하고 필요할 때 먼저 알려드려요",
    button: "다음",
  },
  {
    title: "함께 이동해\n더 효율적으로",
    desc: "비슷한 이동 수요를 가진 사람들을 연결해 차량을 효율적으로 운영해요",
    button: "시작하기",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = (i: number) => setIndex(Math.max(0, Math.min(SLIDES.length - 1, i)));

  const next = () => {
    if (index === SLIDES.length - 1) router.push("/rider");
    else go(index + 1);
  };

  return (
    <PhoneFrame>
      {showIntro && <IntroSplash onStart={() => setShowIntro(false)} />}
      <div
        className="flex min-h-full flex-col"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
          touchX.current = null;
        }}
      >
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {SLIDES.map((s, i) => (
              <section key={i} className="w-full shrink-0 px-6 pt-10">
                <Illustration name={`onboarding-${i + 1}`} className="h-64 w-full" />
                <h1 className="mt-8 whitespace-pre-line text-[22px] font-semibold leading-snug tracking-tight">{s.title}</h1>
                <p className="mt-4 text-lg text-sub">{s.desc}</p>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-auto px-6 pt-8">
          <div className="mb-6 flex justify-center gap-3" aria-label={`${index + 1} / ${SLIDES.length}`}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}번째 장으로`}
                onClick={() => go(i)}
                className={`h-3 rounded-full transition-all ${i === index ? "w-8 bg-brand" : "w-3 bg-line"}`}
              />
            ))}
          </div>
          <Button onClick={next}>
            {SLIDES[index].button}
          </Button>
        </div>
      </div>
    </PhoneFrame>
  );
}
