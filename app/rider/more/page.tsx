"use client";

import { Check, CircleHelp, History, Phone, Volume2 } from "lucide-react";
import { Badge, ListGroup, ListRow, PhoneFrame, SectionTitle, Toggle, TopBar } from "@/components/ui";
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
    void speak("안녕하세요, 김영은님. 어디로 가실까요?", true); // 고르면 바로 들려준다
  };

  return (
    <PhoneFrame tabs>
      <TopBar title="설정" />
      <div className="space-y-3 px-5 pt-3">
        <SectionTitle>알림 방식</SectionTitle>
        <ListGroup>
          <ListRow
            icon={Volume2}
            title="음성 안내"
            desc={voiceOn ? "켜져 있어요" : "꺼져 있어요"}
            right={<Toggle checked={voiceOn} onChange={setVoiceOn} label="음성 안내" />}
          />
        </ListGroup>

        <SectionTitle>목소리</SectionTitle>
        <ListGroup>
          {voices.length === 0 && <ListRow title="한국어 목소리가 없어요" desc="다른 브라우저에서 열어 보세요" />}
          {voices.map((v, i) => (
            <button key={v.name} type="button" onClick={() => pick(v.name)} className="block w-full text-left">
              <ListRow
                title={short(v.name)}
                desc={i === 0 && voices.length > 1 ? "추천 · 누르면 들어볼 수 있어요" : "누르면 들어볼 수 있어요"}
                right={v.name === current ? <Check size={22} className="text-brand" /> : undefined}
              />
            </button>
          ))}
        </ListGroup>
        {voices.length === 1 && <p className="px-1 text-lg text-sub">더 자연스러운 목소리는 Edge 브라우저에서 볼 수 있어요</p>}

        <SectionTitle>기타</SectionTitle>
        <ListGroup>
          {SOON.map(({ icon, title }) => (
            <ListRow key={title} icon={icon} title={title} right={<Badge tone="warn">준비 중</Badge>} />
          ))}
        </ListGroup>
      </div>
    </PhoneFrame>
  );
}
