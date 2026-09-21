"use client";

type Props = { items: string[]; value: string; onChange: (v: string) => void };

export default function Tabs({ items, value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`min-h-10 shrink-0 rounded-pill px-4 text-lg transition ${
            t === value ? "bg-navy font-semibold text-white" : "bg-white font-medium text-sub ring-1 ring-line"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
