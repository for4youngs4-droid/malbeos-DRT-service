import { redirect } from "next/navigation";

// 이동 중 화면은 "내 이동"(/rider/chain)에 합쳐졌다
export default function Page() {
  redirect("/rider/chain");
}
