"use client";

import { useStore } from "./store";

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
    const ko = synth.getVoices().find((v) => v.lang.startsWith("ko"));
    if (ko) u.voice = ko;
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
