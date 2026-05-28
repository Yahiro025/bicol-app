"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Word } from '@/lib/types/learn';

interface FlashcardsProps {
  words: Word[];
  onExit: () => void;
}

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
    scale: 0.8,
    rotateY: direction > 0 ? 45 : -45,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.4,
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 500 : -500,
    opacity: 0,
    scale: 0.8,
    rotateY: direction < 0 ? 45 : -45,
    transition: {
      duration: 0.3
    }
  })
} as const;

export default function Flashcards({ words, onExit }: FlashcardsProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set());
  const [isFinished, setIsFinished] = useState(false);

  if (!words || words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-zinc-500 mb-6">No words available for this session.</p>
        <button onClick={onExit} className="px-6 py-2 bg-zinc-800 text-white rounded-lg">Return</button>
      </div>
    );
  }

  const currentIndex = page % words.length;
  const word = words[currentIndex];

  if (!word) return null;

  const handleNext = (known: boolean) => {
    if (known) {
      setKnownWords(prev => new Set(prev).add(word.bikol));
    }
    
    if (page + 1 >= words.length) {
      setIsFinished(true);
      return;
    }

    setIsFlipped(false);
    setTimeout(() => {
      setPage([page + 1, 1]);
    }, 100);
  };

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-8">
        <div className="space-y-4">
          <div className="text-6xl">🎓</div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Session Complete</h2>
          <p className="text-zinc-500">You've reviewed all {words.length} words in this session.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
            <div className="text-3xl font-black text-green-500">{knownWords.size}</div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Mastered</div>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
            <div className="text-3xl font-black text-blue-500">{words.length - knownWords.size}</div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Reviewing</div>
          </div>
        </div>

        <button 
          onClick={onExit}
          className="w-full py-4 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-colors"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10 py-10 px-6 max-w-lg mx-auto overflow-hidden">
      <div className="w-full space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Flashcards</span>
            <h3 className="text-lg font-bold text-zinc-400">Card {currentIndex + 1} of {words.length}</h3>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-zinc-500">{Math.round((page / words.length) * 100)}% Complete</span>
          </div>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${(page / words.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] perspective">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full cursor-pointer preserve-3d"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div 
              className="w-full h-full relative preserve-3d"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center transition-shadow duration-500 glow-blue-hover">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6">Bicolano</span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">{word.bikol}</h2>
                <div className="h-1 w-8 bg-blue-500/20 rounded-full mb-6"></div>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest animate-pulse">Tap to reveal meaning</p>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden bg-[#3b82f6] rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center rotate-y-180">
                <span className="text-[10px] font-black text-blue-100/60 uppercase tracking-[0.2em] mb-6">Translation</span>
                <h2 className="text-4xl font-black text-white tracking-tight mb-2">{word.english}</h2>
                {word.tagalog && <p className="text-xl font-bold text-blue-50/80 mb-6">{word.tagalog}</p>}
                
                {word.example_bikol && (
                  <div className="mt-4 p-4 bg-white/10 rounded-2xl border border-white/10 max-w-xs">
                    <p className="text-sm text-blue-50 italic">"{word.example_bikol}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-4 w-full">
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(false); }}
          className="flex-1 py-4 bg-zinc-800 text-zinc-400 font-bold rounded-2xl hover:bg-zinc-700 hover:text-zinc-200 transition-all active:scale-95"
        >
          Review Later
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(true); }}
          className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          I Mastered This
        </button>
      </div>

      <style jsx global>{`
        .perspective { perspective: 1200px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
