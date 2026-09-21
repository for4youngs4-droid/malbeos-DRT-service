"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Home, Menu, Repeat } from "lucide-react";

const tabs = [
  { href: "/rider", label: "홈", icon: Home },
  { href: "/rider/chain", label: "이동계획", icon: CalendarCheck },
  { href: "/rider/routines", label: "내 루틴", icon: Repeat },
  { href: "/rider/more", label: "더보기", icon: Menu },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="flex shrink-0 border-t border-line bg-white/90 pb-2 backdrop-blur">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = path === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[12px] ${
              active ? "font-semibold text-brand" : "font-medium text-sub"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
