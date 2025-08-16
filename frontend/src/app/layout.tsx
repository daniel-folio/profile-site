import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ThreeShapesBackground from "@/components/layout/ThreeShapesBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
import { VisitorTracker } from "@/components/VisitorTracker";
import { MaintenanceMode } from "@/components/MaintenanceMode";
import type { Metadata } from "next";

// 이 설정을 추가하면 앱 전체가 동적으로 렌더링됩니다.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "DaeSung Han",
  description: "DaeSung Han's developer portfolio and project showcase.",
  keywords: ["Developer", "Portfolio", "Frontend", "Backend", "Fullstack"],
  authors: [{ name: "DaeSung Han" }],
  openGraph: {
    title: "DaeSung Han",
    description: "DaeSung Han's developer portfolio and project showcase.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fff" />
        {/* <link rel="icon" type="image/x-icon" href="/favicon.ico" /> */}
      </head>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
        >
          <MaintenanceMode>
            <VisitorTracker />
            <ThreeShapesBackground />
            <div className="relative z-10 flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </MaintenanceMode>
        </ThemeProvider>
      </body>
    </html>
  )
}
