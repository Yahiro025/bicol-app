"use client";

import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguageMode } from '@/hooks/useLanguageMode';
import { normalizePOS } from '@/lib/dictionary/lexicography';
import { Springs } from '@/lib/motion';
import BorderGlow from '@/components/ui/BorderGlow';

interface WordOfTheDayProps {
  word: {
    bikol: string;
    english: string;
    tagalog?: string | null;
    pos?: string | null;
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
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={Springs.heavy}
      className={`w-full ${className ?? ''}`}
    >
      <BorderGlow
        edgeSensitivity={30}
        glowColor="215 90 70"
        backgroundColor="linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #9333ea 100%)"
        borderRadius={32}
        glowRadius={44}
        glowIntensity={1.0}
        coneSpread={25}
        animated={true}
        colors={['#60a5fa', '#38bdf8', '#c084fc']}
        className="w-full group transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40"
        style={{ '--card-shadow': '0 25px 50px -12px rgba(37, 99, 235, 0.25)' } as React.CSSProperties}
      >
        <Link
          href={`/word/${encodeURIComponent(word.bikol)}`}
          className="relative p-6 sm:p-10 md:p-12 lg:p-14 block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 rounded-[32px]"
        >
          {/* Animated Background Element */}
          <div className="pointer-events-none absolute top-0 right-0 p-8 sm:p-10 md:p-12 opacity-10 group-hover:scale-125 group-hover:opacity-20 group-hover:rotate-12 transition-all duration-700 ease-out">
            <Star className="w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 lg:w-60 lg:h-60" fill="white" />
          </div>

          <div className="relative z-10 space-y-8 md:space-y-10">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full w-fit text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white border border-white/10 shadow-lg">
              <Star size={13} fill="white" className="group-hover:animate-pulse" />
              Word of the Day
            </div>

            <div>
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black text-white tracking-tighter mb-4 group-hover:translate-x-1 transition-transform duration-300">
                {word.bikol}
              </h2>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  {word.pos && (
                    <span className="px-2.5 py-1 bg-white/20 rounded text-[11px] sm:text-xs font-black text-white uppercase tracking-widest border border-white/10">
                      {normalizePOS(word.pos)}
                    </span>
                  )}
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-bold leading-tight">
                    {displayText}
                  </p>
                </div>
                {langMode === 'all' && word.tagalog && (
                  <p className="text-sm sm:text-base text-white/75 italic font-medium">
                    Tagalog: {word.tagalog}
                  </p>
                )}
              </div>
            </div>

            {word.example_bikol && (
              <div className="pt-8 md:pt-10 border-t border-white/15">
                <p className="text-white/90 italic text-lg sm:text-xl md:text-2xl lg:text-3xl leading-relaxed font-medium">
                  "{word.example_bikol}"
                </p>
                {word.example_english && (
                  <p className="text-white/65 text-base sm:text-lg md:text-xl mt-2 font-medium">
                    — {word.example_english}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 text-white font-black text-sm sm:text-base pt-2 uppercase tracking-widest group">
              View details <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </div>
        </Link>
      </BorderGlow>
    </motion.div>
  );
}
