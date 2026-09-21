import type { ReactNode } from "react";
import BottomNav from "./BottomNav";

// PC: 390px 휴대폰 틀 / 휴대폰: 전체 화면
export default function PhoneFrame({ children, tabs = false }: { children: ReactNode; tabs?: boolean }) {
  return (
    <div className="flex min-h-dvh items-center justify-center md:p-6">
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-gradient-to-b from-white to-sky md:h-[min(844px,calc(100dvh-3rem))] md:w-[390px] md:rounded-[44px] md:border-[8px] md:border-ink md:shadow-frame">
        <main className="flex-1 overflow-y-auto pb-6">{children}</main>
        {tabs && <BottomNav />}
      </div>
    </div>
  );
}
