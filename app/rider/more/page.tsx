"use client";

import { Check, CircleHelp, History, Phone, Volume2 } from "lucide-react";
import { Badge, Card, InfoRow, PhoneFrame, Toggle, TopBar } from "@/components/ui";
import { speak, useKoVoices } from "@/lib/speech";
import { useStore } from "@/lib/store";

const SOON = [
  { icon: History, title: "이동 기록" },
  { icon: CircleHelp, title: "도움말" },
  { icon: Phone, title: "고객센터" },
];

export default function MorePage() {
  const voiceOn = useStore((s) => s.voiceOn);
  const setVoiceOn = useStore((s) => s.setVoiceOn);
  const voiceName = useStore((s) => s.voiceName);
  const setVoiceName = useStore((s) => s.setVoiceName);
  const voices = useKoVoices();
  const current = voices.find((v) => v.name === voiceName)?.name ?? voices[0]?.name;

  // "Microsoft SunHi Online (Natural) - Korean (Korea)" -> "SunHi Online (Natural)"
  const short = (n: string) => n.replace(/^Microsoft\s+/, "").replace(/\s+-\s+Korean.*$/, "");

  const pick = (name: string) => {
    setVoiceName(name);
    // 고르면 바로 들려준다 (아직 저장 전이라 직접 읽힌 목소리로 시험)
    setTimeout(() => speak("안녕하세요, 김영은님. 어디로 가실까요?"), 0);
  };

  return (
    <PhoneFrame tabs>
      <TopBar title="더보기" />
      <div className="space-y-4 px-5 pt-4">
        <Card>
          <InfoRow
            icon={Volume2}
            title="음성 안내"
            desc={voiceOn ? "켜져 있어요" : "꺼져 있어요"}
            right={<Toggle checked={voiceOn} onChange={setVoiceOn} label="음성 안내" />}
          />
        </Card>
        <Card className="space-y-3">
          <InfoRow icon={Volume2} title="목소리 고르기" desc="누르면 바로 들어볼 수 있어요" />
          {voices.length === 0 && <p className="text-lg text-sub">이 브라우저에는 한국어 목소리가 없어요.</p>}
          {voices.map((v, i) => (
            <button
              key={v.name}
              type="button"
              onClick={() => pick(v.name)}
              className={`flex min-h-14 w-full items-center justify-between gap-2 rounded-pill px-5 text-left text-lg font-bold ${
                v.name === current ? "bg-brand text-white" : "bg-sky text-ink"
              }`}
            >
              <span>
                {short(v.name)}
                {i === 0 && voices.length > 1 ? " (추천)" : ""}
              </span>
              {v.name === current && <Check size={22} />}
            </button>
          ))}
          {voices.length === 1 && (
            <p className="text-lg text-sub">더 자연스러운 목소리는 Edge 브라우저에서 볼 수 있어요.</p>
          )}
        </Card>
        {SOON.map(({ icon, title }) => (
          <Card key={title}>
            <InfoRow icon={icon} title={title} right={<Badge>준비 중</Badge>} />
          </Card>
        ))}
      </div>
    </PhoneFrame>
  );
}
