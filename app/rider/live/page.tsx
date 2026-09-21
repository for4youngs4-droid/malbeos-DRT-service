import { PhoneFrame, TopBar } from "@/components/ui";

export default function Page() {
  return (
    <PhoneFrame tabs={true}>
      <TopBar title="이동 중" left="back" />
    </PhoneFrame>
  );
}
