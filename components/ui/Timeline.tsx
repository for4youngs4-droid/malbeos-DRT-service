"use client";

import type { LucideIcon } from "lucide-react";
import Toggle from "./Toggle";

export type TimelineItem = {
  icon: LucideIcon;
  title: string;
  desc?: string;
  on?: boolean;
  onToggle?: (v: boolean) => void;
};

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol>
      {items.map(({ icon: Icon, title, desc, on, onToggle }, i) => (
        <li key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Icon size={28} />
            </span>
            {i < items.length - 1 && <span className="my-1 w-0.5 flex-1 bg-line" />}
          </div>
          <div className="flex flex-1 items-start justify-between gap-3 pb-6">
            <div>
              <p className="text-xl font-bold">{title}</p>
              {desc && <p className="text-lg text-sub">{desc}</p>}
            </div>
            {onToggle && <Toggle checked={!!on} onChange={onToggle} label={title} />}
          </div>
        </li>
      ))}
    </ol>
  );
}
