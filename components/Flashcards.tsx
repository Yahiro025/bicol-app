"use client";
import { useState, useEffect, useCallback } from 'react';
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
      duration: 0.5,
      type: "spring",
      stiffness: 260,
      damping: 20,
      mass: 1.2,
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

const CheckIcon = () => (
  <svg className="w-8 h-8" style={{ color: 'var(--editorial-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

export default function Flashcards({ words, onExit }: FlashcardsProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set());
  const [isFinished, setIsFinished] = useState(false);

  const cardBaseStyle = { backgroundColor: 'var(--editorial-surface)', borderColor: 'var(--editorial-border)' };
  const mutedStyle = { color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' };
  const textStyle = { color: 'var(--editorial-text)', fontFamily: 'var(--font-display)' };
  const accentStyle = { color: 'var(--editorial-accent)', fontFamily: 'var(--font-body)' };

  const currentIndex = words && words.length > 0 ? page % words.length : 0;
  const word = words && words.length > 0 ? words[currentIndex] : undefined;

  const handleNext = useCallback((known: boolean) => {
    if (!word) return;
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
  }, [word, page, words.length]);

  // Keyboard navigation support
  useEffect(() => {
    if (isFinished) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleNext(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFinished, handleNext]);

  if (!words || words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="mb-6" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>No words available for this session.</p>
        <button onClick={onExit} className="px-6 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: 'var(--editorial-accent)' }}>Return</button>
      </div>
    );
  }

  if (!word) return null;

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-8">
        <div className="space-y-4">
          <div className="text-6xl">
            <span className="w-16 h-16 mx-auto flex items-center justify-center rounded-full border" style={{ backgroundColor: 'var(--editorial-accent-glow)', borderColor: 'var(--editorial-border)' }}>
              <CheckIcon />
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--editorial-text)', fontFamily: 'var(--font-display)' }}>Session Complete</h2>
          <p style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>You've reviewed all {words.length} words in this session.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 border rounded-3xl" style={cardBaseStyle}>
            <div className="text-3xl font-black" style={accentStyle}>{knownWords.size}</div>
            <div className="text-xs font-bold uppercase tracking-widest mt-1" style={mutedStyle}>Mastered</div>
          </div>
          <div className="p-6 border rounded-3xl" style={cardBaseStyle}>
            <div className="text-3xl font-black" style={{ color: 'var(--editorial-accent-dim)', fontFamily: 'var(--font-display)' }}>{words.length - knownWords.size}</div>
            <div className="text-xs font-bold uppercase tracking-widest mt-1" style={mutedStyle}>Reviewing</div>
          </div>
        </div>

        <button 
          onClick={onExit}
          className="w-full py-4 text-white font-bold rounded-2xl transition-colors"
          style={{ backgroundColor: 'var(--editorial-accent)', fontFamily: 'var(--font-body)' }}
        >
          Return to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-10 px-6 max-w-lg mx-auto overflow-hidden">
      <div className="w-full space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest" style={accentStyle}>Flashcards</span>
            <h3 className="text-lg font-bold" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-display)' }}>Card {currentIndex + 1} of {words.length}</h3>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold" style={mutedStyle}>{Math.round((page / words.length) * 100)}% Complete</span>
          </div>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--editorial-border)' }}>
          <motion.div 
            className="h-full"
            style={{ backgroundColor: 'var(--editorial-accent)' }}
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
            whileHover={{ rotateX: 2, rotateY: 2 }}
          >
            <motion.div 
              className="w-full h-full relative preserve-3d"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden border rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center transition-shadow duration-500" style={cardBaseStyle}>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={mutedStyle}>Bicolano</span>
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none mb-4" style={textStyle}>{word.bikol}</h2>
                <div className="h-1 w-8 rounded-full mb-6" style={{ backgroundColor: 'var(--editorial-accent)' }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={mutedStyle}>Tap to reveal meaning</p>
              </div>

              {/* Back (Crisp contrast: #FFFDF9 on var(--editorial-accent-dim)) */}
              <div
                className="absolute inset-0 backface-hidden rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center rotate-y-180"
                style={{ backgroundColor: 'var(--editorial-accent-dim)', color: '#FFFDF9' }}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-6" style={{ color: 'rgba(255, 253, 249, 0.75)', fontFamily: 'var(--font-body)' }}>Translation</span>
                <h2 className="text-4xl font-black tracking-tight mb-2" style={{ color: '#FFFDF9', fontFamily: 'var(--font-display)' }}>{word.english}</h2>
                {word.tagalog && <p className="text-xl font-bold mb-6" style={{ color: 'rgba(255, 253, 249, 0.85)', fontFamily: 'var(--font-body)' }}>{word.tagalog}</p>}
                
                {word.example_bikol && (
                  <div className="mt-4 p-4 rounded-2xl border max-w-xs" style={{ backgroundColor: 'rgba(255, 253, 249, 0.12)', borderColor: 'rgba(255, 253, 249, 0.2)' }}>
                    <p className="text-sm italic" style={{ color: '#FFFDF9' }}>&ldquo;{word.example_bikol}&rdquo;</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="space-y-3 w-full">
        <div className="flex gap-4 w-full">
          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(false); }}
            className="flex-1 py-4 font-bold rounded-2xl transition-all active:scale-95" style={{ backgroundColor: 'var(--editorial-surface)', color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)', border: '1px solid var(--editorial-border)' }}
          >
            Review Later
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(true); }}
            className="flex-1 py-4 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95" style={{ backgroundColor: 'var(--editorial-accent)', fontFamily: 'var(--font-body)' }}
          >
            I Mastered This
          </button>
        </div>

        {/* Keyboard navigation hint bar */}
        <div
          className="flex items-center justify-center gap-3 sm:gap-4 text-xs font-medium pt-1 text-center"
          style={{ color: "var(--editorial-muted)", fontFamily: "var(--font-body)" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
              style={{
                backgroundColor: "var(--editorial-surface)",
                borderColor: "var(--editorial-border)",
                color: "var(--editorial-text)",
              }}
            >
              Space
            </kbd>
            Flip
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
              style={{
                backgroundColor: "var(--editorial-surface)",
                borderColor: "var(--editorial-border)",
                color: "var(--editorial-text)",
              }}
            >
              ←
            </kbd>
            Review Later
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1.5">
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
              style={{
                backgroundColor: "var(--editorial-surface)",
                borderColor: "var(--editorial-border)",
                color: "var(--editorial-text)",
              }}
            >
              →
            </kbd>
            Mastered
          </span>
        </div>
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
