"use client";

import { createContext, useContext, type ReactNode, type Ref } from "react";
import BottomNav from "./BottomNav";

// 이미 휴대폰 틀 안(/rider 공통 레이아웃)에 있는지 알려주는 표시
const InShell = createContext(false);

export function ShellProvider({ children }: { children: ReactNode }) {
  return <InShell.Provider value>{children}</InShell.Provider>;
}

// PC: 390px 휴대폰 틀 / 휴대폰: 전체 화면
export function PhoneChrome({
  children,
  tabs = false,
  mainRef,
}: {
  children: ReactNode;
  tabs?: boolean;
  mainRef?: Ref<HTMLElement>;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center md:p-6">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-gradient-to-b from-white to-sky md:h-[min(844px,calc(100dvh-3rem))] md:w-[390px] md:rounded-[44px] md:border-[3px] md:border-[#d3dbe6] md:shadow-frame">
        {/* 상태바(시간·배터리) 자리: 폰의 노치·상태바 높이 + 여유 16px. 스크롤해도 내용이 이 아래로 올라오지 않는다 */}
        <div aria-hidden className="h-[calc(env(safe-area-inset-top,0px)+1rem)] shrink-0" />
        <main ref={mainRef} className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </main>
        {tabs && <BottomNav />}
        <div id="phone-overlay" className="pointer-events-none absolute inset-0 z-50" />
      </div>
    </div>
  );
}

// 각 화면이 쓰는 틀. /rider 안에서는 공통 레이아웃이 틀과 하단 탭을 이미 고정해 두므로 내용만 그린다
export default function PhoneFrame({ children, tabs = false }: { children: ReactNode; tabs?: boolean }) {
  const inShell = useContext(InShell);
  if (inShell) return <>{children}</>;
  return <PhoneChrome tabs={tabs}>{children}</PhoneChrome>;
}
