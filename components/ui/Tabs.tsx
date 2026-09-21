"use client";

type Props = { items: string[]; value: string; onChange: (v: string) => void };

export default function Tabs({ items, value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {items.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`min-h-12 shrink-0 rounded-pill px-5 text-lg font-bold ${
            t === value ? "bg-brand text-white" : "bg-white text-sub"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
