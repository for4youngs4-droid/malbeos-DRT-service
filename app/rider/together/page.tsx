import { PhoneFrame, TopBar } from "@/components/ui";

export default function Page() {
  return (
    <PhoneFrame tabs={true}>
      <TopBar title="함께 이동" left="none" />
    </PhoneFrame>
  );
}
