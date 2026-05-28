"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion } from '@/lib/types/learn';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onExit: () => void;
}

export default function Quiz({ questions, onComplete, onExit }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-zinc-500 mb-6">No questions available for this quiz.</p>
        <button onClick={onExit} className="px-6 py-2 bg-zinc-800 text-white rounded-lg">Return</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  
  if (!currentQuestion) return null;

  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleNext = () => {
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) setScore(newScore);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      onComplete(newScore);
    }
  };

  const checkAnswer = () => {
    if (!selectedOption) return;
    setIsAnswered(true);
  };

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-8">
        <div className="space-y-4">
          <div className="text-6xl">🏆</div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Quiz Complete</h2>
          <p className="text-zinc-500">You've finished the Bicolano Knowledge Check.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
            <div className="text-3xl font-black text-blue-500">{score}/{questions.length}</div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Final Score</div>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
            <div className="text-3xl font-black text-purple-500">{Math.round((score / questions.length) * 100)}%</div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Accuracy</div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={onExit}
            className="w-full py-4 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-colors shadow-lg active:scale-95"
          >
            Return to Laboratory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center text-sm font-medium text-zinc-500">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Knowledge Check</span>
            <h2 className="text-3xl font-bold leading-tight">{currentQuestion.question}</h2>
          </div>

          <div className="grid gap-3">
            {currentQuestion.options.map((option) => {
              let variant = "default";
              if (isAnswered) {
                if (option === currentQuestion.correctAnswer) variant = "correct";
                else if (option === selectedOption) variant = "incorrect";
                else variant = "dimmed";
              } else if (option === selectedOption) {
                variant = "selected";
              }

              return (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  disabled={isAnswered}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 active:scale-[0.98] ${
                    variant === 'correct' ? 'bg-green-500/10 border-green-500 text-green-400' :
                    variant === 'incorrect' ? 'bg-red-500/10 border-red-500 text-red-400' :
                    variant === 'selected' ? 'bg-blue-500/10 border-blue-500 text-blue-400 glow-blue-selected' :
                    variant === 'dimmed' ? 'bg-zinc-900/50 border-zinc-800/50 opacity-40' :
                    'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200 glow-black-hover'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{option}</span>
                    {variant === 'correct' && <span className="text-lg">✓</span>}
                    {variant === 'incorrect' && <span className="text-lg">✗</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-2"
            >
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Etymology & Usage</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">{currentQuestion.explanation}</p>
            </motion.div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onExit}
              className="px-8 py-4 bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold rounded-2xl hover:bg-zinc-800 hover:text-zinc-300 transition-all"
            >
              Exit
            </button>
            {!isAnswered ? (
              <button 
                onClick={checkAnswer}
                disabled={!selectedOption}
                className="flex-1 py-4 bg-[#3b82f6] disabled:bg-zinc-900 disabled:border-zinc-800 disabled:text-zinc-700 text-white font-bold rounded-2xl hover:bg-blue-500 glow-blue-button transition-all active:scale-95"
              >
                Check Answer
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="flex-1 py-4 bg-[#3b82f6] text-white font-bold rounded-2xl hover:bg-blue-500 glow-blue-button transition-all active:scale-95"
              >
                {currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
