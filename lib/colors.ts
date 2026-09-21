// 브랜드 색 (CSS 밖에서 필요할 때 쓰는 값: 지도, 그래프 등). 색 정의는 여기와 app/globals.css 두 곳뿐
export const BRAND = "#207fba"; // 주 파랑
export const BRAND_TINT = "#b5d3e6"; // 주 파랑을 연하게
export const INK = "#0f2540"; // 글씨색, 버스 핀

// 브랜드 그라데이션: 민트 -> 블루
export const brandGradient = (deg: number) => `linear-gradient(${deg}deg, #8decd0 0%, #56b5c5 50%, #207fba 100%)`;
