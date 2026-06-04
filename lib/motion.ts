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
