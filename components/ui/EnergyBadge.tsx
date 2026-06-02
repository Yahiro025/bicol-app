interface EnergyBadgeProps {
  level: 'low' | 'moderate' | 'high'
  size?: 'sm' | 'md'
}

const energyConfig: Record<string, { label: string }> = {
  low: { label: 'Low Energy' },
  moderate: { label: 'Moderate Energy' },
  high: { label: 'High Energy' },
}

const energyClasses = {
  emerald: {
    sm: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 px-2.5 py-1 text-[10px]',
    md: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 px-3 py-1.5 text-xs',
  },
  amber: {
    sm: 'bg-amber-500/10 border-amber-500/20 text-amber-400 px-2.5 py-1 text-[10px]',
    md: 'bg-amber-500/10 border-amber-500/20 text-amber-400 px-3 py-1.5 text-xs',
  },
  red: {
    sm: 'bg-red-500/10 border-red-500/20 text-red-400 px-2.5 py-1 text-[10px]',
    md: 'bg-red-500/10 border-red-500/20 text-red-400 px-3 py-1.5 text-xs',
  },
} as const

const colorMap = {
  low: 'emerald',
  moderate: 'amber',
  high: 'red',
} as const

type EnergyColor = (typeof colorMap)[keyof typeof colorMap]

export function EnergyBadge({ level, size = 'sm' }: EnergyBadgeProps) {
  const config = energyConfig[level]
  if (!config) return null

  const color: EnergyColor = colorMap[level]
  const sizeClasses = energyClasses[color][size]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-widest ${sizeClasses}`}
    >
      {config.label}
    </span>
  )
}
