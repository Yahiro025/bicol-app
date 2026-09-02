"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

interface HeroSectionProps {
  children: ReactNode;
  wordCount: number;
}

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const;

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

const fadeUpSlow = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_OUT } },
};

export default function HeroSection({ children, wordCount }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden min-h-[88vh] lg:min-h-[94vh] flex items-center bg-[#07090e]">
      {/* ── Visual Foundation: Nighttime Mount Mayon ── */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <Image
          src="/images/mayon-hero.png"
          alt="Mount Mayon at night under stars with subtle volcanic embers"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_36%] md:object-[center_32%] scale-[1.01]"
        />

        {/* Scrim 1: Top & overall atmospheric darkness */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070d]/80 via-[#070a14]/55 to-[#060810]/95" />

        {/* Scrim 2: Radial vignette protecting typography & search readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 32%, rgba(5,7,13,0.75) 0%, rgba(5,7,13,0.25) 65%, rgba(5,7,13,0.9) 100%)",
          }}
        />

        {/* Scrim 3: Subtle warm ember radiance at the volcano base */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 68%, rgba(196,122,80,0.08) 0%, transparent 45%)",
          }}
        />

        {/* Scrim 4: Seamless bottom fade into editorial body background */}
        <div
          className="absolute bottom-0 inset-x-0 h-36 md:h-48 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, var(--editorial-bg) 100%)",
          }}
        />
      </div>

      {/* ── Content Layer (z-10) ── */}
      <motion.div
        className="relative px-6 py-20 md:py-28 lg:py-32 w-full z-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <motion.div variants={fadeUp} className="mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/90 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              The Bikol Language Archive · An Diksiyonaryo kan Bikol
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={fadeUpSlow} className="space-y-4 mb-8">
            <h1
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.92] text-white drop-shadow-xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Bikol{" "}
              <span className="italic font-light text-[length:inherit] leading-[inherit] text-amber-100/95">
                Dictionary
              </span>
            </h1>
            <p
              className="text-base sm:text-lg md:text-xl text-slate-200/90 max-w-2xl mx-auto leading-relaxed drop-shadow font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              A comprehensive lexicon of the Bikol language across five historical dialects — with verb conjugations, verified definitions, and AI-enhanced learning tools.
            </p>
          </motion.div>

          {/* Primary Action: Hero Search Console (Hierarchy #1) */}
          <motion.div variants={fadeUp} className="w-full max-w-2xl mx-auto mb-10">
            <div className="rounded-2xl backdrop-blur-2xl bg-black/40 dark:bg-black/60 border border-white/20 p-2 sm:p-2.5 shadow-2xl shadow-black/50">
              {children}
            </div>

            {/* Quick Explore Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-white/60 font-medium mr-1 text-[11px] uppercase tracking-wider">
                Try searching:
              </span>
              {[
                { word: "bakal", hint: "buy" },
                { word: "padaba", hint: "love" },
                { word: "magayon", hint: "beautiful" },
                { word: "uran", hint: "rain" },
                { word: "oragon", hint: "resilient" },
                { word: "aram", hint: "know" },
              ].map(({ word, hint }) => (
                <Link
                  key={word}
                  href={`/word/${encodeURIComponent(word)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-white/90 hover:text-white border border-white/10 hover:border-white/25 transition-all duration-200 backdrop-blur-sm group"
                >
                  <span className="font-semibold">{word}</span>
                  <span className="text-amber-200/70 text-[10px] group-hover:text-amber-200">
                    ({hint})
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Hallmark Stats & Directory link */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 pt-8 border-t border-white/15 w-full max-w-3xl mx-auto"
          >
            <div className="text-center">
              <span
                className="text-3xl sm:text-4xl font-black text-white drop-shadow"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {wordCount.toLocaleString()}+
              </span>
              <span
                className="block text-[11px] tracking-[0.2em] uppercase text-amber-200/80 font-semibold mt-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Documented Words
              </span>
            </div>

            <div className="w-px h-8 bg-white/20 hidden sm:block" />

            <div className="text-center">
              <span
                className="text-3xl sm:text-4xl font-black text-white drop-shadow"
                style={{ fontFamily: "var(--font-display)" }}
              >
                5
              </span>
              <span
                className="block text-[11px] tracking-[0.2em] uppercase text-amber-200/80 font-semibold mt-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Bikol Dialects
              </span>
            </div>

            <div className="w-px h-8 bg-white/20 hidden sm:block" />

            <div className="text-center">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] border border-white/15 text-sm font-semibold text-white hover:text-amber-200 transition-all group backdrop-blur-sm shadow-md"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Browse Directory</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <span
                className="block text-[11px] tracking-[0.2em] uppercase text-white/60 font-medium mt-1"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Free & Open Access
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
