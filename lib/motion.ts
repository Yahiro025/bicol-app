/**
 * Physics-inspired spring configurations for different UI elements.
 * Mass increases for heavier elements (cards > buttons > text).
 */
const spring = (stiffness: number, damping: number, mass: number) =>
  ({ type: 'spring' as const, stiffness, damping, mass });

export const Springs = {
  micro:   spring(500, 35, 0.3),  // icons, badges, indicators
  light:   spring(400, 25, 0.8),  // buttons, toggles, small interactive elements
  default: spring(300, 30, 1.0),  // list items, nav links, medium cards
  heavy:   spring(200, 40, 1.5),  // large cards, WOTD, hero sections
  page:    spring(150, 35, 2.0),  // page transitions, full-screen modals
  bouncy:  spring(400, 10, 0.5),  // celebratory elements, badges earned
} as const;
