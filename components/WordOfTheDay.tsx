"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LanguageMode } from './LanguageToggle';
import { normalizePOS } from '@/lib/lexicography';

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
  const [langMode, setLangMode] = useState<LanguageMode>('all');

  useEffect(() => {
    const saved = localStorage.getItem('bikoldict-lang-mode') as LanguageMode;
    if (saved) setLangMode(saved);

    const handleLangChange = (e: any) => setLangMode(e.detail);
    window.addEventListener('lang-mode-change', handleLangChange);
    return () => window.removeEventListener('lang-mode-change', handleLangChange);
  }, []);

  const displayTranslation = () => {
    if (langMode === 'tl' && word.tagalog) return word.tagalog;
    return word.english;
  };

   return (
     <motion.div
       initial={{ opacity: 0, scale: 0.95 }}
       whileInView={{ opacity: 1, scale: 1 }}
       viewport={{ once: true }}
       transition={{ type: 'spring', stiffness: 300, damping: 30 }}
     >
       <Link
         href={`/word/${encodeURIComponent(word.bikol)}`}
         className={`group relative overflow-hidden p-10 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-[2rem] shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 block ${className ?? ''}`}
       >
        {/* Animated Background Element */}
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 group-hover:opacity-20 group-hover:rotate-12 transition-all duration-700 ease-out">
          <Star size={140} fill="white" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full w-fit text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/10 shadow-lg">
            <Star size={12} fill="white" className="group-hover:animate-pulse" />
            Word of the Day
          </div>

          <div>
            <h2 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter mb-3 group-hover:translate-x-1 transition-transform duration-300">
              {word.bikol}
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                {word.pos && (
                  <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                    {normalizePOS(word.pos)}
                  </span>
                )}
                <p className="text-2xl md:text-3xl text-white font-bold leading-tight">
                  {displayTranslation()}
                </p>
              </div>
              {langMode === 'all' && word.tagalog && (
                <p className="text-sm text-white/70 italic font-medium">
                  Tagalog: {word.tagalog}
                </p>
              )}
            </div>
          </div>

          {word.example_bikol && (
            <div className="pt-8 border-t border-white/10">
              <p className="text-white/90 italic text-xl md:text-2xl leading-relaxed font-medium">
                "{word.example_bikol}"
              </p>
              {word.example_english && (
                <p className="text-white/60 text-base mt-2 font-medium">
                  — {word.example_english}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 text-white font-black text-sm pt-4 uppercase tracking-widest group">
            View details <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
