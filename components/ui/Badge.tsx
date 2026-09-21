import type { ReactNode } from "react";

// blue: 기본 / warn: 준비 중 같은 주의 표시(주황) / ok: 예약됨 같은 완료 표시(초록)
export default function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "warn" | "ok" }) {
  const color = { blue: "bg-brand-soft text-navy", warn: "bg-warn-soft text-warn", ok: "bg-ok-soft text-ok" }[tone];
  return <span className={`inline-block rounded-pill px-3 py-1 text-[13px] font-medium ${color}`}>{children}</span>;
}
