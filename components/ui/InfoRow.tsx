import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = { icon: LucideIcon; title: string; desc?: string; right?: ReactNode };

export default function InfoRow({ icon: Icon, title, desc, right }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xl font-bold">{title}</p>
        {desc && <p className="text-lg text-sub">{desc}</p>}
      </div>
      {right}
    </div>
  );
}
