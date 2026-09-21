import type { HTMLAttributes } from "react";

// flat: 그림자 없이 테두리만 있는 평평한 카드
export default function Card({ className = "", flat = false, ...rest }: HTMLAttributes<HTMLDivElement> & { flat?: boolean }) {
  return <div {...rest} className={`rounded-card p-5 ${flat ? "bg-white ring-1 ring-line" : "surface ring-1 ring-line/60"} ${className}`} />;
}
