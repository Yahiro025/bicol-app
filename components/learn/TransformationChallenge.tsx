'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { conjugateVerbMintz, type FocusClass, type ConjugationForms } from '@/lib/conjugator';

interface Challenge {
  root: string;
  focusClass: FocusClass;
  type: 'TENSE' | 'FOCUS';
  prompt: string;
  target: keyof ConjugationForms | 'OBJECT_FOCUS' | 'ACTOR_FOCUS';
  answer: string;
  sentence: string;
}

const SAMPLE_CHALLENGES: Challenge[] = [
  {
    root: 'bakal',
    focusClass: 'ON',
    type: 'TENSE',
    prompt: 'Change "Magbakal ka nin plato" to Past Tense',
    target: 'past',
    answer: 'nagbakal',
    sentence: 'Nagbakal ka nin plato.'
  },
  {
    root: 'hugas',
    focusClass: 'AN',
    type: 'FOCUS',
    prompt: 'Change "Maghugas ka nin plato" to Object Focus',
    target: 'OBJECT_FOCUS',
    answer: 'hugasan',
    sentence: 'Hugasan mo an plato.'
  },
  {
    root: 'apod',
    focusClass: 'ON',
    type: 'TENSE',
    prompt: 'Change "Apodon mo siya" to Future Tense',
    target: 'future',
    answer: 'aapodon',
    sentence: 'Aapodon mo siya.'
  }
];

export default function TransformationChallenge() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const challenge = SAMPLE_CHALLENGES[currentIdx];

  if (!challenge) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedInput = userInput.toLowerCase().trim();
    if (normalizedInput === challenge.answer.toLowerCase()) {
      setIsCorrect(true);
      setShowAnswer(true);
    } else {
      setIsCorrect(false);
    }
  };

  const nextChallenge = () => {
    setCurrentIdx((prev) => (prev + 1) % SAMPLE_CHALLENGES.length);
    setUserInput('');
    setIsCorrect(null);
    setShowAnswer(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-sm">
      <div className="mb-8">
        <h3 className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-2">Phase 2: Transformation</h3>
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">{challenge.prompt}</h2>
        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
          <p className="text-lg italic text-zinc-400">"{challenge.sentence.replace(challenge.answer, '____')}"</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type the Bikol transformation..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          disabled={showAnswer}
        />
        
        <div className="flex gap-3">
          {!showAnswer ? (
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-blue-500/10"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={nextChallenge}
              className="flex-1 bg-zinc-100 hover:bg-white text-zinc-900 font-bold py-3 rounded-xl transition-transform active:scale-95"
            >
              Next Challenge
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {isCorrect === true && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-green-900/20 border border-green-800/50 rounded-xl text-green-400 text-center"
          >
            Matíyag! (Correct) — <strong>{challenge.answer}</strong>
          </motion.div>
        )}
        {isCorrect === false && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 text-center"
          >
            Puwede pa mapakarhay. Try again!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center text-zinc-500 text-sm">
        <span>Root: <span className="text-blue-400 font-mono">{challenge.root}</span></span>
        <span>Focus Class: <span className="text-purple-400 font-mono">{challenge.focusClass}</span></span>
      </div>
    </div>
  );
}
