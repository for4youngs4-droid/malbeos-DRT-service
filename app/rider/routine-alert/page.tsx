import { redirect } from "next/navigation";

// 루틴 알림은 홈 화면 맨 위에서 바로 답한다
export default function Page() {
  redirect("/rider");
}
