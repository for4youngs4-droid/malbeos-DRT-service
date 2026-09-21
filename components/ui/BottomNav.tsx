"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Clock, Home, Settings } from "lucide-react";
import { CalendarCheckSolid, ClockSolid, HomeSolid, SettingsSolid } from "./SolidIcons";

const tabs = [
  { href: "/rider", label: "홈", icon: Home, solid: HomeSolid },
  { href: "/rider/chain", label: "내 이동", icon: CalendarCheck, solid: CalendarCheckSolid },
  { href: "/rider/routines", label: "내 루틴", icon: Clock, solid: ClockSolid },
  { href: "/rider/more", label: "설정", icon: Settings, solid: SettingsSolid },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="flex shrink-0 border-t border-line/70 bg-white/95 pb-2 shadow-[0_-8px_20px_rgba(32,127,186,0.10)] backdrop-blur">
      {tabs.map(({ href, label, icon: Icon, solid: Solid }) => {
        // 함께 타기 화면은 "내 이동" 안에서 열리므로 내 이동 탭을 켜 둔다
        const active = path === href || (href === "/rider/chain" && path === "/rider/together");
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[12px] transition-colors duration-200 ${
              active ? "font-semibold text-brand" : "font-medium text-sub"
            }`}
          >
            <span className={`flex h-8 w-11 items-center justify-center ${active ? "tab-pop" : ""}`}>
              {active ? <Solid size={26} /> : <Icon size={24} strokeWidth={1.75} />}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
