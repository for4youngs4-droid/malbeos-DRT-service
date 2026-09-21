import { PhoneFrame, TopBar } from "@/components/ui";

export default function Page() {
  return (
    <PhoneFrame tabs={true}>
      <TopBar title="하루 이동 계획" left="back" />
    </PhoneFrame>
  );
}
