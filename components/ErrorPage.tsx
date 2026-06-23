"use client";

import { useEffect } from "react";
import Link from "next/link";

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  icon?: string;
  title: string;
  message: string;
  homeHref?: string;
  homeLabel?: string;
}

export default function ErrorPage({ error, reset, icon = "⚠️", title, message, homeHref = "/", homeLabel = "Go Home" }: ErrorPageProps) {
  useEffect(() => { console.error(`${title}:`, error); }, [error, title]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--editorial-bg)' }}>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-5xl">{icon}</div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--editorial-text)' }}>{title}</h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--editorial-muted)' }}>{message}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={reset} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors active:scale-95">
            Try Again
          </button>
          <Link href={homeHref} className="px-6 py-3 font-bold rounded-xl transition-colors" style={{ backgroundColor: 'var(--editorial-surface)', color: 'var(--editorial-text)', border: '1px solid var(--editorial-border)' }}>
            {homeLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
