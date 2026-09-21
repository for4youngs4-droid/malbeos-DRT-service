import type { HTMLAttributes } from "react";

// flat: 볼록한 그라데이션·하이라이트 없이, 바닥에 떨어지는 부드러운 그림자만 있는 카드
export default function Card({ className = "", flat = false, ...rest }: HTMLAttributes<HTMLDivElement> & { flat?: boolean }) {
  return <div {...rest} className={`rounded-card p-5 ${flat ? "bg-white shadow-[0_6px_20px_rgba(32,127,186,0.10)] ring-1 ring-line/50" : "surface ring-1 ring-line/60"} ${className}`} />;
}
