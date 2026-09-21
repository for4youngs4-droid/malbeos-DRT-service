import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  full?: boolean;
};

export default function Button({ variant = "primary", full = true, className = "", ...rest }: Props) {
  const color = variant === "primary" ? "bg-navy text-white shadow-card" : "bg-brand-soft text-navy";
  return (
    <button
      {...rest}
      className={`min-h-16 rounded-pill px-8 text-xl font-bold transition active:scale-[0.98] disabled:opacity-50 ${color} ${full ? "w-full" : ""} ${className}`}
    />
  );
}
