"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";

type Props = { title?: string; left?: "back" | "close" | "none"; right?: ReactNode };

export default function TopBar({ title, left = "none", right }: Props) {
  const router = useRouter();
  return (
    <header className="px-5 pt-5">
      {(left !== "none" || right) && (
        <div className="flex items-center justify-between">
          {left !== "none" ? (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label={left === "back" ? "뒤로" : "닫기"}
              className="-ml-2 flex h-14 w-14 items-center justify-center text-ink"
            >
              {left === "back" ? <ChevronLeft size={36} /> : <X size={32} />}
            </button>
          ) : (
            <span />
          )}
          {right}
        </div>
      )}
      {title && <h1 className="mt-2 text-[28px] font-bold leading-snug">{title}</h1>}
    </header>
  );
}
