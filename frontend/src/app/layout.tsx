import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ThreeShapesBackground from "@/components/layout/ThreeShapesBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개발자 포트폴리오",
  description: "개발자로서의 성장 과정과 프로젝트들을 공유하는 개인 포트폴리오입니다.",
  keywords: ["개발자", "포트폴리오", "프론트엔드", "백엔드", "풀스택"],
  authors: [{ name: "Portfolio Owner" }],
  openGraph: {
    title: "개발자 포트폴리오",
    description: "개발자로서의 성장 과정과 프로젝트들을 공유하는 개인 포트폴리오입니다.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
        >
          <ThreeShapesBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
