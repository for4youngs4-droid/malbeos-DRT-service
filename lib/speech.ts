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

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
