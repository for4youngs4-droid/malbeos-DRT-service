"use client";

import { CircleHelp } from "lucide-react";
import VoiceAssistant from "@/components/VoiceAssistant";
import { PhoneFrame, TopBar } from "@/components/ui";
import { speak } from "@/lib/speech";

export default function VoicePage() {
  return (
    <PhoneFrame>
      <TopBar
        left="back"
        right={
          <button
            type="button"
            aria-label="도움말"
            onClick={() => speak("마이크를 누르고 가고 싶은 곳과 때를 말씀해 주세요. 예를 들어, 내일 병원 가고 싶어요.")}
            className="flex h-12 w-12 items-center justify-center text-ink"
          >
            <CircleHelp size={26} />
          </button>
        }
      />
      <div className="px-5 pt-2">
        <VoiceAssistant />
      </div>
    </PhoneFrame>
  );
}
