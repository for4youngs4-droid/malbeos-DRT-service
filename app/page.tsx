import { redirect } from "next/navigation";

// 시연 조작판 없이 앱만 보여준다: 첫 주소(/)는 바로 온보딩으로 연결
export default function Page() {
  redirect("/onboarding");
}
