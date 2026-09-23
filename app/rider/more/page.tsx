"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight, CircleHelp, History, Phone, Volume2 } from "lucide-react";
import { Badge, ListGroup, ListRow, PhoneFrame, SectionTitle, Toggle, TopBar } from "@/components/ui";
import { HERO } from "@/lib/data";
import { speak, useKoVoices } from "@/lib/speech";
import { useStore } from "@/lib/store";

const VISIBLE_VOICES = 3; // 목소리는 3개까지만 바로 보이고, 나머지는 "더보기"로 접는다

const SOON = [{ icon: History, title: "이동 기록" }];
const HELP_NUMBER = "0000-0000";

export default function MorePage() {
  const voiceOn = useStore((s) => s.voiceOn);
  const setVoiceOn = useStore((s) => s.setVoiceOn);
  const startTour = useStore((s) => s.startTour);
  const voiceName = useStore((s) => s.voiceName);
  const setVoiceName = useStore((s) => s.setVoiceName);
  const voices = useKoVoices();
  const [showMore, setShowMore] = useState(false);
  const current = voices.find((v) => v.name === voiceName)?.name ?? voices[0]?.name;
  // 지금 쓰는(선택한) 목소리를 항상 맨 위에 두고, 나머지는 추천 순서대로
  const ordered = [...voices].sort((a, b) => Number(b.name === current) - Number(a.name === current));
  const recommended = voices[0]?.name; // 가장 자연스러운 목소리
  const shown = ordered.slice(0, VISIBLE_VOICES);
  const rest = ordered.slice(VISIBLE_VOICES);

  // "Microsoft SunHi Online (Natural) - Korean (Korea)" -> "SunHi Online" (괄호 부분은 뺀다)
  const short = (n: string) => n.replace(/^Microsoft\s+/, "").replace(/\s+-\s+Korean.*$/, "").replace(/\s*\([^)]*\)/g, "");

  const pick = (name: string) => {
    setVoiceName(name);
    void speak(`안녕하세요, ${HERO.name}님. 어디로 가실까요?`, true); // 고르면 바로 들려준다
  };

  const voiceRow = (v: SpeechSynthesisVoice) => (
    <button key={v.name} type="button" onClick={() => pick(v.name)} className="block w-full text-left">
      <ListRow
        title={short(v.name)}
        desc={v.name === recommended && voices.length > 1 ? "추천 · 누르면 들어볼 수 있어요" : "누르면 들어볼 수 있어요"}
        right={v.name === current ? <Check size={22} className="text-brand" /> : undefined}
      />
    </button>
  );

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
          {shown.map((v) => voiceRow(v))}
          {rest.length > 0 && (
            <>
              {/* 아코디언: 높이가 0에서 자기 크기로 부드럽게 열린다 */}
              <div className={`grid border-t-0! transition-[grid-template-rows] duration-300 ease-out ${showMore ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="min-h-0 overflow-hidden" inert={!showMore}>
                  <div className="divide-y divide-line border-t border-line">{rest.map((v) => voiceRow(v))}</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowMore(!showMore)} aria-expanded={showMore} className="block w-full text-left">
                <ListRow
                  title={showMore ? "접기" : "더보기"}
                  desc={showMore ? undefined : `목소리 ${rest.length}개가 더 있어요`}
                  right={<ChevronDown size={22} className={`text-sub transition-transform duration-300 ${showMore ? "rotate-180" : ""}`} />}
                />
              </button>
            </>
          )}
        </ListGroup>
        {voices.length === 1 && <p className="px-1 text-lg text-sub">더 자연스러운 목소리는 Edge 브라우저에서 볼 수 있어요</p>}

        <SectionTitle>기타</SectionTitle>
        <ListGroup>
          <button type="button" onClick={startTour} className="block w-full text-left">
            <ListRow
              icon={CircleHelp}
              title="도움말"
              desc="주요 기능을 하나씩 안내해드려요"
              right={<ChevronRight size={22} className="text-sub" />}
            />
          </button>
          <a href={`tel:${HELP_NUMBER}`} className="block w-full text-left">
            <ListRow icon={Phone} title="고객센터" desc={`${HELP_NUMBER} · 눌러서 바로 전화해요`} right={<ChevronRight size={22} className="text-sub" />} />
          </a>
          {SOON.map(({ icon, title }) => (
            <ListRow key={title} icon={icon} title={title} right={<Badge tone="warn">준비 중</Badge>} />
          ))}
        </ListGroup>
      </div>
    </PhoneFrame>
  );
}
