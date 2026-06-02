'use client'

import { Pause, Snail, Rabbit, Zap } from 'lucide-react'
import { useMotionPreferences, type MotionLevel } from '@/hooks/useMotionPreferences'
import { cn } from '@/lib/utils'

const levels: { level: MotionLevel; icon: typeof Pause; label: string }[] = [
  { level: 'none', icon: Pause, label: 'No motion' },
  { level: 'reduced', icon: Snail, label: 'Reduced motion' },
  { level: 'default', icon: Rabbit, label: 'Default motion' },
  { level: 'enhanced', icon: Zap, label: 'Enhanced motion' },
]

export function MotionToggle({ className }: { className?: string }) {
  const { level, setLevel } = useMotionPreferences()

  const currentIndex = levels.findIndex((l) => l.level === level)
  const nextIndex = (currentIndex + 1) % levels.length
  const nextLevel = levels[nextIndex]!

  return (
    <button
      type="button"
      onClick={() => setLevel(nextLevel.level)}
      className={cn(
        'p-2 rounded-xl transition-all duration-200',
        'min-w-11 min-h-11',
        'bg-zinc-100 dark:bg-zinc-800',
        'hover:scale-105 active:scale-95',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950',
        'touch-manipulation [-webkit-tap-highlight-color:transparent]',
        className,
      )}
      aria-label={`Motion: ${nextLevel.label}. Click to change.`}
      title={nextLevel.label}
    >
      <nextLevel.icon
        className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
        aria-hidden="true"
      />
    </button>
  )
}
