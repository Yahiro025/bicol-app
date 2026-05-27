'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type FocusClass, type ConjugationForms } from '@/lib/conjugator';

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

interface TransformationChallengeProps {
  onComplete?: () => void;
  challenges?: Challenge[];
}

export default function TransformationChallenge({ onComplete, challenges: externalChallenges }: TransformationChallengeProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const challenges = externalChallenges && externalChallenges.length > 0 ? externalChallenges : SAMPLE_CHALLENGES;
  const challenge = challenges[currentIdx];

  if (!challenge) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (showAnswer || !userInput.trim()) return;

    console.log('Validating answer for index:', currentIdx, 'Input:', userInput);
    
    const normalizedInput = userInput.toLowerCase().trim().replace(/[.!?]$/, '');
    const normalizedAnswer = challenge.answer.toLowerCase().trim();
    const normalizedSentence = challenge.sentence.toLowerCase().trim().replace(/[.!?]$/, '');
    
    if (normalizedInput === normalizedAnswer || normalizedInput === normalizedSentence) {
      console.log('Success at index:', currentIdx);
      setIsCorrect(true);
      setShowAnswer(true);
    } else {
      console.log('Failure at index:', currentIdx);
      setIsCorrect(false);
    }
  };

  const nextChallenge = () => {
    console.log('Next challenge triggered. Current index:', currentIdx);
    if (currentIdx + 1 < SAMPLE_CHALLENGES.length) {
      setIsCorrect(null);
      setShowAnswer(false);
      setUserInput('');
      setCurrentIdx((prev) => prev + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-sm">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-blue-500 font-bold uppercase tracking-widest text-xs">Phase 2: Transformation</h3>
          <span className="text-zinc-600 text-xs font-mono">{currentIdx + 1} / {SAMPLE_CHALLENGES.length}</span>
        </div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">{challenge.prompt}</h2>
        <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
          <p className="text-sm text-zinc-500 mb-2 uppercase tracking-tighter font-bold">Target Pattern:</p>
          <p className="text-lg italic text-zinc-400">"{challenge.sentence.replace(challenge.answer, '____')}"</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          key={`input-${currentIdx}`}
          type="text"
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
            if (isCorrect === false) setIsCorrect(null);
          }}
          placeholder="Type the verb or the full sentence..."
          className={`w-full bg-zinc-950 border rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 outline-none transition-all ${
            isCorrect === false ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-zinc-800 focus:ring-blue-500'
          }`}
          disabled={showAnswer}
          autoFocus
        />
        
        {!showAnswer && (
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-blue-500/10"
          >
            Check Answer
          </button>
        )}
      </form>

      {showAnswer && (
        <div className="mt-4">
          <button
            type="button"
            onClick={nextChallenge}
            className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-lg"
          >
            {currentIdx + 1 < SAMPLE_CHALLENGES.length ? "Next Challenge" : "Finish Lesson"}
          </button>
        </div>
      )}

      <div className="h-20">
        <AnimatePresence mode="wait">
          {isCorrect === true && (
            <motion.div
              key="correct"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-green-900/20 border border-green-800/50 rounded-xl text-green-400 text-center"
            >
              Matíyag! (Correct) — <strong>{challenge.answer}</strong>
            </motion.div>
          )}
          {isCorrect === false && (
            <motion.div
              key="incorrect"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="mt-6 p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 text-center"
            >
              Puwede pa mapakarhay. Try again!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center text-zinc-500 text-sm">
        <span>Root: <span className="text-blue-400 font-mono">{challenge.root}</span></span>
        <span>Focus Class: <span className="text-purple-400 font-mono">{challenge.focusClass}</span></span>
      </div>
    </div>
  );
}
