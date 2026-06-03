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
        <button onClick={onExit} className="px-6 py-2 rounded-lg font-semibold" style={{ backgroundColor: 'var(--editorial-surface)', color: 'var(--editorial-text)', fontFamily: 'var(--font-body)' }}>Return</button>
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
          <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-full border" style={{ backgroundColor: 'rgba(196,155,76,0.1)', borderColor: 'rgba(196,155,76,0.2)' }}>
            <svg className="w-10 h-10" style={{ color: 'var(--editorial-accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--editorial-text)', fontFamily: 'var(--font-display)' }}>Quiz Complete</h2>
          <p style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>You've finished the Bicolano Knowledge Check.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-3xl" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
            <div className="text-3xl font-black" style={{ color: 'var(--editorial-accent)', fontFamily: 'var(--font-display)' }}>{score}/{questions.length}</div>
            <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Final Score</div>
          </div>
          <div className="p-6 rounded-3xl" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}>
            <div className="text-3xl font-black" style={{ color: 'var(--editorial-rust)', fontFamily: 'var(--font-display)' }}>{Math.round((score / questions.length) * 100)}%</div>
            <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Accuracy</div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={onExit}
            className="w-full py-4 font-bold rounded-2xl transition-colors active:scale-95"
            style={{ backgroundColor: 'var(--editorial-accent)', color: '#fff', fontFamily: 'var(--font-body)' }}
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
        <div className="flex justify-between items-center text-sm font-medium" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--editorial-border)' }}>
          <motion.div 
            className="h-full" style={{ backgroundColor: 'var(--editorial-accent)' }}
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
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--editorial-accent)', fontFamily: 'var(--font-body)' }}>Knowledge Check</span>
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
                  className="w-full text-left p-5 rounded-2xl border transition-all duration-300 active:scale-[0.98]"
                  style={{
                    fontFamily: 'var(--font-body)',
                    ...(variant === 'correct' ? { backgroundColor: 'rgba(52,211,153,0.1)', borderColor: 'rgba(52,211,153,0.3)', color: '#34d399' } :
                    variant === 'incorrect' ? { backgroundColor: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)', color: '#fbbf24' } :
                    variant === 'selected' ? { borderColor: 'var(--editorial-accent)', backgroundColor: 'rgba(196,155,76,0.08)', color: 'var(--editorial-accent)' } :
                    variant === 'dimmed' ? { backgroundColor: 'var(--editorial-bg)', borderColor: 'var(--editorial-border)', color: 'var(--editorial-muted)', opacity: 0.4 } :
                    { backgroundColor: 'var(--editorial-bg)', borderColor: 'var(--editorial-border)', color: 'var(--editorial-muted)' })
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{option}</span>
                    {variant === 'correct' && <span className="text-lg">✓</span>}
                    {variant === 'incorrect' && (
                      <motion.span
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 0.3 }}
                        className="text-lg"
                      >
                        •
                      </motion.span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl space-y-2" style={{ backgroundColor: 'var(--editorial-surface)', border: '1px solid var(--editorial-border)' }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}>Etymology & Usage</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--editorial-text)', fontFamily: 'var(--font-body)' }}>{currentQuestion.explanation}</p>
            </motion.div>
          )}

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onExit}
              className="px-8 py-4 font-bold rounded-2xl transition-all" style={{ backgroundColor: 'var(--editorial-bg)', border: '1px solid var(--editorial-border)', color: 'var(--editorial-muted)', fontFamily: 'var(--font-body)' }}
            >
              Exit
            </button>
            {!isAnswered ? (
              <button 
                onClick={checkAnswer}
                disabled={!selectedOption}
                className="flex-1 py-4 text-white font-bold rounded-2xl transition-all active:scale-95" style={{ backgroundColor: 'var(--editorial-accent)', fontFamily: 'var(--font-body)' }}
              >
                Check Answer
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="flex-1 py-4 text-white font-bold rounded-2xl transition-all active:scale-95" style={{ backgroundColor: 'var(--editorial-accent)', fontFamily: 'var(--font-body)' }}
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
