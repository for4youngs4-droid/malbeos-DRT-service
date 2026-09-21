"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mic, Menu } from "lucide-react";

const tabs = [
  { href: "/rider", label: "홈", icon: Home },
  { href: "/rider/voice", label: "음성예약", icon: Mic },
  { href: "/rider/more", label: "더보기", icon: Menu },
];

// 더보기 아래 화면(내 루틴)에서도 더보기 탭을 켜둔다
const isActive = (href: string, path: string) =>
  href === "/rider/more" ? path === href || path === "/rider/routines" : path === href;

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="flex shrink-0 border-t border-line bg-white/95 pb-2">
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = isActive(href, path);
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-lg font-bold ${
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
