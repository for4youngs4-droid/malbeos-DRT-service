import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = { icon: LucideIcon; title: string; desc?: string; right?: ReactNode };

export default function InfoRow({ icon: Icon, title, desc, right }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-brand text-white">
        <Icon size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xl font-semibold">{title}</p>
        {desc && <p className="text-lg text-sub">{desc}</p>}
      </div>
      {right}
    </div>
  );
}
