"use client";

import { useSyncExternalStore } from "react";
import { useStore } from "./store";

// ---- 목소리 고르기 ----
// 자연스러운 목소리일수록 점수를 높게 (Edge의 Natural, 구글, 애플 등). 옛날 스타일(Heami)은 낮게
function voiceScore(v: SpeechSynthesisVoice) {
  let s = 0;
  if (/natural|neural/i.test(v.name)) s += 100;
  if (/online/i.test(v.name)) s += 50;
  if (/google/i.test(v.name)) s += 40;
  if (/sunhi|injoon|yuna|sora|nara|flo|shelley/i.test(v.name)) s += 30;
  if (!v.localService) s += 5;
  if (/heami|yumi/i.test(v.name)) s -= 20;
  return s;
}

let cache: SpeechSynthesisVoice[] = [];
const EMPTY: SpeechSynthesisVoice[] = [];

function readVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return EMPTY;
  const list = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith("ko"))
    .sort((a, b) => voiceScore(b) - voiceScore(a));
  // 내용이 같으면 예전 배열을 그대로 돌려줘서 불필요한 다시 그리기를 막는다
  if (list.length === cache.length && list.every((v, i) => v.name === cache[i].name)) return cache;
  cache = list;
  return cache;
}

function subscribeVoices(cb: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return () => {};
  const synth = window.speechSynthesis;
  synth.addEventListener("voiceschanged", cb);
  synth.getVoices(); // 목록 불러오기를 시작시킨다
  // 이벤트를 놓쳐도 다시 확인한다 (브라우저마다 목록이 늦게 채워짐)
  const timers = [300, 1000, 2500].map((ms) => setTimeout(cb, ms));
  return () => {
    synth.removeEventListener("voiceschanged", cb);
    timers.forEach(clearTimeout);
  };
}

// 쓸 수 있는 한국어 목소리 (좋은 순서)
export function useKoVoices() {
  return useSyncExternalStore(subscribeVoices, readVoices, () => EMPTY);
}

function pickVoice() {
  const voices = readVoices();
  const chosen = useStore.getState().voiceName;
  return voices.find((v) => v.name === chosen) ?? voices[0];
}

// 한국어로 읽어주기. 읽기가 끝나면 Promise가 끝난다. 설정에서 끄면 바로 끝난다
export function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
    if (!useStore.getState().voiceOn) return resolve();
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 0.9;
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    synth.speak(u);
  });
}

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

let current: Recognition | null = null;

// 한 문장을 듣고 글자로 돌려준다.
// 8초 동안 말이 없으면 "" / 지원 안 되거나 마이크가 막혀 있으면 null
// 주의: speak()가 끝난 뒤에 불러야 자기 목소리를 듣지 않는다
export function listen(onInterim?: (text: string) => void): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return resolve(null);

    stopListening();
    const rec = new SR();
    current = rec;
    rec.lang = "ko-KR";
    rec.interimResults = true;
    rec.continuous = false;

    let text = "";
    let blocked = false;
    const timer = setTimeout(() => rec.stop(), 8000);

    rec.onresult = (e) => {
      text = Array.from(e.results).map((r) => r[0].transcript).join("");
      onInterim?.(text);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") blocked = true;
    };
    rec.onend = () => {
      clearTimeout(timer);
      if (current === rec) current = null;
      resolve(blocked ? null : text.trim());
    };
    try {
      rec.start();
    } catch {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

export function stopListening() {
  if (current) {
    current.abort();
    current = null;
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
