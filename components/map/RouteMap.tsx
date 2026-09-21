"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { BRAND, INK } from "@/lib/colors";
import type { LatLng } from "@/lib/geo";

export type MapLine = { points: LatLng[]; color: string; dashed?: boolean };
export type MapPin = { pos: LatLng; kind: "home" | "place" | "bus" };

// lucide 아이콘 모양을 그대로 (흰색 선)
const SVG = {
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  place:
    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  bus: '<path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>',
};
// 집과 목적지는 브랜드 파랑 단색, 버스는 진한 글씨색
const BG = { home: BRAND, place: BRAND, bus: INK };

const icons: Partial<Record<MapPin["kind"], L.DivIcon>> = {};
function iconOf(kind: MapPin["kind"]) {
  return (icons[kind] ??= L.divIcon({
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `<div style="width:40px;height:40px;border-radius:9999px;background:${BG[kind]};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${SVG[kind]}</svg></div>`,
  }));
}

function FitBounds({ lines }: { lines: MapLine[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = lines.flatMap((l) => l.points);
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [36, 36] });
    // 처음 한 번만 맞춘다 (버스가 움직여도 지도는 그대로)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}

export default function RouteMap({ lines, pins, className = "h-64" }: { lines: MapLine[]; pins: MapPin[]; className?: string }) {
  return (
    <div className={`isolate overflow-hidden rounded-card shadow-card ${className}`}>
      <MapContainer
        center={lines[0]?.points[0] ?? [37.83, 127.51]}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        touchZoom={false}
        doubleClickZoom={false}
        keyboard={false}
      >
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds lines={lines} />
        {lines.map((l, i) => (
          <Polyline
            key={i}
            positions={l.points}
            pathOptions={{ color: l.color, weight: 6, opacity: 0.9, dashArray: l.dashed ? "4 12" : undefined, lineCap: "round" }}
          />
        ))}
        {pins.map((p, i) => (
          <Marker key={i} position={p.pos} icon={iconOf(p.kind)} interactive={false} zIndexOffset={p.kind === "bus" ? 1000 : 0} />
        ))}
      </MapContainer>
    </div>
  );
}
