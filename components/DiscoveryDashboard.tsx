"use client";

import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Volume2,
  TrendingUp,
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
} from "lucide-react";

interface WordOfTheDay {
  word: string;
  partOfSpeech: string;
  definition: string;
  dialect: string;
  exampleSentenceBikol: string;
  exampleSentenceEnglish: string;
}

interface DiscoveryDashboardProps {
  wordOfTheDay: WordOfTheDay;
  trendingWords: string[];
  recentSearches: string[];
  onWordClick: (word: string) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function DiscoveryDashboard({
  wordOfTheDay,
  trendingWords,
  recentSearches,
  onWordClick,
}: DiscoveryDashboardProps) {
  return (
    <section className="w-full">
      {/* ── Editorial Header ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-blue-500" aria-hidden="true" />
          <span className="text-xs font-black text-blue-500 uppercase tracking-widest">
            Discovery
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
          Explore the Language
        </h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed max-w-xl">
          Dive into curated words, trending lookups, and your personal search history.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* ── Word of the Day Hero ─────────────────────────────────── */}
        <motion.article
          variants={itemVariants}
          className="lg:col-span-2"
          aria-label="Word of the Day"
        >
          <div className="relative h-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 md:p-10 overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5">
            {/* Decorative gradient orb */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex items-center gap-2 mb-6">
              <BookOpen className="w-4 h-4 text-blue-500" aria-hidden="true" />
              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Word of the Day
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <h3 className="text-5xl md:text-6xl font-serif font-bold text-zinc-900 dark:text-white tracking-tight">
                    {wordOfTheDay.word}
                  </h3>
                  <button
                    type="button"
                    aria-label={`Play pronunciation of ${wordOfTheDay.word}`}
                    className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-900 active:scale-90"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full border border-zinc-300 dark:border-zinc-700">
                    {wordOfTheDay.partOfSpeech}
                  </span>
                  <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800">
                    {wordOfTheDay.dialect}
                  </span>
                </div>

                <p className="text-xl md:text-2xl text-zinc-700 dark:text-zinc-200 font-medium leading-relaxed">
                  {wordOfTheDay.definition}
                </p>

                <div className="space-y-2 pt-2">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 italic leading-relaxed">
                    &ldquo;{wordOfTheDay.exampleSentenceBikol}&rdquo;
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    — {wordOfTheDay.exampleSentenceEnglish}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onWordClick(wordOfTheDay.word)}
                className="self-start flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all duration-200 active:scale-[0.97] shadow-lg shadow-blue-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-900 shrink-0"
              >
                View Entry
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.article>

        {/* ── Trending Lookups ─────────────────────────────────────── */}
        <motion.aside
          variants={itemVariants}
          aria-label="Trending Lookups"
          className="h-full"
        >
          <div className="h-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">
                Trending Lookups
              </h3>
            </div>

            {trendingWords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <TrendingUp className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-3" aria-hidden="true" />
                <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">
                  No trending words yet
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Check back later for popular searches
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {trendingWords.map((word, index) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => onWordClick(word)}
                    className="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-400 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-900 active:scale-95"
                    aria-label={`Search for ${word}`}
                  >
                    <span className="sr-only">Rank {index + 1}: </span>
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.aside>

        {/* ── Recent Searches ──────────────────────────────────────── */}
        <motion.aside
          variants={itemVariants}
          className="lg:col-span-3"
          aria-label="Recent Searches"
        >
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-4 h-4 text-purple-500" aria-hidden="true" />
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">
                Recent Searches
              </h3>
            </div>

            {recentSearches.length === 0 ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" aria-hidden="true" />
                </div>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">
                  Your recent searches will appear here
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {recentSearches.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => onWordClick(word)}
                    className="group flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-700 dark:hover:text-purple-400 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-900 active:scale-95"
                    aria-label={`Search for ${word}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 group-hover:bg-purple-400 transition-colors" />
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.aside>
      </motion.div>
    </section>
  );
}
