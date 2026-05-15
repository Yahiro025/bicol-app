import React from 'react';
import './globals.css';
import ThemeToggle from '@/components/ThemeToggle';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4338CA" />
      </head>
      <body className="bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors duration-300">
        <header className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-zinc-100 dark:border-zinc-900">
          <div className="text-xl font-black tracking-tighter text-primary">BIKOLDICT</div>
          <ThemeToggle />
        </header>
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}

