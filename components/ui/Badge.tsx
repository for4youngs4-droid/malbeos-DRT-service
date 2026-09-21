import type { ReactNode } from "react";

// blue: 기본 / warn: 준비 중 같은 주의 표시 (주황)
export default function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "warn" }) {
  const color = tone === "warn" ? "bg-warn-soft text-warn" : "bg-brand-soft text-navy";
  return <span className={`inline-block rounded-pill px-3 py-1 text-[13px] font-medium ${color}`}>{children}</span>;
}
