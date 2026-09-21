"use client";

import { Button, Illustration } from "@/components/ui";

// 빈 화면: 일러스트 + 제목 + 설명 + 다음에 할 일 버튼
// 일러스트는 /public/images/empty-state.png (없으면 연한 파랑 자리표시)
export default function EmptyState({
  title,
  desc,
  actionLabel,
  onAction,
}: {
  title: string;
  desc: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex min-h-[28rem] flex-col items-center justify-center px-5 pb-8 text-center">
      <Illustration name="empty-state" className="h-44 w-64" />
      <h2 className="mt-5 text-[22px] font-semibold leading-snug tracking-tight">{title}</h2>
      <p className="mt-1 text-lg text-sub">{desc}</p>
      <div className="mt-6 w-full">
        <Button onClick={onAction}>{actionLabel}</Button>
      </div>
    </div>
  );
}
