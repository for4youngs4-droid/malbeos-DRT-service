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
  returnOn: boolean; // 오는 편을 함께 계획할지
  arrived: boolean; // 가는 길 이동을 마치고 목적지에 도착했는지
  pickupCalled: boolean; // "데리러 와주세요"를 눌렀는지
  done: boolean; // 집에 돌아왔는지
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
  voiceName: string | null; // 고른 목소리 이름 (없으면 자동으로 가장 자연스러운 목소리)
  greeted: boolean; // 홈 첫 인사를 이미 들려줬는지 (처음 들어왔을 때 한 번만)
  tourStep: number | null; // 도움말 가이드: null이면 꺼짐, 0부터 단계
  setTime: (ts: number) => void;
  addReservation: (r: Reservation) => void;
  updateReservation: (id: string, patch: Partial<Reservation>) => void;
  removeReservation: (id: string) => void;
  addRoutine: (r: Routine) => void;
  setRoutineAlert: (id: string, on: boolean) => void;
  markRead: (id: string) => void;
  setVoiceOn: (v: boolean) => void;
  setVoiceName: (name: string | null) => void;
  markGreeted: () => void;
  startTour: () => void;
  nextTourStep: () => void;
  endTour: () => void;
  reset: () => void;
};

const TOUR_STEPS = 3; // 도움말 가이드 단계 수 (핵심 기능 3가지)

export const useStore = create<State>((set) => ({
  now: DEFAULT_NOW,
  reservations: [],
  routines: findRoutines(PAST_TRIPS),
  notifications: [],
  voiceOn: true, // 기본은 켜짐 (홈·설정에서 끌 수 있다)
  voiceName: null,
  greeted: false,
  tourStep: null,

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

  removeReservation: (id) => set((s) => ({ reservations: s.reservations.filter((r) => r.id !== id) })),

  updateReservation: (id, patch) =>
    set((s) => ({ reservations: s.reservations.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),

  // 직접 추가한 루틴: 매주 루틴은 요일 순으로 넣고, 지금 알림 시각이면 바로 알림도 만든다
  addRoutine: (r) =>
    set((s) => {
      const routines = [...s.routines, r].sort(
        (a, b) => Number(a.frequency === "monthly") - Number(b.frequency === "monthly") || a.weekday - b.weekday,
      );
      return {
        routines,
        notifications: [...s.notifications, ...dueAlerts(s.now, routines, s.reservations, s.notifications)],
      };
    }),

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
  setVoiceName: (voiceName) => set({ voiceName }),
  markGreeted: () => set({ greeted: true }),

  // 도움말 가이드: 시작 / 다음 단계(끝이면 꺼짐) / 바로 끄기
  startTour: () => set({ tourStep: 0 }),
  nextTourStep: () => set((s) => ({ tourStep: s.tourStep === null || s.tourStep + 1 >= TOUR_STEPS ? null : s.tourStep + 1 })),
  endTour: () => set({ tourStep: null }),

  // 처음 상태로 (음성 안내 설정은 유지). 첫 인사도 다시 나온다
  reset: () =>
    set({ now: DEFAULT_NOW, reservations: [], routines: findRoutines(PAST_TRIPS), notifications: [], greeted: false }),
}));
