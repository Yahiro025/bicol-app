'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number // 0–100
  variant?: 'energy' | 'xp' | 'streak'
  label?: string
  showValue?: boolean
  className?: string
}

const variants: Record<string, string> = {
  energy: 'bg-gradient-to-r from-emerald-400 to-emerald-300',
  xp: 'bg-gradient-to-r from-blue-500 to-purple-500',
  streak: 'bg-gradient-to-r from-amber-400 to-orange-400',
}

export function ProgressBar({
  value,
  variant = 'xp',
  label,
  showValue,
  className,
}: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value))

  return (
    <div className={className}>
      {(label !== undefined || showValue === true) && (
        <div className="mb-1 flex justify-between text-xs font-medium text-zinc-500">
          {label !== undefined && <span>{label}</span>}
          {showValue === true && <span>{Math.round(safeValue)}%</span>}
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
        <motion.div
          className={`h-full rounded-full ${variants[variant] ?? variants.xp}`}
          initial={{ width: 0 }}
          animate={{ width: `${safeValue}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 20, mass: 1 }}
        />
      </div>
    </div>
  )
}
