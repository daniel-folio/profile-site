import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from "@/features/common/ui/ThemeProvider";
import { VisitorTracker } from "@/features/common/ui/VisitorTracker";
import { MaintenanceMode } from "@/features/common/ui/MaintenanceMode";
import type { Metadata } from "next";
import LayoutV1 from '@/features/public/components/v1/layout/LayoutV1';
import LayoutV2 from '@/features/public/components/v2/layout/LayoutV2';
import { getSiteSettings } from '@/features/common/api/siteSettings';

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

// 버전-레이아웃 맵: 새 버전 추가 시 여기에 한 줄만 추가하면 됩니다.
const LAYOUT_MAP: Record<string, React.ComponentType<{ children: React.ReactNode }>> = {
  v1: LayoutV1,
  v2: LayoutV2,
  // v3: LayoutV3,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const version = settings.portfolioVersion || 'v1';
  // 버전 맵에 없는 값이 오면 v1으로 폴백
  const Layout = LAYOUT_MAP[version] ?? LayoutV1;

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
            <Layout>{children}</Layout>
          </MaintenanceMode>
        </ThemeProvider>
      </body>
    </html>
  )
}
