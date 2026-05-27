import type { Metadata } from "next";
import "./globals.css";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import LoadingBar from "@/components/ui/LoadingBar";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: {
    default: "BIKOL — Bikol Language Dictionary & Learning App",
    template: "%s — BIKOL Dictionary"
  },
  description: "Search thousands of Bikol words across 5+ dialects with AI-enhanced translations, verb conjugations, interactive drills, and flashcards.",
  keywords: ["Bikol dictionary", "Bikol language", "Bikolano", "Bicol dictionary", "learn Bikol", "Bikol verbs", "Bikol grammar"],
  authors: [{ name: "BIKOL Dictionary" }],
  creator: "BIKOL Dictionary",
  publisher: "BIKOL Dictionary",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://bikoldictionary.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    siteName: "BIKOL Dictionary",
    title: "BIKOL — Bikol Language Dictionary & Learning App",
    description: "Discover the richness of the Bikol language. Search thousands of words, conjugate verbs, practice with interactive drills, and master Bikol through flashcards and AI-powered dialogue.",
    images: [{
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "BIKOL Dictionary"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "BIKOL — Bikol Language Dictionary & Learning App",
    description: "Discover the richness of the Bikol language. Search, conjugate, learn, and master Bikol.",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    }
  },
  verification: {
    // Add your Google Search Console verification code here when available
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme');
              if (!theme) {
                theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              }
              if (theme === 'light') {
                document.documentElement.classList.remove('dark');
              } else {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className="min-h-screen bg-white text-zinc-900 dark:bg-[#09090b] dark:text-[#fafafa] selection:bg-blue-500/30">
        <Suspense fallback={null}>
          <LoadingBar />
        </Suspense>
        <header className="border-b border-zinc-200 dark:border-zinc-800/50 px-6 py-4 sticky top-0 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-display font-black tracking-tighter hover:scale-105 transition-transform active:scale-95">
              <Link href="/" className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">BIKOL</Link>
            </h1>
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest">
                <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
                <Link href="/browse" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Browse</Link>
                <Link href="/learn" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Learn</Link>
                <Link href="/flashcards" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Study</Link>
              </nav>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </div>
        </header>
        <PwaInstallPrompt />
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </body>
    </html>
  );
}
