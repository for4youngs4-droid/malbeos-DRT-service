import { PhoneFrame, TopBar } from "@/components/ui";

export default function Page() {
  return (
    <PhoneFrame tabs={true}>
      <TopBar title="내 루틴" left="none" />
    </PhoneFrame>
  );
}
