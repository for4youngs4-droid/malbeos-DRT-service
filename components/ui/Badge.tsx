import type { ReactNode } from "react";

// blue: 기본 / warn: 준비 중 같은 주의 표시(주황) / ok: 예약됨 같은 완료 표시(초록)
export default function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "warn" | "ok" }) {
  const color = { blue: "bg-brand-soft text-navy", warn: "bg-warn-soft text-warn", ok: "bg-ok-soft text-ok" }[tone];
  return <span className={`inline-block rounded-pill px-3 py-1 text-[13px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_3px_rgba(15,37,64,0.12)] ${color}`}>{children}</span>;
}
