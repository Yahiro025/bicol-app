import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

interface WordOfTheDayProps {
  word: {
    bikol: string;
    english: string;
    pos?: string | null;
    example_bikol?: string | null;
    example_english?: string | null;
  };
}

export default function WordOfTheDay({ word }: WordOfTheDayProps) {
  return (
    <Link
      href={`/word/${encodeURIComponent(word.bikol)}`}
      className="group relative overflow-hidden p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-900/20 hover:scale-[1.01] transition-all duration-300 block"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
        <Star size={120} fill="white" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full w-fit text-xs font-bold uppercase tracking-wider text-white">
          <Star size={14} fill="white" />
          Word of the Day
        </div>

        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
            {word.bikol}
          </h2>
          <div className="flex items-center gap-3">
            {word.pos && (
              <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold text-blue-100 uppercase tracking-widest">
                {word.pos}
              </span>
            )}
            <p className="text-xl md:text-2xl text-blue-50 font-medium line-clamp-2">
              {word.english}
            </p>
          </div>
        </div>

        {word.example_bikol && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-blue-100/80 italic text-lg leading-relaxed">
              "{word.example_bikol}"
            </p>
            {word.example_english && (
              <p className="text-white/60 text-sm mt-1">
                — {word.example_english}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-white font-bold text-sm pt-2">
          View full details <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
