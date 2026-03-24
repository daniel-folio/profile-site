import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { VisitorTracker } from "@/components/common/VisitorTracker";
import { MaintenanceMode } from "@/components/common/MaintenanceMode";
import type { Metadata } from "next";
import LayoutV1 from '@/components/v1/layout/LayoutV1';
import LayoutV2 from '@/components/v2/layout/LayoutV2';
import { getSiteSettings } from '@/lib/siteSettings';

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // 백엔드 설정에서 포트폴리오 버전 확인 (기본값: v1)
  const settings = await getSiteSettings();
  const isV2 = settings.portfolioVersion === 'v2';

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fff" />
      </head>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
        >
          <MaintenanceMode>
            <VisitorTracker />
            {isV2 ? (
              <LayoutV2>{children}</LayoutV2>
            ) : (
              <LayoutV1>{children}</LayoutV1>
            )}
          </MaintenanceMode>
        </ThemeProvider>
      </body>
    </html>
  )
}
