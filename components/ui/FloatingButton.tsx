"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

// 화면 오른쪽 아래에 떠 있는 동그란 버튼 (하단 탭 바로 위, 스크롤해도 그 자리)
// 휴대폰 틀 안(#phone-overlay)에 그려서 PC에서도 틀 밖으로 나가지 않는다
export default function FloatingButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  // 브라우저에서만 그린다 (서버에서는 화면 요소가 없다)
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  if (!mounted) return null;
  const host = document.getElementById("phone-overlay");
  if (!host) return null;

  return createPortal(
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ ["--rec-angle" as string]: "145deg" }}
      className="tab-pop pointer-events-auto absolute bottom-[84px] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-rec-gradient rec-3d text-white transition active:scale-95"
    >
      {children}
    </button>,
    host,
  );
}
