"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Flashcards({ words }: { words: any[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);

  const nextCard = (known: boolean) => {
    if (known) setKnownCount(prev => prev + 1);
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx(prev => (prev + 1) % words.length);
    }, 200);
  };

  const word = words[currentIdx];

  if (!word) return <div>Loading cards...</div>;

  return (
    <div className="flex flex-col items-center gap-8 py-10 px-4">
      <div className="text-zinc-500 font-medium">Card {currentIdx + 1} of {words.length} • {knownCount} Mastered</div>

      <div 
        className="relative w-full max-w-md h-80 cursor-pointer perspective"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div 
          className="w-full h-full relative preserve-3d transition-transform duration-500 shadow-xl rounded-3xl"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white dark:bg-zinc-900 flex flex-col items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center">
            <span className="text-sm text-primary font-bold uppercase tracking-wider mb-4">Bikol</span>
            <h2 className="text-5xl font-black">{word.bikol}</h2>
            <p className="mt-4 text-zinc-400 italic">Tap to flip</p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-primary text-white flex flex-col items-center justify-center rounded-3xl p-8 text-center rotate-y-180">
            <span className="text-sm font-bold uppercase tracking-wider mb-4 opacity-80">English / Tagalog</span>
            <h2 className="text-3xl font-bold mb-2">{word.english}</h2>
            {word.tagalog && <p className="text-xl opacity-90">{word.tagalog}</p>}
            <div className="mt-8 text-sm italic opacity-70">"{word.example_bikol}"</div>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => nextCard(false)}
          className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all"
        >
          Needs Review
        </button>
        <button 
          onClick={() => nextCard(true)}
          className="px-8 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-green-500/20"
        >
          I Know This!
        </button>
      </div>

      <style jsx global>{`
        .perspective { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
