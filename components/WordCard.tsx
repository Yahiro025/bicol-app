import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface WordCardProps {
  word: {
    bikol: string;
    english: string;
    tagalog?: string | null;
    pos?: string | null;
  };
}

export default function WordCard({ word }: WordCardProps) {
  return (
    <Link 
      href={`/word/${encodeURIComponent(word.bikol)}`}
      className="group block p-5 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-blue-500/50 hover:bg-zinc-800/50 transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-blue-500 group-hover:text-blue-400 transition-colors">
              {word.bikol}
            </h3>
            {word.pos && (
              <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded font-bold">
                {word.pos}
              </span>
            )}
          </div>
          <p className="text-zinc-300 line-clamp-1">{word.english}</p>
          {word.tagalog && (
            <p className="text-xs text-zinc-500 italic">TL: {word.tagalog}</p>
          )}
        </div>
        <div className="p-2 rounded-full bg-zinc-800 text-zinc-500 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all">
          <ChevronRight size={18} />
        </div>
      </div>
    </Link>
  );
}
