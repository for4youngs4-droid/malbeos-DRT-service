import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
  size?: "md" | "sm";
  full?: boolean;
};

const COLOR = {
  primary: "bg-brand-button text-white shadow-[0_8px_20px_rgba(26,108,159,0.25)]",
  secondary: "bg-brand-soft text-navy",
  outline: "bg-white text-navy ring-1 ring-brand/40",
};
const SIZE = { md: "min-h-14 px-6 text-xl", sm: "min-h-11 px-5 text-lg" };

export default function Button({ variant = "primary", size = "md", full = true, className = "", ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`rounded-pill font-semibold transition active:scale-[0.98] disabled:opacity-50 ${SIZE[size]} ${COLOR[variant]} ${full ? "w-full" : ""} ${className}`}
    />
  );
}
