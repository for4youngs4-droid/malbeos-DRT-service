import type { ReactNode } from "react";

export default function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-pill bg-brand-soft px-3 py-1 text-[13px] font-medium text-navy">
      {children}
    </span>
  );
}
