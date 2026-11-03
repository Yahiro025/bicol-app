"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguageMode } from '@/hooks/useLanguageMode';
import { normalizePOS } from '@/lib/dictionary/lexicography';
import { Springs } from '@/lib/motion';

interface WordOfTheDayProps {
  word: {
    bikol: string;
    english: string;
    tagalog?: string | null;
    pos?: string | null;
    dialect?: string | null;
    pronunciation?: string | null;
    example_bikol?: string | null;
    example_english?: string | null;
  };
  className?: string;
}

export default function WordOfTheDay({ word, className }: WordOfTheDayProps) {
  const langMode = useLanguageMode();
  const displayText = langMode === 'tl' && word.tagalog ? word.tagalog : word.english;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={Springs.heavy}
      className={`w-full ${className ?? ''}`}
    >
      <Link
        href={`/word/${encodeURIComponent(word.bikol)}`}
        className="group relative block rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--editorial-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--editorial-bg)]"
        style={{
          backgroundColor: 'var(--editorial-surface-raised)',
          border: '1px solid var(--editorial-border)',
          boxShadow: 'var(--editorial-shadow)',
        }}
      >
        {/* Subtle top-right warm volcanic radial wash */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle at top right, var(--editorial-accent-glow), transparent 65%)',
          }}
        />

        {/* Specimen Header Bar */}
        <div
          className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-4"
          style={{ borderBottom: '1px solid var(--editorial-divider)' }}
        >
          <span className="archival-label tracking-widest">Featured Lexicon Specimen</span>
          <div className="flex items-center gap-2">
            {word.dialect && (
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--editorial-surface)',
                  color: 'var(--editorial-muted)',
                  border: '1px solid var(--editorial-border)',
                }}
              >
                {word.dialect}
              </span>
            )}
            {word.pos && (
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--editorial-accent-glow)',
                  color: 'var(--editorial-accent)',
                  border: '1px solid var(--editorial-border)',
                }}
              >
                {normalizePOS(word.pos)}
              </span>
            )}
          </div>
        </div>

        {/* Specimen Content */}
        <div className="relative z-10 p-6 sm:p-10 md:p-12 space-y-6 md:space-y-8">
          <div>
            <div className="flex flex-wrap items-baseline gap-4 mb-2">
              <h2
                className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[var(--editorial-text)] group-hover:text-[var(--editorial-accent)] transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {word.bikol}
              </h2>
              {word.pronunciation && (
                <span
                  className="text-base sm:text-xl font-normal italic text-[var(--editorial-muted)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  /{word.pronunciation}/
                </span>
              )}
            </div>

            <p
              className="text-xl sm:text-2xl md:text-3xl font-semibold text-[var(--editorial-text-secondary)] leading-snug"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {displayText}
            </p>

            {langMode === 'all' && word.tagalog && (
              <p className="text-sm sm:text-base text-[var(--editorial-muted)] italic font-medium mt-2">
                Tagalog: {word.tagalog}
              </p>
            )}
          </div>

          {/* Sunken Archival Quote Block */}
          {word.example_bikol && (
            <div
              className="p-5 sm:p-6 rounded-2xl space-y-2"
              style={{
                backgroundColor: 'var(--editorial-surface)',
                border: '1px solid var(--editorial-border)',
              }}
            >
              <p
                className="text-lg sm:text-xl md:text-2xl italic leading-relaxed text-[var(--editorial-text)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                &ldquo;{word.example_bikol}&rdquo;
              </p>
              {word.example_english && (
                <p
                  className="text-sm sm:text-base font-medium text-[var(--editorial-muted)]"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  — {word.example_english}
                </p>
              )}
            </div>
          )}

          {/* Refined Footer Link */}
          <div
            className="pt-2 flex items-center gap-2 text-sm sm:text-base font-bold transition-colors"
            style={{ color: 'var(--editorial-accent)', fontFamily: 'var(--font-body)' }}
          >
            <span>Inspect full lexical entry</span>
            <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-200" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
