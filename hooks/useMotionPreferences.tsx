'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type MotionLevel = 'none' | 'reduced' | 'default' | 'enhanced'

interface MotionPreferences {
  level: MotionLevel
  multiplier: number
  setLevel: (level: MotionLevel) => void
}

const MotionContext = createContext<MotionPreferences>({
  level: 'default',
  multiplier: 1,
  setLevel: () => {},
})

const STORAGE_KEY = 'bikol-motion-preference'

function multiplierForLevel(level: MotionLevel): number {
  if (level === 'none') return 0
  if (level === 'reduced') return 0.5
  if (level === 'enhanced') return 1.5
  return 1
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevelState] = useState<MotionLevel>('default')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as MotionLevel | null
    if (stored) setLevelState(stored)
  }, [])

  const setLevel = useCallback((newLevel: MotionLevel) => {
    setLevelState(newLevel)
    localStorage.setItem(STORAGE_KEY, newLevel)
  }, [])

  const multiplier = multiplierForLevel(level)

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--motion-multiplier',
      String(multiplier),
    )
  }, [multiplier])

  return (
    <MotionContext.Provider value={{ level, multiplier, setLevel }}>
      {children}
    </MotionContext.Provider>
  )
}

export function useMotionPreferences() {
  return useContext(MotionContext)
}
