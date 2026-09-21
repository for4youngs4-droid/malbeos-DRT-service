// 예약 하나에서 하루 이동 계획(시각, 차량)을 계산한다

import type { Reservation } from "./store";
import { addMinutes, dateKey, roundHalfHour } from "./time";

export function newReservation(date: string, goTime: string, placeId: string, stayMin: number): Reservation {
  return {
    id: `${date}-${goTime}-${placeId}`,
    date,
    goTime,
    placeId,
    stayMin,
    goOn: true,
    stopOn: true,
    returnOn: true,
    arrived: false,
    pickupCalled: false,
    done: false,
  };
}

// 오늘 이후의 가장 빠른, 아직 끝나지 않은 예약
export function nextReservation(list: Reservation[], now: number): Reservation | undefined {
  const today = dateKey(now);
  return list
    .filter((r) => !r.done && r.date >= today)
    .sort((a, b) => (a.date + a.goTime).localeCompare(b.date + b.goTime))[0];
}

// 집 -> 목적지 이동 30분, 체류 후 30분 30분 단위로 맞춰 귀가
export function tripTimes(r: Reservation) {
  const arrive = addMinutes(r.goTime, 30);
  const leave = roundHalfHour(addMinutes(arrive, r.stayMin));
  return { depart: r.goTime, arrive, leave, home: addMinutes(leave, 30) };
}
