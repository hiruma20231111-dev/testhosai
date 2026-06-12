import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediAgent ─ 病院業務 自律AIエージェント",
  description:
    "院長秘書・総務業務を兼任する自律型AIエージェントのデモ。ReActフレームワークで状況分析→自律アクション→実行→完了報告まで思考過程を可視化し、最終承認は人間が行うHuman-in-the-Loop設計。",
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
