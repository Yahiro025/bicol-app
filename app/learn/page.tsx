"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Flashcards from '@/components/Flashcards';
import Quiz from '@/components/Quiz';
import type { Word, QuizQuestion, LearnMode } from '@/lib/types/learn';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
} as const;

export default function LearnPage() {
  const [mode, setMode] = useState<LearnMode | null>(null);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = async (selectedMode: LearnMode) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/learn?mode=${selectedMode}`);
      if (!res.ok) throw new Error('Failed to load learning content');
      const json = await res.json();
      setData(json);
      setMode(selectedMode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExit = () => {
    setMode(null);
    setData(null);
  };

  const handleQuizComplete = (score: number) => {
    // We could save results here if we had a profile system
    console.log(`Quiz complete with score: ${score}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 space-y-6">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-6xl"
        >
          🧠
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white">Preparing your session...</h2>
          <p className="text-zinc-500 text-sm animate-pulse">AI is generating questions and selecting words</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="text-5xl">⚠️</div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-red-400">Connection Error</h2>
          <p className="text-zinc-500 max-w-xs">{error}</p>
        </div>
        <button 
          onClick={() => setError(null)}
          className="px-8 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30">
      <AnimatePresence mode="wait">
        {!mode ? (
          <motion.div 
            key="menu"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="max-w-5xl mx-auto px-6 py-16 md:py-24 space-y-12"
          >
            <div className="text-center space-y-4">
              <motion.span variants={itemVariants} className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-[0.2em] rounded-full border border-blue-500/20">
                Linguistics Laboratory
              </motion.span>
              <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white">
                Learn the <span className="text-blue-500">Bikol</span> Archive
              </motion.h1>
              <motion.p variants={itemVariants} className="text-lg text-zinc-500 max-w-2xl mx-auto">
                Master the Bicolano language through AI-enhanced active recall and diagnostic knowledge checks.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-8">
              <motion.button
                variants={itemVariants}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startSession('flashcards')}
                className="group relative text-left p-8 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] hover:border-blue-500/40 hover:bg-zinc-900/60 transition-all duration-300 overflow-hidden hover:shadow-[0_20px_25px_-5px_rgba(59,130,246,0.1)]"
              >
                <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">🗂️</div>
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl">🗂️</div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">3D Flashcards</h2>
                    <p className="text-zinc-500 leading-relaxed">Master vocabulary through spaced-repetition and 3D visual cues. Best for rapid memorization.</p>
                  </div>
                  <div className="text-sm font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                    Start Training <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.button>

              <motion.button
                variants={itemVariants}
                whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startSession('quiz')}
                className="group relative text-left p-8 bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] hover:border-purple-500/40 hover:bg-zinc-900/60 transition-all duration-300 overflow-hidden hover:shadow-[0_20px_25px_-5px_rgba(168,85,247,0.1)]"
              >
                <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">🧠</div>
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-2xl">🧠</div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">AI-Powered Quiz</h2>
                    <p className="text-zinc-500 leading-relaxed">Challenge yourself with dynamic questions generated by AI. Best for testing semantic understanding.</p>
                  </div>
                  <div className="text-sm font-black text-purple-500 uppercase tracking-widest flex items-center gap-2">
                    Test Knowledge <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        ) : mode === 'flashcards' ? (
          <motion.div key="flashcards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Flashcards words={data} onExit={handleExit} />
          </motion.div>
        ) : (
          <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Quiz questions={data.questions} onComplete={handleQuizComplete} onExit={handleExit} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
