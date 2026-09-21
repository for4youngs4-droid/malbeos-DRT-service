// 루틴 찾기와 알림 규칙 (단순 규칙)

import { placeById, type PastTrip } from "./data";
import type { AppNotification, Reservation, Routine } from "./store";
import { addMinutes, dateKey, spokenTime, toTs, weekdayName, weekdayOf } from "./time";

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const round5 = (n: number) => Math.round(n / 5) * 5;
const round10 = (n: number) => Math.round(n / 10) * 10;

// 같은 요일 + 출발 시각 ±60분 + 같은 목적지가 3회 이상이면 루틴.
// 기록이 적은 것은 "월 1회, 루틴 학습 중"으로 목록에만 넣는다
export function findRoutines(trips: PastTrip[]): Routine[] {
  const groups = new Map<string, PastTrip[]>();
  for (const t of trips) {
    const key = `${weekdayOf(t.date)}-${t.placeId}`;
    groups.set(key, [...(groups.get(key) ?? []), t]);
  }

  const weekly: Routine[] = [];
  const monthly: Routine[] = [];
  for (const [key, list] of groups) {
    const weekday = Number(key.split("-")[0]);
    const placeId = list[0].placeId;
    const mins = list.map((t) => toMin(t.departTime)).sort((a, b) => a - b);
    const median = mins[Math.floor(mins.length / 2)];
    const near = list.filter((t) => Math.abs(toMin(t.departTime) - median) <= 60);
    const base = {
      id: key,
      weekday,
      placeId,
      time: addMinutes("00:00", round10(avg(near.map((t) => toMin(t.departTime))))),
      avgStayMin: round5(avg(near.map((t) => t.stayMin))),
    };
    if (near.length >= 3) weekly.push({ ...base, frequency: "weekly", learning: false, alertOn: true });
    else monthly.push({ ...base, frequency: "monthly", learning: true, alertOn: false });
  }
  weekly.sort((a, b) => a.weekday - b.weekday);
  return [...weekly, ...monthly];
}

// 루틴 전날 저녁 7시 이후가 되면 알림을 만든다.
// 이미 예약이 있거나, 자동 알림이 꺼져 있거나, 이미 만든 알림이면 만들지 않는다
export function dueAlerts(
  now: number,
  routines: Routine[],
  reservations: Reservation[],
  existing: AppNotification[],
): AppNotification[] {
  const n = new Date(now);
  const today = dateKey(now);
  const tomorrow = dateKey(new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1).getTime());
  const out: AppNotification[] = [];

  for (const r of routines) {
    if (!r.alertOn || r.learning || r.frequency !== "weekly") continue;
    const place = placeById(r.placeId);
    if (!place) continue;
    for (let off = 0; off <= 7; off++) {
      const day = new Date(n.getFullYear(), n.getMonth(), n.getDate() + off);
      if (day.getDay() !== r.weekday) continue;
      const [h, m] = r.time.split(":").map(Number);
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, 19, 0).getTime();
      const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m).getTime();
      const date = dateKey(day.getTime());
      const id = `${r.id}-${date}`;
      if (now < start || now >= end) continue;
      if (reservations.some((x) => x.date === date && x.placeId === r.placeId)) continue;
      if (existing.some((x) => x.id === id) || out.some((x) => x.id === id)) continue;

      const dayWord = date === today ? "오늘" : date === tomorrow ? "내일" : `${weekdayName(date)}요일`;
      const where = place.kind === "병원" ? "병원" : place.name;
      out.push({
        id,
        routineId: r.id,
        date,
        title: `${dayWord} ${h < 12 ? "오전" : "오후"}에 ${where} 방문 예정이에요`,
        read: false,
      });
    }
  }
  return out;
}


// 루틴이 다음에 일어날 날짜: 오늘부터 7일 안에서 요일이 같고 아직 지나지 않은 첫 날
export function nextOccurrence(r: Routine, now: number): string {
  const n = new Date(now);
  for (let off = 0; off <= 7; off++) {
    const day = new Date(n.getFullYear(), n.getMonth(), n.getDate() + off);
    if (day.getDay() !== r.weekday) continue;
    const date = dateKey(day.getTime());
    if (toTs(date, r.time) >= now) return date;
  }
  return dateKey(now);
}

// 이 장소로 가는 매주 루틴 (학습이 끝난 것만)
export function routineForPlace(routines: Routine[], placeId: string) {
  return routines.find((r) => r.placeId === placeId && r.frequency === "weekly" && !r.learning);
}

// 홈에서 먼저 묻는 말: "내일 오전 9시에 행복내과 가시는 날이죠? 예약할까요?"
export function offerText(alert: AppNotification, routine: Routine) {
  const place = placeById(routine.placeId);
  const dayWord = alert.title.split(" ")[0]; // "내일", "오늘", "화요일"
  return `${dayWord} ${spokenTime(routine.time)}에 ${place?.name ?? ""} 가시는 날이죠? 예약할까요?`;
}
