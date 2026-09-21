"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PhoneChrome, ShellProvider } from "@/components/ui/PhoneFrame";

// 하단 탭 순서. 함께 타기는 내 이동 안에서 열린다
const TAB_PATHS = ["/rider", "/rider/chain", "/rider/routines", "/rider/more"];
const tabIndex = (path: string) => TAB_PATHS.indexOf(path === "/rider/together" ? "/rider/chain" : path);

// /rider 아래 모든 화면의 공통 틀: 휴대폰 틀과 하단 탭은 그대로 두고, 내용만 방향에 맞춰 부드럽게 바뀐다
export default function RiderLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  const idx = tabIndex(path);
  const showTabs = idx >= 0 || path === "/rider/together";
  const mainRef = useRef<HTMLElement>(null);

  // 이전 탭보다 오른쪽 탭이면 오른쪽에서, 왼쪽 탭이면 왼쪽에서 들어온다
  const [prevIdx, setPrevIdx] = useState(idx);
  const [dir, setDir] = useState(0);
  if (idx !== prevIdx) {
    setPrevIdx(idx);
    setDir(idx < 0 || prevIdx < 0 ? 0 : idx > prevIdx ? 1 : -1);
  }

  // 화면이 바뀌면 맨 위부터 보여준다
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [path]);

  const motion = dir > 0 ? "page-in-right" : dir < 0 ? "page-in-left" : "page-in-up";

  return (
    <PhoneChrome tabs={showTabs} mainRef={mainRef}>
      <ShellProvider>
        {/* 밀려 들어오는 동안 삐져나가는 부분을 잘라서 스크롤바가 생기지 않게 한다 */}
        <div className="overflow-hidden">
          <div key={path} className={motion}>
            {children}
          </div>
        </div>
      </ShellProvider>
    </PhoneChrome>
  );
}
