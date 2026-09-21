"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Home, Repeat, Settings } from "lucide-react";

const tabs = [
  { href: "/rider", label: "홈", icon: Home },
  { href: "/rider/chain", label: "내 이동", icon: CalendarCheck },
  { href: "/rider/routines", label: "내 루틴", icon: Repeat },
  { href: "/rider/more", label: "설정", icon: Settings },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="flex shrink-0 border-t border-line/70 bg-white/95 pb-2 shadow-[0_-8px_20px_rgba(32,127,186,0.10)] backdrop-blur">
      {tabs.map(({ href, label, icon: Icon }) => {
        // 함께 타기 화면은 "내 이동" 안에서 열리므로 내 이동 탭을 켜 둔다
        const active = path === href || (href === "/rider/chain" && path === "/rider/together");
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[12px] ${
              active ? "font-semibold text-brand" : "font-medium text-sub"
            }`}
          >
            <span className={`flex h-8 w-11 items-center justify-center rounded-[12px] ${active ? "tile text-white" : ""}`}>
              <Icon size={20} strokeWidth={active ? 2.2 : 1.75} />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
