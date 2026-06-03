"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

interface HeroSectionProps {
  children: ReactNode;
  wordCount: number;
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const fadeUpSlow = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const ruleReveal = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.65, 0, 0.35, 1] as const },
  },
};

export default function HeroSection({ children, wordCount }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-[var(--editorial-bg)] noise-overlay">
      {/* Ambient light — warm gold glow in upper right */}
      <div
        className="absolute top-0 right-0 w-[60vw] h-[60vh] pointer-events-none -z-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 20%, rgba(196,155,76,0.08) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="relative px-6 py-24 md:py-36 w-full z-10"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto">
          {/* Top label */}
          <motion.div variants={fadeUp}>
            <p className="section-number mb-8">
              The Bikol Language Archive
            </p>
          </motion.div>

          {/* Main headline — asymmetric, dramatic scale */}
          <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-24 items-end mb-16">
            <motion.div variants={fadeUpSlow} className="space-y-4">
              <h1
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] text-[var(--editorial-text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Bikol
                <br />
                <span className="italic font-light text-[length:inherit] leading-[inherit]">
                  Dictionary
                </span>
              </h1>
            </motion.div>

            {/* Decorative element — large italic word count */}
            <motion.div
              variants={fadeUpSlow}
              className="hidden lg:flex flex-col items-end gap-2 self-end pb-4"
            >
              <span
                className="text-8xl font-black italic leading-none text-[var(--editorial-accent)] opacity-50"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {wordCount.toLocaleString()}
              </span>
              <span
                className="text-xs tracking-[0.25em] uppercase font-semibold text-[var(--editorial-muted)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Documented Words
              </span>
            </motion.div>
          </div>

          {/* Rule line */}
          <motion.div className="rule-divider mb-12" variants={ruleReveal} />

          {/* Subtitle + search area */}
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-24">
            {/* Left: descriptive text */}
            <motion.div variants={fadeUp} className="space-y-6">
              <p
                className="text-lg sm:text-xl leading-relaxed text-[var(--editorial-muted)] max-w-md"
                style={{ fontFamily: "var(--font-body)" }}
              >
                A comprehensive lexicon of the Bikol language across{" "}
                <span className="text-[var(--editorial-text)] font-semibold">
                  five dialects
                </span>
                , with verb conjugations, example sentences, and
                AI-enhanced learning tools.
              </p>

              {/* Small stat row for mobile (hidden on lg since the big number is shown) */}
              <div className="flex gap-8 lg:hidden">
                <div>
                  <span
                    className="text-2xl font-black text-[var(--editorial-text)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {wordCount.toLocaleString()}+
                  </span>
                  <span className="block text-xs tracking-[0.2em] uppercase text-[var(--editorial-muted)] mt-1">
                    Words
                  </span>
                </div>
                <div>
                  <span
                    className="text-2xl font-black text-[var(--editorial-text)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    5+
                  </span>
                  <span className="block text-xs tracking-[0.2em] uppercase text-[var(--editorial-muted)] mt-1">
                    Dialects
                  </span>
                </div>
                <div>
                  <span
                    className="text-2xl font-black text-[var(--editorial-text)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Free
                  </span>
                  <span className="block text-xs tracking-[0.2em] uppercase text-[var(--editorial-muted)] mt-1">
                    Forever
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right: search bar */}
            <motion.div variants={fadeUp} className="flex flex-col gap-6">
              <div className="w-full">{children}</div>

              {/* Browse link — understated text link */}
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--editorial-accent-dim)] hover:text-[var(--editorial-accent)] transition-colors group w-fit"
                style={{ fontFamily: "var(--font-body)" }}
              >
                <BookOpen className="w-4 h-4" />
                <span>Browse the full dictionary</span>
                <span className="inline-block group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Bottom rule */}
          <motion.div className="rule-divider mt-20" variants={ruleReveal} />
        </div>
      </motion.div>
    </section>
  );
}
