import { CalendarCheck, CalendarClock, Clock, Mic, Users } from "lucide-react";

// 서비스 흐름을 그대로 따라가며 실제 화면 안의 진짜 부분을 하나씩 짚어준다.
// 화면(section) 하나가 끝나면 다음 화면으로 실제로 이동해서 이어간다.
// optional: 지금 데이터로는 없을 수 있는 부분(예: 예약이 아직 없을 때의 "함께 타기")이라,
//           화면에 없으면 조용히 건너뛴다.
export const TOUR_STEPS = [
  {
    section: "홈",
    href: "/rider",
    target: "home-mic",
    icon: Mic,
    title: "말로 편하게 예약해요",
    desc: "마이크를 누르고 “내일 병원 가고 싶어요”처럼 편하게 말씀해보세요. 예약이 그 자리에서 끝나요.",
  },
  {
    section: "홈",
    href: "/rider",
    target: "home-next",
    icon: CalendarClock,
    title: "예약한 이동을 한눈에",
    desc: "예약하시면 다음 이동이 바로 여기에 나타나요. 눌러서 자세히 볼 수 있어요.",
  },
  {
    section: "내 이동",
    href: "/rider/chain",
    target: "chain",
    icon: CalendarCheck,
    title: "가는 길과 오는 길을 한 번에",
    desc: "예약하시면 가는 편과 오는 편을 하루 계획으로 모아서 여기에 보여드려요.",
  },
  {
    section: "내 이동",
    href: "/rider/chain",
    target: "chain-together",
    icon: Users,
    title: "같은 방향이면 자동으로 함께",
    desc: "비슷한 시간, 같은 방향으로 가는 분이 있으면 차 한 대로 묶어서 알려드려요.",
    optional: true, // 예약이 없으면 이 카드가 없어서 조용히 건너뛴다
  },
  {
    section: "내 루틴",
    href: "/rider/routines",
    target: "routine-upcoming",
    icon: CalendarClock,
    title: "곧 있을 루틴도 바로 예약",
    desc: "루틴으로 찾은 다음 이동을 여기서 바로 예약할 수 있어요.",
  },
  {
    section: "내 루틴",
    href: "/rider/routines",
    target: "routine",
    icon: Clock,
    title: "알림, 직접 켜고 끌 수 있어요",
    desc: "필요 없는 루틴은 알림을 꺼 두시면 다시 여쭤보지 않아요.",
  },
];

// 지금 도움말 가이드가 이 표시(target)를 가리키고 있는 중인지
export function isTourTarget(tourStep: number | null, target: string) {
  return tourStep !== null && TOUR_STEPS[tourStep]?.target === target;
}
