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

// 0=일 ... 6=토 -> "화"
export function dayLabel(weekday: number) {
  return DAYS[weekday];
}

// "09:00" -> "오전 9:00"
export function koTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${h12}:${String(m).padStart(2, "0")}`;
}

// "09:00" + 90 -> "10:30"
export function addMinutes(hhmm: string, min: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const t = (h * 60 + m + min + 24 * 60) % (24 * 60);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

// 가장 가까운 30분으로 (11:55 -> 12:00)
export function roundHalfHour(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const t = Math.round((h * 60 + m) / 30) * 30;
  return addMinutes("00:00", t);
}

// 읽어주는 말: "11시 반", "9시", "2시 10분"
export function spokenClock(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}시` : m === 30 ? `${h12}시 반` : `${h12}시 ${m}분`;
}

// "오전 9시", "오후 2시 반"
export function spokenTime(hhmm: string) {
  return `${Number(hhmm.split(":")[0]) < 12 ? "오전" : "오후"} ${spokenClock(hhmm)}`;
}

// "2026-09-22" -> "9월 22일 (화)"
export function koDate(dateStr: string) {
  const [, m, d] = dateStr.split("-").map(Number);
  return `${m}월 ${d}일 (${weekdayName(dateStr)})`;
}
