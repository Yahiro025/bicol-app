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

export default function ErrorPage({
  error,
  reset,
  icon = "⚠️",
  title,
  message,
  homeHref = "/",
  homeLabel = "Go Home",
}: ErrorPageProps) {
  useEffect(() => {
    console.error(`${title}:`, error);
  }, [error, title]);

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-5xl">{icon}</div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {title}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
          {message}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors active:scale-95"
          >
            Try Again
          </button>
          <Link
            href={homeHref}
            className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl transition-colors"
          >
            {homeLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
