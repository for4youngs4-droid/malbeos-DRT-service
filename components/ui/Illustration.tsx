"use client";

import { useEffect, useState } from "react";

// /public/images/{name}.png 를 보여주고, 없으면 연한 파랑 둥근 사각형.
// 파일이 실제로 불러와졌을 때만 이미지를 그린다 (깨진 이미지 아이콘 방지)
export default function Illustration({ name, className = "h-48 w-full" }: { name: string; className?: string }) {
  const [loaded, setLoaded] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(name);
    img.src = `/images/${name}.png`;
  }, [name]);

  if (loaded !== name) return <div className={`rounded-card bg-brand-soft ${className}`} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/images/${name}.png`} alt="" className={`object-contain ${className}`} />
  );
}
