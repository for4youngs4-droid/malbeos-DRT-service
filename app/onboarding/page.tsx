"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Illustration, PhoneFrame } from "@/components/ui";
import { speak, stopSpeaking } from "@/lib/speech";

const SLIDES = [
  {
    title: "말로 부르면 오는\n수요응답형 버스, DRT",
    desc: "AI가 당신의 이동을 먼저 생각하고 가장 편한 방법으로 알려드려요.",
    button: "시작하기",
  },
  {
    title: "말로 예약하고,\n편하게 이동하세요",
    desc: "복잡한 조작 없이 음성으로 간편하게 이용할 수 있어요.",
    button: "다음",
  },
  {
    title: "가는 길도, 오는 길도\n한 번에",
    desc: "왕복·연계 이동을 고려해 하루의 이동 과정을 함께 계획해드려요.",
    button: "다음",
  },
  {
    title: "함께 이동해\n더 효율적으로",
    desc: "비슷한 이동 수요를 가진 사람들을 연결해 차량을 효율적으로 운영해요.",
    button: "시작하기",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  // 장이 바뀔 때마다 음성으로 읽기
  useEffect(() => {
    const s = SLIDES[index];
    speak(`${s.title.replace("\n", " ")}. ${s.desc}`);
    return stopSpeaking;
  }, [index]);

  const go = (i: number) => setIndex(Math.max(0, Math.min(SLIDES.length - 1, i)));

  const next = () => {
    if (index === SLIDES.length - 1) router.push("/rider");
    else go(index + 1);
  };

  return (
    <PhoneFrame>
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
          <Button onClick={next}>{SLIDES[index].button}</Button>
        </div>
      </div>
    </PhoneFrame>
  );
}
