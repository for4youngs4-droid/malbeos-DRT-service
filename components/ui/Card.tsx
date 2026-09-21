import type { HTMLAttributes } from "react";

export default function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={`rounded-card bg-white p-5 shadow-card ring-1 ring-line/70 ${className}`} />;
}
