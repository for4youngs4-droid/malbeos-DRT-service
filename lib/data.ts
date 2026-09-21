// 직접 작성한 가짜 데이터 (실제 사람·주소 아님)

export type Place = {
  id: string;
  name: string;
  kind: string; // 병원, 장보기, 기타
  lat: number;
  lng: number;
  aliases: string[]; // 말할 때 쓰는 별명
};

export type Neighbor = { id: string; name: string; lat: number; lng: number };

export type PastTrip = {
  date: string; // YYYY-MM-DD
  departTime: string; // HH:MM
  placeId: string;
  stayMin: number; // 머문 시간(분)
};

export type NeighborBooking = { neighborId: string; placeId: string; date: string; time: string };

export type Vehicle = { id: string; name: string; seats: number };

// 주인공: 가평읍에서 약 6km 떨어진 마을에 사는 78세
export const HERO = { name: "김영은", age: 78, lat: 37.88, lng: 127.47 };

export const PLACES: Place[] = [
  { id: "hospital", name: "행복내과", kind: "병원", lat: 37.8322, lng: 127.5101, aliases: ["읍내 병원", "병원", "내과"] },
  { id: "market", name: "읍내 장터", kind: "장보기", lat: 37.8305, lng: 127.512, aliases: ["장터", "시장"] },
  { id: "health", name: "보건소", kind: "병원", lat: 37.834, lng: 127.507, aliases: ["보건소"] },
  { id: "pharmacy", name: "행복약국", kind: "기타", lat: 37.8318, lng: 127.5108, aliases: ["약국"] },
];

// 주인공 집 근처 1~3km 같은 방향 이웃 4명
export const NEIGHBORS: Neighbor[] = [
  { id: "n1", name: "박순자", lat: 37.872, lng: 127.478 },
  { id: "n2", name: "이철수", lat: 37.865, lng: 127.485 },
  { id: "n3", name: "최영희", lat: 37.858, lng: 127.49 },
  { id: "n4", name: "정말순", lat: 37.867, lng: 127.474 },
];

// 최근 4주 이동 기록 8건 (가상 오늘: 2026-09-21 월요일)
export const PAST_TRIPS: PastTrip[] = [
  { date: "2026-08-25", departTime: "09:05", placeId: "hospital", stayMin: 130 },
  { date: "2026-09-01", departTime: "08:55", placeId: "hospital", stayMin: 150 },
  { date: "2026-09-08", departTime: "09:10", placeId: "hospital", stayMin: 160 },
  { date: "2026-09-15", departTime: "09:00", placeId: "hospital", stayMin: 140 },
  { date: "2026-09-03", departTime: "14:00", placeId: "market", stayMin: 90 },
  { date: "2026-09-10", departTime: "14:10", placeId: "market", stayMin: 80 },
  { date: "2026-09-17", departTime: "13:55", placeId: "market", stayMin: 100 },
  { date: "2026-09-11", departTime: "10:00", placeId: "health", stayMin: 60 },
];

// 다음 화요일 오전 9시 행복내과 가는 이웃 4명 (주인공과 합치면 5명)
export const NEIGHBOR_BOOKINGS: NeighborBooking[] = NEIGHBORS.map((n, i) => ({
  neighborId: n.id,
  placeId: "hospital",
  date: "2026-09-22",
  time: ["09:00", "09:00", "09:10", "08:50"][i],
}));

export const VEHICLES: Vehicle[] = [
  { id: "v1", name: "1호차", seats: 4 },
  { id: "v2", name: "2호차", seats: 4 },
  { id: "v3", name: "3호차", seats: 11 },
];

export function placeById(id: string) {
  return PLACES.find((p) => p.id === id);
}
