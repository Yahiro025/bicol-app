/**
 * Physics-inspired spring configurations for different UI elements.
 * Mass increases for heavier elements (cards > buttons > text).
 * More mass = slower, more deliberate motion.
 */
export const Springs = {
  /** Ultra-light: icons, badges, indicators */
  micro: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 35,
    mass: 0.3,
  },

  /** Light: buttons, toggles, small interactive elements */
  light: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  },

  /** Default: list items, nav links, medium cards */
  default: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 1.0,
  },

  /** Heavy: large cards, WOTD, hero sections */
  heavy: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 40,
    mass: 1.5,
  },

  /** Ultra-heavy: page transitions, full-screen modals */
  page: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 35,
    mass: 2.0,
  },

  /** Bouncy: celebratory elements, badges earned */
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 10,
    mass: 0.5,
  },
} as const

/**
 * Hover scale presets — subtle and accessible.
 * Never scale below 1.0 (active) or above 1.05 (hover) to prevent
 * layout shift / sensory overload.
 */
export const HoverScale = {
  subtle: { scale: 1.01 },
  default: { scale: 1.02 },
  prominent: { scale: 1.03 },
} as const

/** Active/tap scale — consistent press-down feedback */
export const ActiveScale = { scale: 0.97 } as const

/**
 * Stagger delays for list animations.
 * Short delays prevent motion sickness in long lists.
 */
export const Stagger = {
  fast: 0.03, // dense grids
  default: 0.05, // standard lists
  slow: 0.08, // featured content
} as const
