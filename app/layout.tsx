import type { Metadata } from "next";
import "./globals.css";
import LanguageToggle from "@/components/LanguageToggle";

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
      <body className="min-h-screen bg-zinc-950 text-white">
        <header className="border-b border-zinc-800 px-6 py-4 sticky top-0 bg-zinc-950/80 backdrop-blur-md z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
<h1 className="text-2xl font-bold tracking-tight">
  <a href="/">BIKOL</a>
</h1>
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex gap-6 text-sm font-medium">
                <a href="/" className="text-zinc-400 hover:text-white transition">Home</a>
                <a href="/browse" className="text-zinc-400 hover:text-white transition">Browse</a>
                <a href="/learn" className="text-zinc-400 hover:text-white transition">Learn</a>
              </nav>
              <LanguageToggle />
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
