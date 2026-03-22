import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "사기 사이트 진단기 | 무료 웹사이트 위험도 분석",
  description:
    "URL을 입력하면 AI와 정부 공공데이터로 해당 웹사이트의 위험도를 분석합니다. 금융 투자 피해 및 불법 쇼핑몰 피해를 예방하세요.",
  keywords: "사이트 안전 검사, 피싱 사이트 검사, 사기 사이트 확인, 인터넷 사기 예방",
  robots: "index, follow",
  openGraph: {
    title: "사기 사이트 진단기 — 무료 웹사이트 위험도 분석",
    description: "AI와 정부 데이터로 웹사이트 위험도를 즉시 분석합니다.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
