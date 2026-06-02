'use client'

import { motion } from 'framer-motion'

interface SanctuaryPromptProps {
  onDismiss: () => void
}

export function SanctuaryPrompt({ onDismiss }: SanctuaryPromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 1 }}
      className="space-y-6 rounded-[32px] border border-emerald-500/20 bg-zinc-900/80 p-8 text-center"
    >
      <div className="sanctuary-breathe mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
        <span className="text-3xl" role="img" aria-label="Meditation">
          🧘
        </span>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Time for a breather?</h3>
        <p className="text-sm text-zinc-400">
          You've been practicing for a while. A short break helps your brain
          consolidate what you've learned.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onDismiss}
          className="flex-1 rounded-2xl bg-emerald-500 py-3 font-bold text-white transition-all hover:bg-emerald-600"
        >
          Take a Break
        </button>
        <button
          onClick={onDismiss}
          className="flex-1 rounded-2xl bg-zinc-800 py-3 font-bold text-zinc-400 transition-all hover:bg-zinc-700"
        >
          Keep Going
        </button>
      </div>
    </motion.div>
  )
}
