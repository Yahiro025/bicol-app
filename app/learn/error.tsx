'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

export default function LearnError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Learn page error:', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-text)' }}>
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--editorial-text)' }}>Unable to Load Learning Module</h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--editorial-muted)' }}>
            Something went wrong while loading the drills. You can use fallback content or try again.
          </p>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={reset}
            className="px-6 py-3 font-bold rounded-xl transition-colors flex items-center gap-2 active:scale-95" style={{ backgroundColor: 'var(--editorial-accent)', color: '#fff' }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 font-bold rounded-xl transition-colors flex items-center gap-2 active:scale-95" style={{ backgroundColor: 'var(--editorial-surface)', color: 'var(--editorial-text)', border: '1px solid var(--editorial-border)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
