import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "말벗 DRT",
  description: "음성으로 예약하는 수요응답형 버스",
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
