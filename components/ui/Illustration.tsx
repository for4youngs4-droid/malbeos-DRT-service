"use client";

import { useState } from "react";

// /public/images/{name}.png 를 보여주고, 없으면 연한 파랑 둥근 사각형
export default function Illustration({ name, className = "h-48 w-full" }: { name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className={`rounded-card bg-brand-soft ${className}`} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/images/${name}.png`}
      alt=""
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  );
}
