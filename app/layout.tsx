import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BikolDict - Master the Bikol Language",
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
        {children}
      </body>
    </html>
  );
}
