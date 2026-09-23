"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Plus, ShoppingBasket, Stethoscope } from "lucide-react";
import AddRoutineForm from "@/components/AddRoutineForm";
import { Badge, Button, FloatingButton, ListGroup, ListRow, Modal, PhoneFrame, SectionTitle, Toggle, TopBar } from "@/components/ui";
import { placeById } from "@/lib/data";
import { nextOccurrence } from "@/lib/routine";
import { speak } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { dateKey, dayLabel, koDate, koTime, weekdayOf } from "@/lib/time";
import { newReservation } from "@/lib/trip";

const ICONS: Record<string, typeof Package> = {
  병원: Stethoscope,
  장보기: ShoppingBasket,
  기타: Package,
};

export default function RoutinesPage() {
  const now = useStore((s) => s.now);
  const routines = useStore((s) => s.routines);
  const reservations = useStore((s) => s.reservations);
  const setAlert = useStore((s) => s.setRoutineAlert);
  const addReservation = useStore((s) => s.addReservation);
  const [adding, setAdding] = useState(false); // 루틴 추가 모달

  const today = dateKey(now);
  const d = new Date(now);
  const tomorrow = dateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime());
  const dayWord = (date: string) => (date === today ? "오늘" : date === tomorrow ? "내일" : `${dayLabel(weekdayOf(date))}요일`);
  // 다음 예정: 학습이 끝난 매주 루틴이 다음에 오는 날, 예약했는지까지 함께
  const upcoming = routines
    .filter((r) => r.frequency === "weekly" && !r.learning)
    .map((r) => {
      const date = nextOccurrence(r, now);
      const reserved = reservations.some((x) => x.date === date && x.placeId === r.placeId && !x.done);
      return { r, date, reserved };
    })
    .sort((a, b) => (a.date + a.r.time).localeCompare(b.date + b.r.time));

  return (
    <PhoneFrame tabs>
      <TopBar title="내 루틴" />
      <div className="space-y-3 px-5 pt-3">
        <SectionTitle>다음 예정</SectionTitle>
        <ListGroup>
          {upcoming.length === 0 && <ListRow title="아직 찾은 루틴이 없어요" desc="이동 기록을 보고 배워요" />}
          {upcoming.map(({ r, date, reserved }) => {
            const p = placeById(r.placeId)!;
            return (
              <ListRow
                key={r.id}
                icon={ICONS[p.kind] ?? Package}
                title={`${dayWord(date)} ${koTime(r.time)}`}
                desc={`${p.name} · ${koDate(date).replace(/ \(.\)$/, "")}`} // 요일은 제목에 있으므로 날짜만
                right={
                  reserved ? (
                    <Link href="/rider/chain">
                      <Badge tone="ok">예약됨</Badge>
                    </Link>
                  ) : (
                    <Button
                      size="sm"
                      full={false}
                      onClick={() => {
                        addReservation(newReservation(date, r.time, r.placeId, r.avgStayMin));
                        speak("예약했어요. 내 이동에서 확인할 수 있어요.");
                      }}
                    >
                      예약하기
                    </Button>
                  )
                }
              />
            );
          })}
        </ListGroup>

        <div data-tour-target="routine" className="space-y-3">
          <SectionTitle>알림 받는 루틴</SectionTitle>
          <ListGroup>
            {routines.map((r) => {
              const p = placeById(r.placeId)!;
              const weekly = r.frequency === "weekly";
              return (
                <ListRow
                  key={r.id}
                  icon={ICONS[p.kind] ?? Package}
                  title={weekly ? `${dayLabel(r.weekday)}요일 ${koTime(r.time)}` : "월 1회"}
                  desc={weekly ? `${p.name} · 매주` : `${p.name} 검진 · 매월 · 학습 중`}
                  right={<Toggle checked={r.alertOn} onChange={(on) => setAlert(r.id, on)} label={`${p.name} 알림`} />}
                />
              );
            })}
          </ListGroup>
          <p className="px-1 text-lg text-sub">알림을 켜 두면 루틴 전날 저녁에 홈에서 먼저 알려드려요</p>
        </div>
      </div>

      <FloatingButton label="루틴 추가" onClick={() => setAdding(true)}>
        <Plus size={28} strokeWidth={2.5} />
      </FloatingButton>

      <Modal open={adding} onClose={() => setAdding(false)} title="루틴 추가">
        <AddRoutineForm onDone={() => setAdding(false)} />
      </Modal>
    </PhoneFrame>
  );
}
