"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
          className="group flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Archive</span>
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-blue-500/50" />
            <span className="text-blue-500 text-xs font-bold uppercase tracking-[0.3em]">Study Mode</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tight">
            Flashcards
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl leading-relaxed">
            Master Bikol vocabulary with interactive flip cards. Choose a deck size and test your recall.
          </p>
        </div>

        {/* Tier Selection */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4" /> Deck Size
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {TIERS.map((tier) => (
              <button
                key={tier.limit}
                onClick={() => fetchWords(tier.limit)}
                disabled={isLoading}
                className={`p-6 rounded-2xl border text-left transition-all disabled:opacity-50 ${
                  selectedTier === tier.limit && words.length > 0
                    ? "border-blue-500/40 bg-blue-500/5 dark:bg-blue-500/10"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/50"
                }`}
              >
                <div className="text-2xl font-black text-blue-500">{tier.label}</div>
                <div className="text-xs text-zinc-400 mt-1">{tier.desc}</div>
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
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </motion.div>
            <p className="text-zinc-500 text-sm font-medium">Loading words...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-2xl text-center space-y-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <button
              onClick={() => fetchWords(25)}
              className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Ready state */}
        {!isLoading && !error && words.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Shuffle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">{words.length} words ready</p>
                <p className="text-xs text-zinc-500">Randomly selected from the dictionary</p>
              </div>
            </div>

            <button
              onClick={() => setIsActive(true)}
              className="w-full py-5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20 text-lg"
            >
              Start Studying
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && words.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <p>No words available. Try again later.</p>
          </div>
        )}
      </div>
    </main>
  );
}
