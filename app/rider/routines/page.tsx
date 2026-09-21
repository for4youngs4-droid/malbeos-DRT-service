"use client";

import { useState } from "react";
import { HeartPulse, Package, ShoppingBasket, Stethoscope } from "lucide-react";
import { Badge, Card, InfoRow, PhoneFrame, Tabs, Toggle, TopBar } from "@/components/ui";
import { placeById } from "@/lib/data";
import { useStore } from "@/lib/store";
import { dayLabel, koTime } from "@/lib/time";

const TABS = ["전체", "병원", "장보기", "기타"];

const ICONS: Record<string, typeof Package> = {
  병원: Stethoscope,
  장보기: ShoppingBasket,
  기타: Package,
};

export default function RoutinesPage() {
  const [tab, setTab] = useState("전체");
  const routines = useStore((s) => s.routines);
  const setAlert = useStore((s) => s.setRoutineAlert);

  // 맨 위 안내 카드는 학습이 끝난 첫 번째 주간 루틴
  const lead = routines.find((r) => r.frequency === "weekly");
  const leadPlace = lead ? placeById(lead.placeId) : undefined;

  const list = routines.filter((r) => tab === "전체" || placeById(r.placeId)?.kind === tab);

  return (
    <PhoneFrame tabs>
      <TopBar left="back" title="내 루틴" />
      <div className="space-y-5 px-5 pt-4">
        {lead && leadPlace && (
          <Card className="space-y-3">
            <Badge>루틴 학습 중</Badge>
            <p className="text-xl font-bold">다음 주에도 비슷한 일정이 있어요</p>
            <InfoRow
              icon={HeartPulse}
              title={`매주 ${dayLabel(lead.weekday)}요일 ${koTime(lead.time)}`}
              desc={leadPlace.name}
            />
            <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
              <span className="text-xl font-bold">자동 알림 받기</span>
              <Toggle checked={lead.alertOn} onChange={(on) => setAlert(lead.id, on)} label="자동 알림 받기" />
            </div>
            <p className="text-lg text-sub">더 정확한 예측을 위해 이동 기록을 학습하고 있어요.</p>
          </Card>
        )}

        <Tabs items={TABS} value={tab} onChange={setTab} />

        <div className="space-y-4">
          {list.length === 0 && <p className="text-lg text-sub">이 분류에는 루틴이 없어요.</p>}
          {list.map((r) => {
            const p = placeById(r.placeId)!;
            const weekly = r.frequency === "weekly";
            return (
              <Card key={r.id} className={`space-y-2 ${r.alertOn ? "" : "opacity-90"}`}>
                <InfoRow
                  icon={ICONS[p.kind] ?? Package}
                  title={weekly ? `${dayLabel(r.weekday)}요일 ${koTime(r.time)}` : "월 1회"}
                  desc={weekly ? `${p.name} (${p.kind})` : `${p.name} 검진`}
                  right={<Toggle checked={r.alertOn} onChange={(on) => setAlert(r.id, on)} label={`${p.name} 알림`} />}
                />
                <div className="flex items-center gap-3 pl-14">
                  <span className="text-lg text-sub">{weekly ? "(매주)" : "(매월)"}</span>
                  {r.learning && <Badge>루틴 학습 중</Badge>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}
