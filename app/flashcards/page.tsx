"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Shuffle, Layers } from "lucide-react";
import Flashcards from "@/components/Flashcards";
import type { Word } from "@/lib/types/learn";

const TIERS = [
  { label: "Top 25", limit: 25, desc: "Essential everyday words" },
  { label: "Top 50", limit: 50, desc: "Core vocabulary" },
  { label: "Top 100", limit: 100, desc: "Conversational fluency" },
];

export default function FlashcardsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(25);

  const fetchWords = useCallback(async (limit: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/learn?mode=flashcards&limit=${limit}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        setError("No words available. Try a different tier.");
        setWords([]);
      } else {
        setWords(data);
        setSelectedTier(limit);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load words");
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords(25);
  }, [fetchWords]);

  if (isActive && words.length > 0) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--editorial-bg)' }}>
        <Flashcards words={words} onExit={() => setIsActive(false)} />
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--editorial-bg)', color: 'var(--editorial-text)' }}>
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        {/* Back link */}
        <Link
          href="/"
          className="group flex items-center gap-2 transition-colors w-fit"
          style={{ color: 'var(--editorial-muted)' }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Archive</span>
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px w-8" style={{ backgroundColor: 'var(--editorial-accent)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: 'var(--editorial-accent)' }}>Study Mode</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tight">
            Flashcards
          </h1>
          <p className="text-lg max-w-xl leading-relaxed" style={{ color: 'var(--editorial-muted)' }}>
            Master Bikol vocabulary with interactive flip cards. Choose a deck size and test your recall.
          </p>
        </div>

        {/* Tier Selection */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--editorial-muted)' }}>
            <Layers className="w-4 h-4" /> Deck Size
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <button
                key={tier.limit}
                onClick={() => fetchWords(tier.limit)}
                disabled={isLoading}
                className="p-6 rounded-2xl border text-left transition-all disabled:opacity-50"
                style={{
                  backgroundColor: selectedTier === tier.limit && words.length > 0 ? 'rgba(196,155,76,0.08)' : 'var(--editorial-surface-raised)',
                  borderColor: selectedTier === tier.limit && words.length > 0 ? 'rgba(196,155,76,0.35)' : 'var(--editorial-border)',
                }}
              >
                <div className="text-2xl font-black" style={{ color: 'var(--editorial-accent)' }}>{tier.label}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--editorial-muted)' }}>{tier.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <RefreshCw className="w-8 h-8" style={{ color: 'var(--editorial-accent)' }} />
            </motion.div>
            <p className="text-sm font-medium" style={{ color: 'var(--editorial-muted)' }}>Loading words...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="p-6 rounded-2xl text-center space-y-3" style={{ backgroundColor: 'rgba(194,106,62,0.08)', border: '1px solid rgba(194,106,62,0.2)' }}>
            <p className="text-sm" style={{ color: 'var(--editorial-rust)' }}>{error}</p>
            <button
              onClick={() => fetchWords(25)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-colors"
              style={{ backgroundColor: 'rgba(194,106,62,0.12)', color: 'var(--editorial-rust)' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Ready state */}
        {!isLoading && !error && words.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(196,155,76,0.1)' }}>
                <Shuffle className="w-5 h-5" style={{ color: 'var(--editorial-accent)' }} />
              </div>
              <div>
                <p className="font-bold" style={{ color: 'var(--editorial-text)' }}>{words.length} words ready</p>
                <p className="text-xs" style={{ color: 'var(--editorial-muted)' }}>Randomly selected from the dictionary</p>
              </div>
            </div>

            <button
              onClick={() => setIsActive(true)}
              className="w-full py-5 font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg text-lg"
              style={{ backgroundColor: 'var(--editorial-accent)', color: '#fff', boxShadow: '0 10px 30px -5px rgba(196,155,76,0.3)' }}
            >
              Start Studying
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && words.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--editorial-muted)' }}>
            <p>No words available. Try again later.</p>
          </div>
        )}
      </div>
    </main>
  );
}
