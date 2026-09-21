import { PhoneFrame, TopBar } from "@/components/ui";

export default function Page() {
  return (
    <PhoneFrame tabs={false}>
      <TopBar title="루틴 알림" left="close" />
    </PhoneFrame>
  );
}
