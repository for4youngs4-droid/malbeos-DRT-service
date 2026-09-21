"use client";

import dynamic from "next/dynamic";

// 지도는 브라우저에서만 그린다 (SSR 끔)
const MapView = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => <div className="h-64 rounded-card bg-brand-soft" />,
});

export default MapView;
