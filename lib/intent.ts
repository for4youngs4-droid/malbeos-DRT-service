// 키워드 규칙으로 말의 뜻을 파악한다 (외부 AI 없음)

import { PLACES } from "./data";
import { dateKey } from "./time";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

// 날짜: 오늘/내일/모레/요일 이름 -> YYYY-MM-DD (가상 시각 기준)
export function parseDate(text: string, nowTs: number): string | null {
  const base = new Date(nowTs);
  const add = (n: number) => dateKey(new Date(base.getFullYear(), base.getMonth(), base.getDate() + n).getTime());
  if (/모레/.test(text)) return add(2);
  if (/내일/.test(text)) return add(1);
  if (/오늘/.test(text)) return add(0);
  const m = text.match(/([일월화수목금토])요일/);
  if (!m) return null;
  const target = WEEK.indexOf(m[1]);
  const cur = base.getDay();
  if (/다음\s*주/.test(text)) {
    const toNextMon = (1 - cur + 7) % 7 || 7;
    return add(toNextMon + ((target + 6) % 7));
  }
  return add((target - cur + 7) % 7 || 7);
}

const NATIVE: Record<string, number> = {
  한: 1, 두: 2, 세: 3, 네: 4, 다섯: 5, 여섯: 6, 일곱: 7, 여덟: 8, 아홉: 9, 열: 10, 열한: 11, 열두: 12,
};

// 시간: 아침/오전/점심/오후/저녁, "9시", "아홉 시", "9시 반" -> HH:MM
export function parseTime(text: string): string | null {
  const m = text.match(/(\d{1,2}|열두|열한|열|다섯|여섯|일곱|여덟|아홉|한|두|세|네)\s*시(?!간)\s*(반|(\d{1,2})\s*분)?/);
  if (m) {
    let hour = /^\d/.test(m[1]) ? Number(m[1]) : NATIVE[m[1]];
    const minute = m[2] === "반" ? 30 : m[3] ? Number(m[3]) : 0;
    const pm = /(오후|저녁|밤|점심)/.test(text);
    const am = /(새벽|오전|아침)/.test(text);
    if (pm && hour < 12) hour += 12;
    else if (!am && !pm && hour >= 1 && hour <= 6) hour += 12; // 1~6시는 오후
    if (hour > 23) return null;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
  if (/아침/.test(text)) return "09:00";
  if (/점심/.test(text)) return "12:00";
  if (/저녁/.test(text)) return "17:00";
  if (/오전/.test(text)) return "10:00";
  if (/오후/.test(text)) return "14:00";
  return null;
}

// 목적지: 별명 -> 장소 이름 -> 병원/장터/시장/보건소/약국
export function parsePlace(text: string): string | null {
  for (const p of PLACES) {
    if (text.includes(p.name) || p.aliases.some((a) => text.includes(a))) return p.id;
  }
  return null;
}

export function isNo(text: string) {
  return /아니/.test(text);
}

export function isYes(text: string) {
  return /^\s*(네|예|응|그래|맞|좋)/.test(text) || /맞아|맞습니다/.test(text);
}

export function isPickup(text: string) {
  return /다\s*끝났|끝났어|데리러/.test(text);
}
