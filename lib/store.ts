"use client";

import { create } from "zustand";
import { PAST_TRIPS } from "./data";
import { dueAlerts, findRoutines } from "./routine";

export type Reservation = {
  id: string;
  date: string; // YYYY-MM-DD
  goTime: string; // HH:MM
  placeId: string;
  stayMin: number;
  returnOn: boolean; // 오는 편 함께 계획할지
};

export type Routine = {
  id: string;
  weekday: number; // 0=일 ... 6=토
  time: string; // HH:MM
  placeId: string;
  avgStayMin: number;
  frequency: "weekly" | "monthly";
  learning: boolean; // 루틴 학습 중
  alertOn: boolean;
};

export type AppNotification = {
  id: string;
  routineId: string;
  date: string; // 루틴이 일어날 날짜
  title: string;
  read: boolean;
};

// 가상 시각: 기본 월요일(2026-09-21) 오전 10시. 앱 어디서도 new Date()로 현재 시각을 읽지 않는다
export const DEFAULT_NOW = new Date(2026, 8, 21, 10, 0).getTime();

type State = {
  now: number;
  reservations: Reservation[];
  routines: Routine[];
  notifications: AppNotification[];
  voiceOn: boolean;
  setTime: (ts: number) => void;
  addReservation: (r: Reservation) => void;
  setRoutineAlert: (id: string, on: boolean) => void;
  markRead: (id: string) => void;
  setVoiceOn: (v: boolean) => void;
  reset: () => void;
};

export const useStore = create<State>((set) => ({
  now: DEFAULT_NOW,
  reservations: [],
  routines: findRoutines(PAST_TRIPS),
  notifications: [],
  voiceOn: true,

  // 시각이 바뀌면 새 루틴 알림이 생겼는지 확인한다
  setTime: (ts) =>
    set((s) => ({
      now: ts,
      notifications: [...s.notifications, ...dueAlerts(ts, s.routines, s.reservations, s.notifications)],
    })),

  // 예약이 생기면 같은 날짜·장소의 알림은 읽음 처리
  addReservation: (r) =>
    set((s) => ({
      reservations: [...s.reservations, r],
      notifications: s.notifications.map((n) => {
        const routine = s.routines.find((x) => x.id === n.routineId);
        return n.date === r.date && routine?.placeId === r.placeId ? { ...n, read: true } : n;
      }),
    })),

  // 끄면 그 루틴의 알림이 오지 않고, 이미 온 안 읽은 알림도 사라진다
  setRoutineAlert: (id, on) =>
    set((s) => {
      const routines = s.routines.map((r) => (r.id === id ? { ...r, alertOn: on } : r));
      const notifications = on ? s.notifications : s.notifications.filter((n) => n.routineId !== id || n.read);
      return {
        routines,
        notifications: [...notifications, ...dueAlerts(s.now, routines, s.reservations, notifications)],
      };
    }),

  markRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  setVoiceOn: (voiceOn) => set({ voiceOn }),

  // 처음 상태로 (음성 안내 설정은 유지)
  reset: () =>
    set({ now: DEFAULT_NOW, reservations: [], routines: findRoutines(PAST_TRIPS), notifications: [] }),
}));
