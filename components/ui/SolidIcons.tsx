// 하단 탭에서 선택됐을 때 쓰는 꽉 찬(솔리드) 아이콘
// 선 아이콘(lucide)과 같은 24x24 격자에 맞춰 그렸다. 색은 currentColor
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: P) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...rest}>
      {children}
    </svg>
  );
}

export function HomeSolid(p: P) {
  return (
    <Svg {...p}>
      <path d="M11.2 2.9a1.2 1.2 0 0 1 1.6 0l8.4 7.4c.5.4.2 1.2-.5 1.2H20v8.3c0 .8-.7 1.5-1.5 1.5h-3.8v-5.6a1 1 0 0 0-1-1h-3.4a1 1 0 0 0-1 1v5.6H5.5C4.7 21.7 4 21 4 20.2v-8.7H3.3c-.7 0-1-.8-.5-1.2l8.4-7.4Z" />
    </Svg>
  );
}

export function CalendarCheckSolid(p: P) {
  return (
    <Svg {...p}>
      <mask id="solid-cal-check">
        <rect width="24" height="24" fill="white" />
        <path d="m8.4 14.4 2.5 2.5 4.8-5" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </mask>
      <g mask="url(#solid-cal-check)">
        <rect x="2.5" y="4" width="19" height="17.5" rx="4" />
        <rect x="6.5" y="1.8" width="2.2" height="4.6" rx="1.1" />
        <rect x="15.3" y="1.8" width="2.2" height="4.6" rx="1.1" />
      </g>
    </Svg>
  );
}

export function RepeatSolid(p: P) {
  return (
    <Svg {...p}>
      <path d="M17 1.6 21.4 6 17 10.4V7.2H7.4A2.4 2.4 0 0 0 5 9.6V11H2.6V9.6A4.8 4.8 0 0 1 7.4 4.8H17V1.6Z" />
      <path d="M7 22.4 2.6 18 7 13.6v3.2h9.6a2.4 2.4 0 0 0 2.4-2.4V13h2.4v1.4a4.8 4.8 0 0 1-4.8 4.8H7v3.2Z" />
    </Svg>
  );
}

export function SettingsSolid(p: P) {
  return (
    <Svg {...p}>
      <mask id="solid-gear-hole">
        <rect width="24" height="24" fill="white" />
        <circle cx="12" cy="12" r="3" fill="black" />
      </mask>
      <g mask="url(#solid-gear-hole)">
        <circle cx="12" cy="12" r="7.2" />
        {[0, 45, 90, 135].map((a) => (
          <rect key={a} x="10.4" y="1.6" width="3.2" height="20.8" rx="1.4" transform={`rotate(${a} 12 12)`} />
        ))}
      </g>
    </Svg>
  );
}
