import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIエージェント体験デモ | 関西ぱど AIブートキャンプ",
  description:
    "医療・中小企業・個人事業主の3業種で、自律型AIエージェントの動きを体験できるデモ。ReActフレームワークで状況分析→自律アクション→実行→完了報告まで思考過程を可視化し、最終承認は人間が行うHuman-in-the-Loop設計。関西ぱど AIブートキャンプ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="relative min-h-full flex flex-col overflow-x-hidden">
        <div className="bg-orbs" aria-hidden />
        <div className="bg-grid" aria-hidden />
        <div className="relative z-[1] flex min-h-full flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
