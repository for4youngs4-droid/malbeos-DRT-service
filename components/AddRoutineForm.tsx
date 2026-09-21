"use client";

import { useState } from "react";
import { Button, Toggle } from "@/components/ui";
import { PLACES, avgStayMin } from "@/lib/data";
import { speak } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { dayLabel, koTime } from "@/lib/time";

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 0]; // 월요일부터
const TIMES = ["08:00", "09:00", "10:00", "12:00", "14:00", "16:00"];

// 고르는 버튼 (선택되면 브랜드 그라데이션)
function Chip({ selected, onClick, children, className = "" }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-pill text-lg transition ${
        selected ? "bg-rec-gradient rec-3d font-semibold text-white [text-shadow:0_1px_2px_rgba(15,37,64,0.3)]" : "raised font-medium text-sub"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-lg font-medium text-sub">{children}</p>;
}

// 루틴 추가 모달 안의 양식: 요일, 장소, 시간을 고르고 저장한다
export default function AddRoutineForm({ onDone }: { onDone: () => void }) {
  const routines = useStore((s) => s.routines);
  const addRoutine = useStore((s) => s.addRoutine);

  const [weekday, setWeekday] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [alertOn, setAlertOn] = useState(true);

  const ready = weekday !== null && placeId !== null && time !== null;
  const dup = ready && routines.some((r) => r.id === `${weekday}-${placeId}`);

  const save = () => {
    if (!ready || dup) return;
    addRoutine({
      id: `${weekday}-${placeId}`,
      weekday,
      time,
      placeId,
      avgStayMin: avgStayMin(placeId),
      frequency: "weekly",
      learning: false,
      alertOn,
    });
    void speak("루틴을 추가했어요");
    onDone();
  };

  return (
    <div className="space-y-5">
      <div>
        <Label>요일</Label>
        <div className="flex justify-between">
          {WEEKDAYS.map((w) => (
            <Chip key={w} selected={weekday === w} onClick={() => setWeekday(w)} className="h-11 w-11">
              {dayLabel(w)}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Label>어디로 가세요</Label>
        <div className="flex flex-wrap gap-2">
          {PLACES.map((p) => (
            <Chip key={p.id} selected={placeId === p.id} onClick={() => setPlaceId(p.id)} className="min-h-11 px-4">
              {p.name}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Label>몇 시에 출발하세요</Label>
        <div className="flex flex-wrap gap-2">
          {TIMES.map((t) => (
            <Chip key={t} selected={time === t} onClick={() => setTime(t)} className="min-h-11 px-4">
              {koTime(t)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xl font-semibold">전날 저녁에 알려드려요</p>
          <p className="text-lg text-sub">홈에서 먼저 물어봐요</p>
        </div>
        <Toggle checked={alertOn} onChange={setAlertOn} label="전날 저녁 알림" />
      </div>

      {dup && <p className="text-lg font-medium text-warn">같은 요일에 이 장소 루틴이 이미 있어요</p>}

      <Button onClick={save} disabled={!ready || dup}>
        추가하기
      </Button>
    </div>
  );
}
