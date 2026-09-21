// 날짜·시각을 글자로 바꾸는 도우미 (현재 시각은 읽지 않음. 값은 store의 가상 시각에서 받는다)

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function dateKey(ts: number) {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function weekdayOf(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function weekdayName(dateStr: string) {
  return DAYS[weekdayOf(dateStr)];
}

// "09:00" -> "오전 9:00"
export function koTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${h12}:${String(m).padStart(2, "0")}`;
}

// "2026-09-22" -> "9월 22일 (화)"
export function koDate(dateStr: string) {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${m}월 ${d}일 (${weekdayName(dateStr)})`;
}
