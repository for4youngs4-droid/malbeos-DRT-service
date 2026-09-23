"use client";

import { Button, Illustration } from "@/components/ui";

// 빈 화면: 일러스트 + 제목 + 설명 + 다음에 할 일 버튼
// 일러스트는 /public/images/empty-state.png (없으면 연한 파랑 자리표시)
// 일러스트와 글씨는 화면 한가운데, 버튼은 엄지손가락이 닿는 하단 탭 바로 위.
// -mb-10은 화면 아래쪽 여백을 줄여서 버튼을 하단 탭에 더 가깝게 한다
export default function EmptyState({
  title,
  desc,
  actionLabel,
  onAction,
  tourTarget,
}: {
  title: string;
  desc: string;
  actionLabel: string;
  onAction: () => void;
  tourTarget?: string; // 도움말 가이드가 이 화면을 가리킬 때 쓰는 표시
}) {
  return (
    <div data-tour-target={tourTarget} className="-mb-10 flex flex-auto flex-col px-5 pb-3 text-center">
      <div className="flex flex-1 flex-col items-center justify-center pt-8">
        <Illustration name="empty-state" className="h-44 w-64" />
        <h2 className="mt-5 text-[22px] font-semibold leading-snug tracking-tight">{title}</h2>
        <p className="mt-1 text-lg text-sub">{desc}</p>
      </div>
      <Button flat onClick={onAction}>{actionLabel}</Button>
    </div>
  );
}
