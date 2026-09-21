"use client";

import { CircleHelp, History, Phone, Volume2 } from "lucide-react";
import { Badge, Card, InfoRow, PhoneFrame, Toggle, TopBar } from "@/components/ui";
import { useStore } from "@/lib/store";

const SOON = [
  { icon: History, title: "이동 기록" },
  { icon: CircleHelp, title: "도움말" },
  { icon: Phone, title: "고객센터" },
];

export default function MorePage() {
  const voiceOn = useStore((s) => s.voiceOn);
  const setVoiceOn = useStore((s) => s.setVoiceOn);

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
        {SOON.map(({ icon, title }) => (
          <Card key={title}>
            <InfoRow icon={icon} title={title} right={<Badge>준비 중</Badge>} />
          </Card>
        ))}
      </div>
    </PhoneFrame>
  );
}
