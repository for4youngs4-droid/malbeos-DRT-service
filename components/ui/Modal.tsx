"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// 휴대폰 화면 안에서 아래에서 올라오는 모달 (PC에서도 화면 전체가 아니라 휴대폰 틀 안에만 뜬다)
export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  // Esc로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const host = document.getElementById("phone-overlay") ?? document.body;

  return createPortal(
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-backdrop absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="modal-sheet relative max-h-[90%] w-full overflow-y-auto rounded-t-[36px] bg-white px-5 pb-8 pt-3 shadow-[0_-12px_40px_rgba(15,37,64,0.2)]">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
          <button type="button" aria-label="닫기" onClick={onClose} className="-mr-2 flex h-11 w-11 items-center justify-center text-ink">
            <X size={26} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    host,
  );
}
