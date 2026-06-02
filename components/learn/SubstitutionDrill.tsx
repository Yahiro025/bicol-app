"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SubstitutionDrill } from "@/lib/types/learn";

interface SubstitutionDrillProps {
  drills: SubstitutionDrill[];
  onComplete?: () => void;
}

export default function SubstitutionDrillComponent({
  drills,
  onComplete,
}: SubstitutionDrillProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const currentDrill = drills[currentIndex];

  const normalize = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .replace(/\s+/g, " ");
  };

  const handleCheck = () => {
    if (!currentDrill) return;
    const normalizedInput = normalize(userInput);
    const normalizedExpected = normalize(currentDrill.expectedAnswer);

    const correct = normalizedInput === normalizedExpected;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (!correct) {
      setRetryCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < drills.length) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      setIsAnswered(false);
      setIsCorrect(false);
      setRetryCount(0);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userInput.trim() !== "") {
      if (!isAnswered) {
        handleCheck();
      } else {
        handleNext();
      }
    }
  };

  if (!currentDrill) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 py-8 px-4">
      {/* Drill Header */}
      <div className="text-center space-y-2">
        <motion.span 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold text-purple-500 uppercase tracking-[0.2em]"
        >
          Substitution Drill
        </motion.span>
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-display font-bold tracking-tight text-white"
        >
          Mintz Lesson 1
        </motion.h2>
      </div>

      {/* Drill Card */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className={`card-resting p-8 md:p-12 space-y-10 relative overflow-hidden ${
          isAnswered && isCorrect ? "ring-2 ring-emerald-500/20 bg-emerald-500/5 glow-emerald-small" : 
          isAnswered && !isCorrect ? "ring-1 ring-amber-400/10 bg-amber-400/5" : ""
        }`}
      >
        {/* Base Sentence */}
        <div className="space-y-4 text-center">
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Base Sentence</p>
          <div className="p-6 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
            <p className="text-2xl md:text-3xl font-mono text-zinc-300 leading-relaxed italic">
              "{currentDrill.baseSentence}"
            </p>
          </div>
        </div>

        {/* Cue Pill */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Cue Word</p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-full text-blue-400 font-bold text-xl shadow-sm"
          >
            {currentDrill.cue}
          </motion.div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAnswered && isCorrect}
            placeholder="Type the new sentence..."
            className={`w-full bg-zinc-950 border-2 p-6 rounded-2xl text-xl text-center focus:outline-none transition-all duration-300 placeholder:text-zinc-700 ${
              isAnswered && isCorrect ? "border-emerald-500/50 text-emerald-400" :
              isAnswered && !isCorrect ? "border-amber-400/30 text-amber-400" :
              "border-zinc-800 focus:border-blue-500 text-white"
            }`}
            autoFocus
          />
          
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-4 text-center"
              >
                {!isCorrect && (
                  <div className="p-4 bg-amber-400/5 rounded-xl border border-amber-400/10 space-y-2">
                    <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">
                      {retryCount === 1 ? "Let's try that again" : "Here's the answer"}
                    </p>
                    {retryCount > 1 && (
                      <p className="text-zinc-100 text-lg font-mono">{currentDrill.expectedAnswer}</p>
                    )}
                  </div>
                )}
                {isCorrect && (
                   <motion.p 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-emerald-500 font-bold uppercase tracking-[0.2em] text-sm"
                   >
                     Perfectly Accurate
                   </motion.p>
                )}
                {currentDrill.explanation && (
                  <p className="text-zinc-500 text-sm italic max-w-md mx-auto leading-relaxed">
                    {currentDrill.explanation}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          {isAnswered && !isCorrect && retryCount === 1 ? (
            <button
              onClick={() => {
                setIsAnswered(false);
                setUserInput("");
              }}
              className="w-full py-5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-2xl transition-all active:scale-[0.98] border border-amber-500/20"
            >
              Try Again
            </button>
          ) : !isAnswered ? (
            <button
              onClick={handleCheck}
              disabled={userInput.trim() === ""}
              className="w-full py-5 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-5 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg"
            >
              {currentIndex + 1 < drills.length ? "Next Drill" : "Finish Lesson"}
            </button>
          )}
        </div>
      </motion.div>

      {/* Progress Footer */}
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
           <div className="h-1.5 w-32 bg-zinc-900 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-purple-500"
               initial={{ width: 0 }}
               animate={{ width: `${((currentIndex + 1) / drills.length) * 100}%` }}
               transition={{ type: "spring", stiffness: 100, damping: 20 }}
             />
           </div>
           <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
             {currentIndex + 1} of {drills.length}
           </span>
        </div>
        <button 
          onClick={onComplete}
          className="text-zinc-600 hover:text-zinc-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          Skip Session
        </button>
      </div>
    </div>
  );
}
