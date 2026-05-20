import type { Metadata } from "next";
import "./globals.css";
import LanguageToggle from "@/components/LanguageToggle";
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import LoadingBar from "@/components/ui/LoadingBar";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "BIKOL - Master the Bikol Language",
  description: "Search thousands of Bikol words across 5+ dialects with AI-enhanced translations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-[#fafafa] selection:bg-blue-500/30">
        <Suspense fallback={null}>
          <LoadingBar />
        </Suspense>
        <header className="border-b border-zinc-800/50 px-6 py-4 sticky top-0 bg-[#09090b]/80 backdrop-blur-xl z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-display font-black tracking-tighter hover:scale-105 transition-transform active:scale-95">
              <Link href="/" className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">BIKOL</Link>
            </h1>
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest">
                <Link href="/" className="text-zinc-500 hover:text-white transition-colors">Home</Link>
                <Link href="/browse" className="text-zinc-500 hover:text-white transition-colors">Browse</Link>
                <Link href="/learn" className="text-zinc-500 hover:text-white transition-colors">Learn</Link>
              </nav>
              <LanguageToggle />
            </div>
          </div>
        </header>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </body>
    </html>
  );
}
