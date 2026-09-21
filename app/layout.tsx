import type { Metadata, Viewport } from "next";
import "./globals.css";

// viewportFit: 폰에서 화면 끝까지 그리고, 상태바·홈바 자리는 아래 CSS(env(safe-area-inset-*))로 직접 비운다
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "온다 DRT",
  description: "당신의 이동을 먼저 생각하는 DRT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
