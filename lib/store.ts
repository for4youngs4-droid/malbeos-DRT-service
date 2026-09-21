"use client";

import { create } from "zustand";

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
  setRoutines: (r: Routine[]) => void;
  addNotification: (n: AppNotification) => void;
  markRead: (id: string) => void;
  setVoiceOn: (v: boolean) => void;
  reset: () => void;
};

export const useStore = create<State>((set) => ({
  now: DEFAULT_NOW,
  reservations: [],
  routines: [],
  notifications: [],
  voiceOn: true,
  setTime: (ts) => set({ now: ts }),
  addReservation: (r) => set((s) => ({ reservations: [...s.reservations, r] })),
  setRoutines: (routines) => set({ routines }),
  addNotification: (n) => set((s) => ({ notifications: [...s.notifications, n] })),
  markRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  setVoiceOn: (voiceOn) => set({ voiceOn }),
  // 처음 상태로 (음성 안내 설정은 유지)
  reset: () => set({ now: DEFAULT_NOW, reservations: [], routines: [], notifications: [] }),
}));
