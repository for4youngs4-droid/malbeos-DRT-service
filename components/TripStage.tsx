"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Navigation } from "lucide-react";
import MapView from "@/components/map/MapView";
import { Button, Card, InfoRow } from "@/components/ui";
import { angle } from "@/components/ui/gradientAngle";
import { HERO, placeById } from "@/lib/data";
import { pointAt, routeBetween, type LatLng } from "@/lib/geo";
import { isPickup } from "@/lib/intent";
import { listen, speak, stopListening, stopSpeaking } from "@/lib/speech";
import { useStore, type Reservation } from "@/lib/store";
import { koTime, toTs } from "@/lib/time";
import { tripTimes } from "@/lib/trip";

const HOME: LatLng = [HERO.lat, HERO.lng];
const RIDE_MS = 3000; // 시연용: 편도를 3초에 이동

export type TripPhase = "before" | "riding" | "stay" | "returning";

// 지금 이동이 어느 단계인지
export function tripPhase(r: Reservation, now: number): TripPhase {
  if (r.pickupCalled) return "returning";
  if (r.arrived) return "stay";
  return now >= toTs(r.date, tripTimes(r).depart) ? "riding" : "before";
}

// 지도 + 버스. p는 경로를 얼마나 갔는지(0~1)
function TripMap({ route, p, place }: { route: LatLng[]; p: number; place: LatLng }) {
  return (
    <MapView
      className="h-64"
      lines={[{ points: route, color: "#207fba" }]}
      pins={[
        { pos: HOME, kind: "home" },
        { pos: place, kind: "place" },
        { pos: pointAt(route, p), kind: "bus" },
      ]}
    />
  );
}

// 시연용 이동 애니메이션(RIDE_MS). 끝나면 onDone
function Ride({
  route,
  place,
  minutes,
  near,
  onDone,
}: {
  route: LatLng[];
  place: LatLng;
  minutes: number;
  near: string;
  onDone: () => void;
}) {
  const [p, setP] = useState(0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    let t = 0;
    let hold: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      t += 50;
      const next = Math.min(1, t / RIDE_MS);
      setP(next);
      if (next >= 1) {
        clearInterval(id);
        hold = setTimeout(() => done.current(), 1500); // 도착한 모습을 잠깐 보여준다
      }
    }, 50);
    return () => {
      clearInterval(id);
      clearTimeout(hold);
    };
  }, []);

  const left = Math.ceil(minutes * (1 - p));
  return (
    <>
      <TripMap route={route} p={p} place={place} />
      <Card className="space-y-3">
        <InfoRow icon={Navigation} title="현재 위치" desc={p >= 1 ? "도착했어요" : `${near} 근처`} />
        <p className="rounded-pill bg-brand-soft px-5 py-3 text-center text-xl font-medium text-navy">
          {p >= 1 ? "도착했어요" : `도착 예정 ${left}분 후`}
        </p>
      </Card>
    </>
  );
}

// 내 이동 화면 위쪽: 지금 단계에 맞는 내용 (출발 전 / 이동 중 / 도착 후 귀가 호출 / 돌아오는 중)
export default function TripStage({ r, onFinished }: { r: Reservation; onFinished: () => void }) {
  const now = useStore((s) => s.now);
  const setTime = useStore((s) => s.setTime);
  const update = useStore((s) => s.updateReservation);
  const [msg, setMsg] = useState("");

  const place = placeById(r.placeId)!;
  const t = tripTimes(r);
  const phase = tripPhase(r, now);
  const goRoute = routeBetween(HOME, [place.lat, place.lng]);
  const placePos: LatLng = [place.lat, place.lng];
  const backRoute = [...goRoute].reverse();
  const errand = place.kind === "병원" ? "진료" : "볼일";

  // 단계가 바뀔 때마다 안내
  useEffect(() => {
    const say: Record<string, string> = {
      before: "",
      riding: `${place.name}로 이동을 시작해요. 도착까지 약 9분 걸려요.`,
      stay: `${place.name}에 도착했어요. ${errand} 끝나시면 아래 큰 버튼을 눌러 주세요.`,
      returning: "차가 15분 뒤에 도착해요.",
    };
    if (say[phase]) speak(say[phase]);
    return stopSpeaking;
  }, [phase, place.name, errand]);

  useEffect(() => () => stopListening(), []);

  const callPickup = () => update(r.id, { pickupCalled: true });
  const listenPickup = async () => {
    setMsg("듣고 있어요. 말씀하세요");
    const heard = await listen();
    if (heard && isPickup(heard)) {
      setMsg("");
      callPickup();
    } else {
      setMsg(heard === null ? "음성 인식을 쓸 수 없어요, 큰 버튼을 눌러 주세요" : "잘 못 들었어요, 다시 말씀해 주세요");
    }
  };

  if (phase === "before") {
    return (
      <div className="space-y-4">
        <TripMap route={goRoute} p={0} place={placePos} />
        <Card>
          <InfoRow icon={Navigation} title={`${koTime(t.depart)}에 출발해요`} desc="차가 집 앞으로 와요" />
        </Card>
        {/* 임시: 블록 6의 시연 조작판이 생기면 지운다 */}
        <button
          type="button"
          onClick={() => setTime(toTs(r.date, t.depart))}
          className="block min-h-12 w-full rounded-pill border border-dashed border-line text-lg text-sub"
        >
          출발 시각으로 바꾸기
        </button>
      </div>
    );
  }

  if (phase === "riding") {
    return (
      <div className="space-y-4">
        <Ride
          route={goRoute}
          place={placePos}
          minutes={9}
          near={place.name}
          onDone={() => {
            const arriveTs = toTs(r.date, t.arrive);
            if (now < arriveTs) setTime(arriveTs);
            update(r.id, { arrived: true });
          }}
        />
      </div>
    );
  }

  if (phase === "stay") {
    return (
      <div className="space-y-4">
        <Card className="space-y-1 text-center">
          <p className="text-[22px] font-semibold leading-snug tracking-tight">{place.name}에 도착했어요</p>
          <p className="text-lg text-sub">{errand} 잘 받으세요</p>
        </Card>
        {r.returnOn ? (
          <>
            <Button className="min-h-20 text-xl" onClick={callPickup}>
              {errand} 끝났어요
              <br />
              데리러 와주세요
            </Button>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                aria-label="말로 부르기"
                onClick={listenPickup}
                style={angle(120)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-rec-gradient rec-3d text-white"
              >
                <Mic size={26} />
              </button>
              <p className="text-lg text-sub">{msg || "또는 눌러서 \"다 끝났어\"라고 말하세요"}</p>
            </div>
          </>
        ) : (
          <Card>
            <InfoRow icon={Navigation} title="오시는 길은 따로 이동해요" desc="차를 부르지 않아도 돼요" />
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Ride
        route={backRoute}
        place={placePos}
        minutes={15}
        near="집"
        onDone={() => {
          update(r.id, { done: true });
          onFinished();
        }}
      />
    </div>
  );
}
