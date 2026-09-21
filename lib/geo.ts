export type LatLng = [number, number];

// 두 지점 사이에 중간 점 3개를 넣어 도로처럼 살짝 휘게 만든다
export function routeBetween(a: LatLng, b: LatLng): LatLng[] {
  const dlat = b[0] - a[0];
  const dlng = b[1] - a[1];
  const bends: [number, number][] = [
    [0.25, 0.14],
    [0.5, -0.12],
    [0.75, 0.13],
  ];
  const mid = bends.map(([t, k]): LatLng => [a[0] + dlat * t - dlng * k * 0.5, a[1] + dlng * t + dlat * k * 0.5]);
  return [a, ...mid, b];
}

// 경로를 따라 p(0~1) 만큼 간 위치
export function pointAt(points: LatLng[], p: number): LatLng {
  const dist = (a: LatLng, b: LatLng) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const segs = points.slice(1).map((pt, i) => dist(points[i], pt));
  let left = segs.reduce((x, y) => x + y, 0) * Math.min(1, Math.max(0, p));
  for (let i = 0; i < segs.length; i++) {
    if (left <= segs[i] || i === segs.length - 1) {
      const t = segs[i] === 0 ? 0 : Math.min(1, left / segs[i]);
      return [points[i][0] + (points[i + 1][0] - points[i][0]) * t, points[i][1] + (points[i + 1][1] - points[i][1]) * t];
    }
    left -= segs[i];
  }
  return points[points.length - 1];
}
