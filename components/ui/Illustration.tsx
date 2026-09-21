"use client";

import { useEffect, useRef, useState } from "react";

// /public/images/{name}.png 를 보여주고, 없으면 연한 파랑 둥근 사각형
export default function Illustration({ name, className = "h-48 w-full" }: { name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // 화면이 뜨기 전에 이미 실패한 이미지도 잡는다
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [name]);

  if (failed) return <div className={`rounded-card bg-brand-soft ${className}`} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={`/images/${name}.png`}
      alt=""
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  );
}
