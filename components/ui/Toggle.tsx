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
      className={`relative h-8 w-14 shrink-0 rounded-pill transition ${checked ? "bg-brand" : "bg-[#cfdfe7]"}`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? "left-[28px]" : "left-1"}`}
      />
    </button>
  );
}
