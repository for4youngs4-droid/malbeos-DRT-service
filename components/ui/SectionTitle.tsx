import type { ReactNode } from "react";

// 카드 위에 붙는 작은 제목 (예: "예정된 이동")
export default function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="px-1 pt-1 text-xl font-semibold">{children}</h2>;
}
