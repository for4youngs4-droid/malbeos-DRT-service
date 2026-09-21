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
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-gradient-to-b from-white to-sky md:h-[min(844px,calc(100dvh-3rem))] md:w-[390px] md:rounded-[44px] md:border-[8px] md:border-ink md:shadow-frame">
        <main ref={mainRef} className="flex-1 overflow-y-auto pb-6">
          {children}
        </main>
        {tabs && <BottomNav />}
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
