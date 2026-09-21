import { PhoneFrame, TopBar } from "@/components/ui";

export default function Page() {
  return (
    <PhoneFrame tabs={false}>
      <TopBar title="온보딩" left="none" />
    </PhoneFrame>
  );
}
