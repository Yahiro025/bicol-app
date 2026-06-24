import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";

import LanguageToggle from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import DesktopNav from "@/components/DesktopNav";
import PageTransition from "@/components/PageTransition";
import NavigationLoadingBar from "@/components/NavigationLoadingBar";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const SITE_NAME = "BIKOL Dictionary";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bikoldictionary.app";

export const metadata: Metadata = {
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    {
      rel: 'icon',
      url: '/favicon-dark.png',
      media: '(prefers-color-scheme: dark)',
    },
    {
      rel: 'icon',
      url: '/favicon-light.png',
      media: '(prefers-color-scheme: light)',
    },
  ],
  title: { default: `${SITE_NAME} — Bikol Language Dictionary & Learning App`, template: "%s — BIKOL Dictionary" },
  description: "Search thousands of Bikol words across 5+ dialects with AI-enhanced translations, verb conjugations, interactive drills, and flashcards.",
  keywords: ["Bikol dictionary", "Bikol language", "Bikolano", "Bicol dictionary", "learn Bikol", "Bikol verbs", "Bikol grammar"],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_PH",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Bikol Language Dictionary & Learning App`,
    description: "Discover the richness of the Bikol language. Search thousands of words, conjugate verbs, practice with interactive drills, and master Bikol through flashcards and AI-powered dialogue.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Bikol Language Dictionary & Learning App`,
    description: "Discover the richness of the Bikol language. Search, conjugate, learn, and master Bikol.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} min-h-screen selection:bg-[var(--editorial-accent)]/30 selection:text-[var(--editorial-text)]`} style={{ backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-text)' }}>
        <Providers>
          <div id="main-content">
            <Suspense fallback={null}>
              <NavigationLoadingBar />
            </Suspense>
            <header className="header-glass border-b px-6 py-4 sticky top-0 backdrop-blur-xl z-50">
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <h1 className="text-2xl font-display font-black tracking-tighter hover:scale-105 transition-transform active:scale-95">
                  <Link href="/" style={{ color: 'var(--editorial-accent)' }}>BIKOL</Link>
                </h1>
                <div className="flex items-center gap-6">
                  <DesktopNav />
                  <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <LanguageToggle />
                    <MobileNav />
                  </div>
                </div>
              </div>
            </header>
            <PwaInstallPrompt />
            <PageTransition>{children}</PageTransition>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
