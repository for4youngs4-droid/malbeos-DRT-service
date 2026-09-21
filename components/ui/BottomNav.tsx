"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Home, Menu, Mic, Repeat } from "lucide-react";

const tabs = [
  { href: "/rider", label: "홈", icon: Home },
  { href: "/rider/voice", label: "음성예약", icon: Mic },
  { href: "/rider/chain", label: "이동계획", icon: CalendarCheck },
  { href: "/rider/routines", label: "내 루틴", icon: Repeat },
  { href: "/rider/more", label: "더보기", icon: Menu },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="flex shrink-0 border-t border-line bg-white/95 pb-2">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[14px] font-bold ${
              active ? "text-brand" : "text-sub"
            }`}
          >
            <Icon size={24} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
