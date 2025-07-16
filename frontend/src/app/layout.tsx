import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ThreeShapesBackground from "@/components/layout/ThreeShapesBackground";
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";

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
        {/* <link rel="icon" type="image/x-icon" href="/favicon.ico" /> */}
      </head>
      <body className={GeistSans.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
