import type { ReactNode } from "react";

export default function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-pill bg-brand-soft px-4 py-1 text-lg font-bold text-navy">
      {children}
    </span>
  );
}
