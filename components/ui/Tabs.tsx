"use client";

import { useGradientStyle } from "./gradientAngle";

type Props = { items: string[]; value: string; onChange: (v: string) => void };

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const grad = useGradientStyle();
  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? grad : undefined}
      className={`min-h-10 shrink-0 rounded-pill px-4 text-lg transition ${
        active
          ? "bg-rec-gradient rec-3d font-semibold text-white [text-shadow:0_1px_2px_rgba(15,37,64,0.3)]"
          : "raised font-medium text-sub"
      }`}
    >
      {label}
    </button>
  );
}

export default function Tabs({ items, value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((t) => (
        <TabButton key={t} label={t} active={t === value} onClick={() => onChange(t)} />
      ))}
    </div>
  );
}
