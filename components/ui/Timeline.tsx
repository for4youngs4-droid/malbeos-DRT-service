"use client";

import type { LucideIcon } from "lucide-react";
import Toggle from "./Toggle";

export type TimelineItem = {
  icon: LucideIcon;
  title: string;
  desc?: string;
  tag?: string; // 예: "따로 이동"
  dim?: boolean; // 흐리게
  on?: boolean;
  onToggle?: (v: boolean) => void;
};

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol>
      {items.map(({ icon: Icon, title, desc, tag, dim, on, onToggle }, i) => (
        <li key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Icon size={22} />
            </span>
            {i < items.length - 1 && <span className="my-1 w-0.5 flex-1 bg-line" />}
          </div>
          <div className="flex flex-1 items-start justify-between gap-3 pb-6">
            <div className={dim ? "opacity-50" : ""}>
              <p className="text-xl font-semibold">{title}</p>
              {desc && <p className="text-lg text-sub">{desc}</p>}
              {tag && <p className="mt-1 text-lg font-medium text-brand">{tag}</p>}
            </div>
            {onToggle && <Toggle checked={!!on} onChange={onToggle} label={title} />}
          </div>
        </li>
      ))}
    </ol>
  );
}
