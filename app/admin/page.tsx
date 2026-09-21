"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import MapView from "@/components/map/MapView";
import { Card } from "@/components/ui";
import { BRAND, BRAND_TINT } from "@/lib/colors";
import { placeById } from "@/lib/data";
import { pointAt, routeBetween, type LatLng } from "@/lib/geo";
import { demoRequests, poolRequests, stats, unpooled } from "@/lib/pooling";

const pct = (before: number, after: number) => Math.round((1 - after / before) * 100);

function Compare({ label, before, after, note }: { label: string; before: string; after: string; note: string }) {
  return (
    <Card className="space-y-3 p-6">
      <p className="text-[15px] font-medium text-sub">{label}</p>
      <p className="flex flex-wrap items-center gap-x-2 text-[26px] font-semibold">
        <span className="text-sub">{before}</span>
        <ArrowRight size={24} className="shrink-0 text-brand" />
        <span className="text-navy">{after}</span>
      </p>
      <p className="text-[20px] font-semibold text-brand">{note}</p>
    </Card>
  );
}

export default function AdminPage() {
  const [mode, setMode] = useState<"before" | "after">("after");

  const { before, after, place, lines, pins } = useMemo(() => {
    const reqs = demoRequests();
    const b = unpooled(reqs);
    const a = poolRequests(reqs);
    const p = placeById(reqs[0].placeId)!;
    const dest: LatLng = [p.lat, p.lng];
    const g = a[0];
    // 묶은 뒤: 한 대가 집들을 차례로 들러 목적지로
    const stops = g.members.map((m) => m.home);
    const path: LatLng[] = [...stops, ...routeBetween(stops[stops.length - 1], dest).slice(1)];
    return {
      before: stats(b),
      after: stats(a),
      place: p,
      lines: {
        before: reqs.map((r) => ({ points: routeBetween(r.home, dest), color: BRAND_TINT })),
        after: [{ points: path, color: BRAND }],
      },
      pins: {
        before: [...reqs.map((r) => ({ pos: r.home, kind: "home" as const })), { pos: dest, kind: "place" as const }],
        after: [
          ...stops.map((s) => ({ pos: s, kind: "home" as const })),
          { pos: dest, kind: "place" as const },
          { pos: pointAt(path, 0.15), kind: "bus" as const },
        ],
      },
    };
  }, []);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8 text-[16px]">
      <header>
        <h1 className="text-[24px] font-semibold">화요일 오전 운행 비교</h1>
        <p className="mt-1 text-sub">{place.name} 방향, 가는 편 기준 · 같은 방향 승객 {before.cars}명</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Compare
          label="필요 차량 수"
          before={`${before.cars}대`}
          after={`${after.cars}대`}
          note={`${pct(before.cars, after.cars)}% 감소`}
        />
        <Compare
          label="총 주행 거리"
          before={`${before.km.toFixed(1)}km`}
          after={`${after.km.toFixed(1)}km`}
          note={`${pct(before.km, after.km)}% 감소`}
        />
        <Compare
          label="차량당 평균 탑승 인원"
          before={`${before.avgRiders.toFixed(0)}명`}
          after={`${after.avgRiders.toFixed(0)}명`}
          note={`${Math.round(after.avgRiders / before.avgRiders)}배`}
        />
      </section>

      <section className="space-y-3">
        <div className="flex gap-2">
          {(["before", "after"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`min-h-12 rounded-pill px-6 text-[15px] font-medium ${mode === m ? "bg-brand text-white" : "bg-white text-sub ring-1 ring-line"}`}
            >
              {m === "before" ? "묶기 전" : "묶기 후"}
            </button>
          ))}
        </div>
        <MapView key={mode} className="h-[440px]" lines={lines[mode]} pins={pins[mode]} />
      </section>

      <p className="text-[16px] text-sub">가상 데이터 기반 시뮬레이션 결과</p>
    </main>
  );
}
