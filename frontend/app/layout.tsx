import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "十大機器學習演算法動態學習網頁",
  description: "基於機器學習演算法研讀報告，結合 Next.js 與 FastAPI，提供互動演練與觀念挑戰的動態學習平台。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>
        {children}
      </body>
    </html>
  );
}
