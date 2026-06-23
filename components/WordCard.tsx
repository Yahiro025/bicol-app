"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguageMode } from '@/hooks/useLanguageMode';
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
  const langMode = useLanguageMode();
  const displayText = langMode === 'tl' && word.tagalog ? word.tagalog : word.english;
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
        className={`group block p-7 backdrop-blur-sm rounded-2xl hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] transition-all duration-300 ${className}`}
        style={{
          backgroundColor: 'var(--editorial-surface)',
          border: '1px solid var(--editorial-border)',
        }}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-display font-bold transition-colors tracking-tight" style={{ color: 'var(--editorial-accent)' }}>
                {word.bikol}
              </h3>
              {word.pos && (
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-black border" style={{ backgroundColor: 'var(--editorial-surface-sunken)', color: 'var(--editorial-muted)', borderColor: 'var(--editorial-border)' }}>
                  {normalizePOS(word.pos)}
                </span>
              )}
            </div>
            <p className="font-medium line-clamp-1" style={{ color: 'var(--editorial-text-secondary)' }}>{displayText}</p>
            {langMode === 'all' && word.tagalog && (
              <p className="text-xs italic opacity-60 mt-1" style={{ color: 'var(--editorial-muted)' }}>Tagalog: {word.tagalog}</p>
            )}
          </div>
          <div className="p-2.5 rounded-full transition-all duration-300 group-hover:translate-x-1 border group-hover:border-[var(--editorial-accent)]/30"
            style={{
              backgroundColor: 'var(--editorial-surface-sunken)',
              color: 'var(--editorial-muted)',
              borderColor: 'var(--editorial-border)',
            }}>
            <ChevronRight size={18} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
