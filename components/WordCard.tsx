"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { LanguageMode } from './LanguageToggle';
import { normalizePOS } from '@/lib/lexicography';

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
} as const;

export default function WordCard({ word, className }: WordCardProps) {
  const router = useRouter();
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

  const wordUrl = `/word/${encodeURIComponent(word.bikol)}`;

  return (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
    >
      <Link 
        href={wordUrl}
        prefetch={false}
        onMouseEnter={() => router.prefetch(wordUrl)}
        className={`group block p-6 bg-zinc-50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 active:scale-[0.98] transition-all duration-300 ${className}`}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-display font-bold text-blue-600 dark:text-blue-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                {word.bikol}
              </h3>
              {word.pos && (
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-500 rounded font-black border border-zinc-300 dark:border-zinc-700">
                  {normalizePOS(word.pos)}
                </span>
              )}
            </div>
            <p className="text-zinc-800 dark:text-zinc-100 font-medium line-clamp-1">{displayTranslation()}</p>
            {langMode === 'all' && word.tagalog && (
              <p className="text-xs text-zinc-500 italic opacity-60 mt-1">Tagalog: {word.tagalog}</p>
            )}
          </div>
          <div className="p-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-all duration-300 group-hover:translate-x-1 border border-zinc-300 dark:border-zinc-700/50 group-hover:border-blue-500/20">
            <ChevronRight size={18} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
