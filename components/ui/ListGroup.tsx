import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// 한 카드 안에 줄로 나뉜 목록 (설정, 기록, 탑승 순서 등)
export function ListGroup({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-line overflow-hidden rounded-card bg-white shadow-card ring-1 ring-line/70">{children}</div>;
}

type RowProps = {
  icon?: LucideIcon;
  lead?: ReactNode; // 아이콘 대신 앞에 넣을 것 (번호 등)
  title: string;
  desc?: string;
  right?: ReactNode;
};

export function ListRow({ icon: Icon, lead, title, desc, right }: RowProps) {
  return (
    <div className="flex min-h-16 items-center gap-3 px-5 py-3">
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Icon size={20} />
        </span>
      )}
      {lead}
      <div className="min-w-0 flex-1">
        <p className="text-xl font-medium">{title}</p>
        {desc && <p className="text-lg text-sub">{desc}</p>}
      </div>
      {right}
    </div>
  );
}
