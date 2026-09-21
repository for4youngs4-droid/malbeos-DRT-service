"use client";

type Props = { checked: boolean; onChange: (v: boolean) => void; label?: string };

export default function Toggle({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-10 w-[68px] shrink-0 rounded-pill transition ${checked ? "bg-navy" : "bg-line"}`}
    >
      <span
        className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow transition-all ${checked ? "left-[34px]" : "left-1"}`}
      />
    </button>
  );
}
