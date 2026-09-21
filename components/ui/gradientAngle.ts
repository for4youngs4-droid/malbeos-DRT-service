"use client";

import { useId, type CSSProperties } from "react";

// 요소마다 다른 각도의 그라데이션 (같은 요소는 항상 같은 각도)
const ANGLES = [100, 125, 150, 170, 200, 225, 255];

export function useGradientStyle(): CSSProperties {
  const id = useId();
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return { ["--rec-angle" as string]: `${ANGLES[h % ANGLES.length]}deg` };
}

export function angle(deg: number): CSSProperties {
  return { ["--rec-angle" as string]: `${deg}deg` };
}
