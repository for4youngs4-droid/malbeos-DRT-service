"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bus, Users } from "lucide-react";
import MapView from "@/components/map/MapView";
import { Button, Card, Illustration, InfoRow, PeopleIcons, PhoneFrame, Tabs, TopBar } from "@/components/ui";
import { HERO, placeById } from "@/lib/data";
import { pointAt, routeBetween, type LatLng } from "@/lib/geo";
import { groupOfMine, myPickup, myRequests, neighborRequests, poolRequests } from "@/lib/pooling";
import { speak, stopSpeaking } from "@/lib/speech";
import { useStore } from "@/lib/store";
import { dateKey, koTime, spokenTime } from "@/lib/time";
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

  const mine = useMemo(
    () => poolRequests([...neighborRequests(), ...myRequests(reservations)]).filter((g) => g.members.some((m) => m.mine)),
    [reservations],
  );
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
  const d = new Date(now);
  const tomorrow = dateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime());
  const activeTab = tab ?? (mine.some((x) => x.date === today) ? "오늘" : "내일");
  const shown = mine.filter((x) => x.date === (activeTab === "오늘" ? today : tomorrow));

  return (
    <PhoneFrame tabs>
      <TopBar />
      <div className="space-y-5 px-5 pt-2">
        <h1 className="text-[28px] font-bold leading-snug">
          {others > 0 ? "다른 이용자와 함께 이동하고 있어요" : "함께 이동 안내"}
        </h1>
        <p className="text-lg text-sub">비슷한 목적지의 승객들과 함께 더 효율적인 경로로 이동합니다.</p>
        <Illustration name="together-bus" className="h-40 w-full" />

        {g && place ? (
          <Card className="space-y-4">
            <InfoRow icon={Users} title="오늘의 탑승 정보" desc={`${place.name} 방향`} />
            <p className="text-2xl font-bold">
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
            <InfoRow icon={Users} title="함께 이동 소식이 아직 없어요" desc="예약하면 같은 방향 분들과 묶어 드려요" />
            <Button onClick={() => router.push("/rider/voice")}>말로 예약하기</Button>
          </Card>
        )}

        <h2 className="pt-2 text-[28px] font-bold">운행 현황</h2>
        <Tabs items={["오늘", "내일"]} value={activeTab} onChange={setTab} />

        {shown.length === 0 && <p className="text-lg text-sub">이 날은 함께 이동 소식이 없어요.</p>}
        {shown.map((x, i) => {
          const p = placeById(x.placeId)!;
          // 지도에는 차량 경로와 버스만 (다른 승객 집 위치는 표시하지 않는다)
          const route = routeBetween(HOME, [p.lat, p.lng]);
          const me = x.members.findIndex((m) => m.mine);
          return (
            <div key={i} className="space-y-4">
              <MapView
                key={`${activeTab}-${i}`}
                className="h-56"
                lines={[{ points: route, color: "#5b7fe8" }]}
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
