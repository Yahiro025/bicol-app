'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Step {
  title: string
  description: string
  energyLevel?: 'low' | 'moderate' | 'high'
  content?: React.ReactNode
}

interface MicroStepCarouselProps {
  steps: Step[]
  activeStep: number
  onStepChange: (index: number) => void
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
}

export function MicroStepCarousel({
  steps,
  activeStep,
  onStepChange,
}: MicroStepCarouselProps) {
  const [[page, direction], setPage] = useState([activeStep, 0])

  const paginate = (newIndex: number) => {
    const newDirection = newIndex > page ? 1 : -1
    setPage([newIndex, newDirection])
    onStepChange(newIndex)
  }

  const currentStep = steps[page]
  if (!currentStep) return null

  return (
    <div className="space-y-6">
      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === page
                ? 'w-6 bg-blue-500'
                : 'w-2 bg-zinc-700 hover:bg-zinc-600'
            }`}
            aria-label={`Go to step ${i + 1}: ${step.title}`}
          />
        ))}
      </div>

      {/* Slide content */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
            className="rounded-[32px] border border-zinc-800 bg-zinc-900/50 p-8"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-black text-white">
                {page + 1}
              </span>
              <h3 className="text-xl font-bold text-white">{currentStep.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">{currentStep.description}</p>
            {currentStep.content && <div className="mt-6">{currentStep.content}</div>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => paginate(page - 1)}
          disabled={page === 0}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
          {page + 1} of {steps.length}
        </span>
        <button
          onClick={() => paginate(page + 1)}
          disabled={page === steps.length - 1}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-blue-500 transition-colors hover:text-blue-400 disabled:opacity-30"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
