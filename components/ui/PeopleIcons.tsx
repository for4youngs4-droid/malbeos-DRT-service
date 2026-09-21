import { User } from "lucide-react";

// 개인정보 원칙: 이름·위치 없이 인원 수만 익명 아이콘으로 보여준다
export default function PeopleIcons({ count }: { count: number }) {
  return (
    <div className="flex gap-2" aria-label={`${count}명`}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="flex h-9 w-9 items-center justify-center rounded-full tile text-white">
          <User size={20} />
        </span>
      ))}
    </div>
  );
}
