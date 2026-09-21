import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  full?: boolean;
};

export default function Button({ variant = "primary", full = true, className = "", ...rest }: Props) {
  const color =
    variant === "primary"
      ? "bg-navy text-white shadow-[0_6px_16px_rgba(26,108,159,0.22)]"
      : "bg-brand-soft text-navy";
  return (
    <button
      {...rest}
      className={`min-h-14 rounded-pill px-6 text-xl font-semibold transition active:scale-[0.98] disabled:opacity-50 ${color} ${full ? "w-full" : ""} ${className}`}
    />
  );
}
