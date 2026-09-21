import { PhoneFrame, TopBar } from "@/components/ui";

export default function Page() {
  return (
    <PhoneFrame tabs={true}>
      <TopBar title="음성 예약" left="back" />
    </PhoneFrame>
  );
}
