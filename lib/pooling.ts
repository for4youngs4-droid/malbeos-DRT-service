// 단순 묶기: 같은 날, 같은 목적지, 출발 희망 시각 30분 이내인 예약끼리 한 차에

import { HERO, NEIGHBORS, NEIGHBOR_BOOKINGS, VEHICLES, placeById } from "./data";
import type { LatLng } from "./geo";
import type { Reservation } from "./store";
import { addMinutes } from "./time";

export type Request = {
  id: string;
  mine: boolean; // 주인공의 예약인지
  date: string;
  placeId: string;
  time: string; // 출발 희망 시각
  home: LatLng;
};

export type Group = {
  date: string;
  placeId: string;
  vehicle: string; // "3호차"
  seats: number;
  members: Request[]; // 태우는 순서
  pickups: string[]; // members와 같은 순서의 집 앞 도착 시각
  km: number; // 가는 편 주행 거리
};

const HOME: LatLng = [HERO.lat, HERO.lng];
const ROAD = 1.3; // 직선거리 -> 도로 거리

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// 두 지점 사이 직선거리(km)
export function distKm(a: LatLng, b: LatLng) {
  return Math.hypot((b[0] - a[0]) * 111, (b[1] - a[1]) * 88);
}

export function neighborRequests(): Request[] {
  return NEIGHBOR_BOOKINGS.map((b) => {
    const n = NEIGHBORS.find((x) => x.id === b.neighborId)!;
    return { id: n.id, mine: false, date: b.date, placeId: b.placeId, time: b.time, home: [n.lat, n.lng] };
  });
}

export function myRequests(list: Reservation[]): Request[] {
  return list
    .filter((r) => !r.done)
    .map((r) => ({ id: r.id, mine: true, date: r.date, placeId: r.placeId, time: r.goTime, home: HOME }));
}

// 운영 화면용: 예약 여부와 상관없이 항상 같은 시연 상황(화요일 9시 행복내과 5명)
export function demoRequests(): Request[] {
  return [...neighborRequests(), { id: "me-demo", mine: true, date: "2026-09-22", placeId: "hospital", time: "09:00", home: HOME }];
}

function routeKm(members: Request[], destination: LatLng) {
  const stops = [...members.map((m) => m.home), destination];
  let sum = 0;
  for (let i = 1; i < stops.length; i++) sum += distKm(stops[i - 1], stops[i]);
  return sum * ROAD;
}

// 묶기 후
export function poolRequests(reqs: Request[]): Group[] {
  const sorted = [...reqs].sort((a, b) => (a.date + a.placeId + a.time).localeCompare(b.date + b.placeId + b.time));
  const buckets: Request[][] = [];
  for (const r of sorted) {
    const last = buckets[buckets.length - 1];
    const fits =
      last && last[0].date === r.date && last[0].placeId === r.placeId && minutes(r.time) - minutes(last[0].time) <= 30 && last.length < 11;
    if (fits) last.push(r);
    else buckets.push([r]);
  }

  const used = new Set<string>();
  return buckets.map((b) => {
    const place = placeById(b[0].placeId)!;
    const dest: LatLng = [place.lat, place.lng];
    // 먼 집부터 태우고 목적지 쪽으로 (집이 가까운 순으로 이어 태움)
    const members = [...b].sort((x, y) => distKm(y.home, dest) - distKm(x.home, dest));
    const first = addMinutes(b.map((m) => m.time).sort()[0], 2);
    const pickups = members.map((_, i) => addMinutes(first, i * 3));
    const need = members.length <= 4 ? 4 : 11;
    const car = VEHICLES.find((v) => v.seats === need && !used.has(v.id)) ?? VEHICLES.find((v) => v.seats >= need && !used.has(v.id));
    if (car) used.add(car.id);
    return {
      date: b[0].date,
      placeId: b[0].placeId,
      vehicle: car?.name ?? "추가 차량",
      seats: car?.seats ?? need,
      members,
      pickups,
      km: routeKm(members, dest),
    };
  });
}

// 묶기 전 (한 사람이 한 차)
export function unpooled(reqs: Request[]): Group[] {
  return reqs.map((r) => {
    const place = placeById(r.placeId)!;
    return {
      date: r.date,
      placeId: r.placeId,
      vehicle: "차량",
      seats: 4,
      members: [r],
      pickups: [r.time],
      km: routeKm([r], [place.lat, place.lng]),
    };
  });
}

// 비교 숫자
export function stats(groups: Group[]) {
  const riders = groups.reduce((s, g) => s + g.members.length, 0);
  return {
    cars: groups.length,
    km: groups.reduce((s, g) => s + g.km, 0),
    avgRiders: riders / Math.max(1, groups.length),
  };
}

// 내 예약이 속한 묶음
export function groupOfMine(r: Reservation, reservations: Reservation[]): Group | undefined {
  const groups = poolRequests([...neighborRequests(), ...myRequests(reservations)]);
  return groups.find((g) => g.members.some((m) => m.mine && m.id === r.id));
}

export function myPickup(g: Group, r: Reservation) {
  return g.pickups[g.members.findIndex((m) => m.mine && m.id === r.id)];
}
