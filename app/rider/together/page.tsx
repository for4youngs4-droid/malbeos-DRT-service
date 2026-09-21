"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bus, Users } from "lucide-react";
import MapView from "@/components/map/MapView";
import { Button, Card, Illustration, InfoRow, ListGroup, ListRow, PeopleIcons, PhoneFrame, SectionTitle, Tabs, TopBar } from "@/components/ui";
import { HERO, placeById } from "@/lib/data";
import { pointAt, routeBetween, type LatLng } from "@/lib/geo";
import { groupOfMine, myPickup, myRequests, neighborRequests, poolRequests } from "@/lib/pooling";
import { speak, stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { dateKey, koDate, koTime, spokenTime } from "@/lib/time";
import { nextReservation } from "@/lib/trip";

const COUNT = ["", "한", "두", "세", "네", "다섯"];
const HOME: LatLng = [HERO.lat, HERO.lng];

export default function TogetherPage() {
  const router = useRouter();
  const now = useStore((s) => s.now);
  const reservations = useStore((s) => s.reservations);
  const r = nextReservation(reservations, now);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<string | null>(null);

  // 그날 운행하는 묶음 전체 (내 예약이 없어도 보인다)
  const dayGroups = useMemo(() => poolRequests([...neighborRequests(), ...myRequests(reservations)]), [reservations]);
  const g = r ? groupOfMine(r, reservations) : undefined;
  const others = g ? g.members.length - 1 : 0;
  const place = g ? placeById(g.placeId) : undefined;
  const pickup = g && r ? myPickup(g, r) : undefined;

  // 함께 타는 분이 있으면 음성으로 알려준다 (이름 없이 인원 수만)
  const gKey = g ? `${g.date}-${g.placeId}-${others}` : "";
  useEffect(() => {
    if (!gKey) return;
    const p = pickup ? spokenTime(pickup) : "";
    speak(
      others > 0
        ? `같은 방향 가시는 분 ${COUNT[others] ?? others} 분과 함께 타세요. ${p}에 집 앞으로 가요.`
        : "이번에는 혼자 타세요.",
    );
    return stopSpeaking;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gKey]);

  const today = dateKey(now);
  // 아직 내 예약이 없을 때 보여줄 이웃들의 이동 소식 (인원 수만, 누군지는 표시하지 않음)
  const first = dayGroups.find((x) => x.date >= today);
  const upcoming = first
    ? {
        label: first.date === today ? "오늘" : `${koDate(first.date)}`,
        place: placeById(first.placeId)?.name ?? "",
        count: first.members.length,
      }
    : undefined;
  const d = new Date(now);
  const tomorrow = dateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime());
  const activeTab = tab ?? (dayGroups.some((x) => x.date === today) ? "오늘" : "내일");
  const shown = dayGroups.filter((x) => x.date === (activeTab === "오늘" ? today : tomorrow));

  return (
    <PhoneFrame tabs>
      <TopBar />
      <div className="space-y-5 px-5 pt-2">
        <h1 className="text-[22px] font-semibold leading-snug tracking-tight">
          {others > 0 ? "다른 이용자와 함께 이동하고 있어요" : "함께 이동 안내"}
        </h1>
        <p className="text-lg text-sub">비슷한 목적지의 승객들과 함께 더 효율적인 경로로 이동합니다.</p>
        <Illustration name="together-bus" className="h-40 w-full" />

        {g && place ? (
          <Card className="space-y-4">
            <InfoRow icon={Users} title="오늘의 탑승 정보" desc={`${place.name} 방향`} />
            <p className="text-2xl font-semibold">
              총 {g.members.length}명 / 1대
            </p>
            <Button variant="secondary" onClick={() => setOpen(!open)}>
              {open ? "접기" : "상세보기"}
            </Button>
            {open && pickup && r && (
              <div className="space-y-3">
                <InfoRow icon={Bus} title={`${g.vehicle} (${g.seats}인승)`} desc={`집 앞 도착 ${koTime(pickup)}`} />
                <PeopleIcons count={g.members.length} />
              </div>
            )}
          </Card>
        ) : (
          <Card className="space-y-4">
            <InfoRow
              icon={Users}
              title={upcoming ? `${upcoming.label} ${upcoming.place} 방향` : "함께 이동 소식이 아직 없어요"}
              desc={upcoming ? `같은 방향으로 ${upcoming.count}명이 이동해요` : "예약하면 같은 방향 분들과 묶어 드려요"}
            />
            <Button onClick={() => router.push("/rider")}>말로 예약하고 함께 타기</Button>
          </Card>
        )}

        {g && (
          <>
            <SectionTitle>탑승 순서</SectionTitle>
            <ListGroup>
              {g.members.map((m, i) => (
                <ListRow
                  key={m.id}
                  lead={
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold ${
                        m.mine ? "bg-brand text-white" : "bg-brand-soft text-brand"
                      }`}
                    >
                      {i + 1}
                    </span>
                  }
                  title={m.mine ? "나 (집 앞)" : "같은 방향 승객"}
                  desc={koTime(g.pickups[i])}
                />
              ))}
            </ListGroup>
          </>
        )}

        <SectionTitle>운행 현황</SectionTitle>
        <Tabs items={["오늘", "내일"]} value={activeTab} onChange={setTab} />

        {shown.length === 0 && <p className="text-lg text-sub">이 날은 함께 이동 소식이 없어요.</p>}
        {shown.map((x, i) => {
          const p = placeById(x.placeId)!;
          // 지도에는 차량 경로와 버스만 (다른 승객 집 위치는 표시하지 않는다)
          const route = routeBetween(HOME, [p.lat, p.lng]);
          const me = Math.max(0, x.members.findIndex((m) => m.mine));
          return (
            <div key={i} className="space-y-4">
              <MapView
                key={`${activeTab}-${i}`}
                className="h-56"
                lines={[{ points: route, color: "#207fba" }]}
                pins={[
                  { pos: [p.lat, p.lng], kind: "place" },
                  { pos: pointAt(route, 0.3), kind: "bus" },
                ]}
              />
              <Card className="space-y-3">
                <InfoRow icon={Bus} title={`${koTime(x.pickups[me])} ${p.name} 방향`} desc={`탑승 인원 ${x.members.length}명 / 1대`} />
                <PeopleIcons count={x.members.length} />
              </Card>
            </div>
          );
        })}
      </div>
    </PhoneFrame>
  );
}
