"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LanguageMode } from './LanguageToggle';

interface WordCardProps {
  word: {
    bikol: string;
    english: string;
    tagalog?: string | null;
    pos?: string | null;
  };
  className?: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  }
};

export default function WordCard({ word, className }: WordCardProps) {
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
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
    >
      <Link 
        href={`/word/${encodeURIComponent(word.bikol)}`}
        className={`group block p-5 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl hover:border-blue-500/30 hover:bg-zinc-800/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 active:scale-[0.98] transition-all duration-300 ${className}`}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-blue-500 group-hover:text-blue-400 transition-colors">
                {word.bikol}
              </h3>
              {word.pos && (
                <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded font-bold border border-zinc-700">
                  {word.pos}
                </span>
              )}
            </div>
            <p className="text-zinc-300 line-clamp-1">{displayTranslation()}</p>
            {langMode === 'all' && word.tagalog && (
              <p className="text-xs text-zinc-500 italic opacity-60">TL: {word.tagalog}</p>
            )}
          </div>
          <div className="p-2 rounded-full bg-zinc-800 text-zinc-500 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all duration-300 group-hover:translate-x-1">
            <ChevronRight size={18} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
