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
      className={`relative h-8 w-14 shrink-0 rounded-pill transition ${checked ? "bg-rec-gradient shadow-[inset_0_2px_5px_rgba(15,37,64,0.35)]" : "bg-[#d3deea] shadow-[inset_0_2px_5px_rgba(15,37,64,0.2)]"}`}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-gradient-to-b from-white to-[#e4edf6] shadow-[0_2px_5px_rgba(15,37,64,0.35),inset_0_1px_0_#fff] transition-all ${checked ? "left-[28px]" : "left-1"}`}
      />
    </button>
  );
}
