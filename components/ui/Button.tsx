"use client";

import type { ButtonHTMLAttributes } from "react";
import { useGradientStyle } from "./gradientAngle";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline";
  size?: "md" | "sm";
  full?: boolean;
  gradient?: boolean; // 브랜드 그라데이션 효과 (홈 화면에서만 켠다)
};

const COLOR = {
  primary: "bg-brand text-white shadow-[0_4px_10px_rgba(32,127,186,0.25)]",
  gradient: "bg-rec-gradient rec-3d text-white [text-shadow:0_1px_2px_rgba(15,37,64,0.3)]",
  secondary: "raised-blue text-navy",
  outline: "raised text-navy ring-1 ring-brand/30",
};
const SIZE = { md: "min-h-14 px-6 text-xl", sm: "min-h-11 px-5 text-lg" };

export default function Button({ variant = "primary", size = "md", full = true, gradient = false, className = "", style, ...rest }: Props) {
  const grad = useGradientStyle();
  const fancy = variant === "primary" && gradient;
  return (
    <button
      {...rest}
      style={fancy ? { ...grad, ...style } : style}
      className={`rounded-pill font-semibold transition active:scale-[0.98] disabled:opacity-50 ${SIZE[size]} ${fancy ? COLOR.gradient : COLOR[variant]} ${full ? "w-full" : ""} ${className}`}
    />
  );
}
