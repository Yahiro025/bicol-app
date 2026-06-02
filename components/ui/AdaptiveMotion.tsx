'use client'

import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { useMotionPreferences } from '@/hooks/useMotionPreferences'

interface AdaptiveMotionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
}

export function AdaptiveMotion({
  children,
  transition,
  animate,
  initial,
  className,
  ...motionProps
}: AdaptiveMotionProps) {
  const { multiplier } = useMotionPreferences()

  if (multiplier === 0) {
    return <div className={typeof className === 'string' ? className : undefined}>{children}</div>
  }

  const scaledTransition = transition
    ? {
        ...transition,
        duration:
          typeof transition === 'object' &&
          transition !== null &&
          'duration' in transition &&
          typeof transition.duration === 'number'
            ? (transition.duration as number) / multiplier
            : undefined,
      }
    : undefined

  return (
    <motion.div
      className={className}
      {...motionProps}
      initial={initial}
      animate={animate}
      transition={scaledTransition}
    >
      {children}
    </motion.div>
  )
}
