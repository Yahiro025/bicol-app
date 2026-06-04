# Bikol Dictionary — Design Improvement Plan

**Status:** Planning  
**Last Updated:** June 2, 2026  
**Based on:** Landasan (landasan.vercel.app) design philosophy analysis  
**Contributors:** Buffy (orchestrator), Gemini Thinker, ECC Planner methodology  

---

## Table of Contents

1. [Landasan Design Philosophy — Deep Analysis](#1-landasan-design-philosophy--deep-analysis)
2. [Our Current Design — Gap Analysis](#2-our-current-design--gap-analysis)
3. [Phase 1: Sensory Foundation — Spacing & Design Tokens](#3-phase-1-sensory-foundation--spacing--design-tokens)
4. [Phase 2: Generous Micro-Interactions & Physics](#4-phase-2-generous-micro-interactions--physics)
5. [Phase 3: Adaptive UX — Energy States & Zero-Penalty](#5-phase-3-adaptive-ux--energy-states--zero-penalty)
6. [Phase 4: Gamified Navigation & Sanctuary](#6-phase-4-gamified-navigation--sanctuary)
7. [Design Tokens Reference](#7-design-tokens-reference)
8. [Animation System Reference](#8-animation-system-reference)
9. [File-by-File Change Log](#9-file-by-file-change-log)

---

## 1. Landasan Design Philosophy — Deep Analysis

### 1.1 What is Landasan?

Landasan is a **neuro-inclusive K-12 learning hub** (React 19 + Vite + Tailwind CSS + Zustand + Matter.js) designed to address the Philippine education crisis with specific focus on ADHD, Autism, and Dyslexia learners. It reimagines education as a gamified, modular digital sanctuary.

### 1.2 Core Design Principles

| Principle | Description | Visual/UX Expression |
|-----------|-------------|---------------------|
| **Adaptive Autonomy** | User has total agency over their environment | Customizable themes, color palettes, contrast levels, font sizes, motion intensity via React Context |
| **Neuro-Inclusive Design** | Prevents sensory overload and executive dysfunction | Generous whitespace, energy-based categorization (Green/Yellow/Red), no deficit-based language ("easy/hard") |
| **Zero-Penalty Loop** | Removes anxiety of failure | Infinite retries, gentle feedback, exploration over performance |
| **Task Shredder** | Breaks overwhelming tasks into granular steps | Micro-step carousels, progressive disclosure, chunked content |
| **Sanctuary Interruption** | Proactive mental health breaks | System detects erratic behavior/inactivity → offers breathing exercises via "Rek" study buddy |
| **Dual-View Learning Profile** | Translates raw data into actionable insights | Toggles between XP/stats and behavioral trends for parents/teachers |
| **Biome Map Navigation** | Gamified spatial navigation | Ocean/Tropics/Desert zones instead of linear menus |
| **Physics-Based Interactivity** | Kinesthetic digital feedback | Matter.js physics engine for Active Concept Labs |
| **Multi-Modal Expression** | Supports diverse input methods | Text, speech, drawing support |
| **Generous Visual Feedback** | Every action gets a response | Spring animations, hover states, glow effects, progress indicators |

### 1.3 Key Distillation for Our Dictionary

For a **language dictionary** (not a full LMS), the most applicable Landasan principles are:

1. **Neuro-inclusive whitespace & readability** — our dense text-heavy dictionary pages benefit from Landasan's generous spacing
2. **Zero-penalty learning** — our quiz/drill "wrong answer" states (red borders, shake animations) are punitive
3. **Energy-based states** — "Green/Yellow/Red" cognitive load framing instead of "Easy/Medium/Hard"
4. **Generous micro-interactions** — Landasan's every-element-responds philosophy vs our limited hover states
5. **Physics-inspired springs** — Matter.js-inspired Framer Motion configs (mass, weight, damping)
6. **Progressive disclosure** — Task Shredder for our 3-phase learning module
7. **Gamified navigation** — Biome Map inspiration for our category browsing

---

## 2. Our Current Design — Gap Analysis

### 2.1 Current State

**Strengths:**
- Dark-first design with well-chosen zinc-950 palette
- Blue-to-purple gradient accent system (brand differentiation)
- Framer Motion page transitions (smooth, 0.15s)
- Staggered spring card animations (stiffness: 300, damping: 25-30)
- 3D flashcard flip with spring physics
- Custom CSS utilities: `glass-effect`, `card-resting`, `responsive-bloom`, glow variants
- PWA install prompt with spring animation
- Navigation loading bar with gradient
- Comprehensive component library (27+ components)

**Gaps vs Landasan:**

| Landasan Feature | Our Status | Gap Severity |
|-----------------|-----------|--------------|
| ~~Motion preferences (user-controlled)~~ | ✅ Removed | — |
| Sensory controls (contrast, font scale) | ❌ None | 🔴 High |
| Energy-based categorization | ❌ Uses "Easy/Hard" implicitly | 🟡 Medium |
| Zero-penalty feedback | ❌ Red borders, shake animations on error | 🟡 Medium |
| Task Shredder (micro-steps) | ❌ Scrolling wall of text | 🟡 Medium |
| Generous hover states | ⚠️ Some cards, not all interactive elements | 🟡 Medium |
| Physics-inspired springs | ⚠️ Basic springs, no mass/damping variety | 🟢 Low |
| Sanctuary interruption | ❌ None | 🟢 Low (future) |
| Biome Map navigation | ❌ Standard lists | 🟢 Low (future) |
| Multi-modal input | ⚠️ Text only | 🟢 Low (future) |

### 2.2 Specific Anti-Patterns Found

1. **Punitive error states** — `SubstitutionDrill.tsx` uses:
   - `shake` animation array `[-10, 10, -10, 10, 0]`
   - Red borders (`border-rose-500/50`)
   - `ring-2 ring-rose-500/20 bg-rose-500/5`
   
2. **Dense content** — `app/page.tsx` hero has 4 stacked sections (hero → verb demo → categories → popular words) with tight spacing

3. **Hardcoded stats** — `app/learn/page.tsx` shows `12 Words`, `3 Days`, `88%` as static values

4. **Limited interactivity** — `DesktopNav.tsx` uses basic color transitions, no scale/slide effects

5. **Animation uniformity** — Most springs use `stiffness: 300, damping: 25-30` — no differentiation by element weight/size

---

## 3. Phase 1: Sensory Foundation — Spacing & Design Tokens

**Impact:** 🟡 Medium | **Effort:** 🟢 Low | **Files:** ~4 modified

> **Note**: The motion preferences system (useMotionPreferences, MotionToggle, AdaptiveMotion, --motion-multiplier CSS variable) was implemented as planned below but later removed — it had no visible effect since Framer Motion uses its own internal timing rather than CSS custom properties for animations. The CSS `--motion-multiplier` variable only affected a few generic `transition` declarations and wasn't connected to the Framer Motion infrastructure.

### 3.1 Generous Whitespace Pass

Increase padding/margins across key pages:

**`app/page.tsx` changes:**
- Hero section: `py-20 md:py-28` → `py-24 md:py-36` (more breathing room)
- Section gaps: `gap-16` → `gap-24` (more separation between sections)
- Stats grid: add `gap-4` → `gap-6` for breathing room
- Max-width: `max-w-5xl` → `max-w-4xl` for hero text (narrower, easier to read)

**`components/CategoryGrid.tsx` changes:**
- Grid gap: `gap-4` → `gap-6`
- Card padding: `p-6` → `p-8`

**`components/WordCard.tsx` changes:**
- Card padding: `p-6` → `p-7`

### 3.4 Design Token Additions

**`app/globals.css` additions:**

```css
:root {
  /* Spacing scale (neuro-inclusive generous defaults) */
  --space-card-padding: 1.75rem;    /* was implicit ~1.5rem */
  --space-section-gap: 6rem;        /* was implicit ~4rem */
  --space-content-max-width: 72rem; /* was 80rem (6xl) */
  
  /* Energy state colors (replacing "difficulty" language) */
  --energy-low: #10b981;     /* emerald — low cognitive load */
  --energy-moderate: #f59e0b; /* amber — moderate cognitive load */
  --energy-high: #ef4444;    /* red — high cognitive load, use sparingly */
  
  /* Sensory-safe feedback colors */
  --feedback-success: #34d399;    /* softer emerald */
  --feedback-neutral: #94a3b8;   /* slate — replaces rose "error" */
  --feedback-highlight: #60a5fa;  /* softer blue */
}
```

---

## 4. Phase 2: Generous Micro-Interactions & Physics

**Impact:** 🟡 Medium | **Effort:** 🟡 Medium | **Files:** ~8 modified, 2 new

### 4.1 Physics-Inspired Spring Configs

Create a shared spring configuration library mapped to UI element "weight classes":

**New file: `lib/motion.ts`**

```typescript
import type { Spring } from 'framer-motion'

/**
 * Physics-inspired spring configurations for different UI elements.
 * Mass increases for heavier elements (cards > buttons > text).
 * More mass = slower, more deliberate motion.
 */
// ⚠️ Do NOT use `satisfies Record<string, Spring>` — framer-motion v12's Spring
// type may not accept `mass` at runtime. Use explicit type assertion instead, or
// let TypeScript infer the types naturally.
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
  fast: 0.03,    // dense grids
  default: 0.05,  // standard lists
  slow: 0.08,     // featured content
} as const
```

### 4.2 Enhanced Hover States

Apply comprehensive hover micro-interactions to currently static elements:

**`components/DesktopNav.tsx` enhancement:**
```tsx
// Add subtle scale + color transition on nav links
<motion.span
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.97 }}
  className="..."
>
```

**`components/SearchBar.tsx` enhancement:**
- Add expanding glow ring on focus (currently only `shadow-[0_0_20px_rgba(59,130,246,0.1)]`)
- Bounce animation on search icon when results load
- Subtle scale on result items hover

**`components/HomeVerbDemo.tsx` enhancement:**
- Add slide transition between verb selections (currently `opacity: 0, y: 10`)
- Button active feedback with ripple-like scale

**`components/ui/Button.tsx` enhancement:**
```tsx
// Add whileHover and whileTap to the button component itself
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
  ...
>
```

### 4.3 Flashcard Physics Upgrade

**`components/Flashcards.tsx` improvements:**
- Current: `stiffness: 300, damping: 30` for card flip
- New: `Stiffness: 260, damping: 20, mass: 1.2` (heavier card feel)
- Add tilt effect on hover before flip (`rotateX: 2, rotateY: 2`)
- Add subtle shadow gradient that shifts with card orientation

### 4.4 Progress Bar Animations

Create a reusable animated progress component (Landasan's energy bars):

**New file: `components/ui/ProgressBar.tsx`**

```tsx
'use client'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number      // 0–100
  variant?: 'energy' | 'xp' | 'streak'
  label?: string
  showValue?: boolean
  className?: string
}

const variants = {
  energy: 'bg-gradient-to-r from-emerald-400 to-emerald-300',
  xp: 'bg-gradient-to-r from-blue-500 to-purple-500',
  streak: 'bg-gradient-to-r from-amber-400 to-orange-400',
}

export function ProgressBar({ value, variant = 'xp', label, showValue, className }: ProgressBarProps) {
  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex justify-between text-xs font-medium text-zinc-500 mb-1">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(value)}%</span>}
        </div>
      )}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${variants[variant]}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 20, mass: 1 }}
        />
      </div>
    </div>
  )
}
```

---

## 5. Phase 3: Adaptive UX — Energy States & Zero-Penalty

**Impact:** 🔴 High | **Effort:** 🟡 Medium | **Files:** ~6 modified, 1 new

### 5.1 Zero-Penalty Learning Feedback

**Replace punitive error states with neuro-inclusive alternatives:**

**`components/learn/SubstitutionDrill.tsx` — key changes:**

| Current (Punitive) | New (Zero-Penalty) |
|-------------------|-------------------|
| `shake` animation `[-10, 10, -10, 10, 0]` | Gentle "bounce back" spring reset |
| `border-rose-500/50` red border | `border-amber-400/30` warm neutral border |
| `bg-rose-500/5` red background | `bg-amber-400/5` warm background |
| `ring-2 ring-rose-500/20` red ring | `ring-1 ring-amber-400/10` subtle ring |
| "Expected Translation" in `text-rose-500` | "Let's try that again" in `text-amber-400` |
| No second chance before seeing answer | "Try again" button before revealing |

**`components/Quiz.tsx` — key changes:**

| Current (Punitive) | New (Zero-Penalty) |
|-------------------|-------------------|
| `bg-red-500/10 border-red-500 text-red-400` incorrect state | `bg-amber-400/10 border-amber-400 text-amber-400` gentle incorrect |
| ✗ symbol on wrong answer | Soft pulse animation instead of ✗ |
| "Check Answer" → immediate reveal | "Check Answer" → hint first, then reveal on second attempt |

### 5.2 Energy-Based UI Language

Replace "difficulty" language with "energy" framing:

**`components/learn/AppliedFluency.tsx` changes:**
```tsx
// Before:
<span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
  {scenario.difficulty}  // "beginner", "intermediate", "advanced"
</span>

// After:
const energyLabel = scenario.difficulty === 'beginner' ? '🟢 Low Energy' :
                    scenario.difficulty === 'intermediate' ? '🟡 Moderate Energy' :
                    '🔴 High Energy'
<span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
  {energyLabel}
</span>
```

**`app/learn/page.tsx` — 3-Phase curriculum:**

```tsx
// Phase cards get energy indicators:
<div className="flex items-center gap-1.5">
  <span className={`w-2 h-2 rounded-full ${activePhase === 1 ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
    {activePhase === 1 ? 'Warm-up' : activePhase === 2 ? 'Build' : 'Flow'}
  </span>
</div>
```

### 5.3 Energy State Component

**New file: `components/ui/EnergyBadge.tsx`**

```tsx
interface EnergyBadgeProps {
  level: 'low' | 'moderate' | 'high'
  size?: 'sm' | 'md'
}

const energyConfig = {
  low: { color: 'emerald', icon: '🟢', label: 'Low Energy' },
  moderate: { color: 'amber', icon: '🟡', label: 'Moderate Energy' },
  high: { color: 'red', icon: '🔴', label: 'High Energy' },
}

// ⚠️ Must use COMPLETE Tailwind class names — JIT cannot detect template literals
const energyClasses: Record<string, { sm: string; md: string }> = {
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
}

export function EnergyBadge({ level, size = 'sm' }: EnergyBadgeProps) {
  const config = energyConfig[level]
  const sizeClasses = energyClasses[config.color]?.[size] ?? energyClasses.emerald.sm
  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full
      font-black uppercase tracking-widest
      ${sizeClasses}
    `}>
      {config.label}
    </span>
  )
}
```

### 5.4 Task Shredder — Progressive Disclosure

**`app/learn/page.tsx` — break the scrolling wall into a carousel:**

Instead of showing all 3 phases as static cards with long descriptions, present them as a step-by-step carousel:

```tsx
// New: MicroStepCarousel wrapping the phase content
import { MicroStepCarousel } from '@/components/learn/MicroStepCarousel'

// Each phase becomes a slide with:
// 1. Title + energy badge
// 2. One-sentence purpose
// 3. Start button
// 4. (Expanded) Detailed description — shown on click, not by default
```

**New file: `components/learn/MicroStepCarousel.tsx`**

A Framer Motion carousel with:
- Horizontal slide transitions using `AnimatePresence mode="wait"`
- Dot indicators showing total steps + current
- "Skip" / "Next" navigation with spring transitions
- Reduced motion: simple fade instead of slide

---

## 6. Phase 4: Sanctuary & Visual Refinement

**Impact:** 🟢 Medium | **Effort:** 🟡 Medium | **Files:** ~3 modified, 1 new

**⚠️ Scope Note:** The originally proposed Biome Map navigation and DualView Profile have been deferred to a separate milestone — they depend on the gamification plan (GAMIFICATION_PLAN.md) being implemented first. Phase 4 now focuses on achievable improvements.

### 6.1 Sanctuary/Break Prompt

**New file: `components/SanctuaryPrompt.tsx`**

A gentle prompt that appears after ~20 minutes of continuous learning activity:

```tsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Simple session timer hook — tracks total active time on learn page
function useSessionTimer(isActive: boolean) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive])

  // Reset on mount
  useEffect(() => { startRef.current = Date.now() }, [])

  return elapsed
}

// Show prompt after 20 min (1200s), never interrupt mid-activity
const SANCTUARY_THRESHOLD = 1200

export function SanctuaryPrompt({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 bg-zinc-900/80 border border-emerald-500/20 rounded-[32px] text-center space-y-6"
    >
      <div className="sanctuary-breathe mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
        <span className="text-3xl">🧘</span>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-white">Time for a breather?</h3>
        <p className="text-zinc-400 text-sm">You've been practicing for a while. A short break helps your brain consolidate what you've learned.</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onDismiss} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all">
          Take a Break
        </button>
        <button onClick={onDismiss} className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold rounded-2xl transition-all">
          Keep Going
        </button>
      </div>
    </motion.div>
  )
}
```

**Integration point:** Show in `app/learn/page.tsx` between phase transitions (phase 1→2, 2→3), never mid-drill.

### 6.2 Existing CSS Utility Updates

Update legacy CSS classes to use the new design tokens:

**`app/globals.css` — update `card-resting`:**
```css
.card-resting {
  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  transition: all 200ms ease-out;
}
/* ... hover state with standard transition */
```

**`app/globals.css` — update `responsive-bloom`:**
```css
.responsive-bloom {
  transition: all 300ms ease-out;
}
```

### 6.3 Accessibility Audit

Run a WCAG 2.2 pass on all new components:

- Ensure all interactive elements have `focus-visible` rings ✅ (existing pattern already good)
- Verify color contrast ratios (4.5:1 minimum) — particularly the `text-zinc-500` on `bg-zinc-950` pattern
- Add `aria-label` to all icon-only buttons
- Ensure `prefers-reduced-motion: reduce` disables auto-playing animations
- Test keyboard navigation for MicroStepCarousel
- Verify EnergyBadge colors meet contrast requirements

---

## 7. Design Tokens Reference

### 7.1 Complete Color System

```css
:root {
  /* Brand */
  --color-primary: #3b82f6;        /* Blue-500 */
  --color-primary-hover: #2563eb;  /* Blue-600 */
  --color-secondary: #a855f7;      /* Purple-500 */
  --color-accent: #0ea5e9;         /* Sky-500 */
  
  /* Energy states (replaces difficulty language) */
  --energy-low: #10b981;           /* Emerald-500 */
  --energy-moderate: #f59e0b;      /* Amber-500 */
  --energy-high: #ef4444;          /* Red-500 — sparing use */
  
  /* Feedback (zero-penalty) */
  --feedback-success: #34d399;     /* Emerald-400 */
  --feedback-neutral: #94a3b8;     /* Slate-400 — replaces rose "error" */
  --feedback-highlight: #60a5fa;   /* Blue-400 */
  
  /* Surface */
  --surface-default: #09090b;      /* Zinc-950 */
  --surface-raised: #18181b;       /* Zinc-900 */
  --surface-overlay: #27272a;      /* Zinc-800 */
  
  /* Text */
  --text-primary: #fafafa;         /* Zinc-50 */
  --text-secondary: #a1a1aa;      /* Zinc-400 */
  --text-tertiary: #71717a;       /* Zinc-500 */
  
  /* Spacing */
  --space-card-padding: 1.75rem;
  --space-section-gap: 6rem;
  --space-content-max-width: 72rem;
}
```

### 7.2 Typography Scale

```css
/* Current */
.font-display → tracking-tighter, font-black
Body → 16px base

/* Proposed additions */
.text-hero       →  clamp(3rem, 8vw, 9rem)         /* BIKOL title */
.text-section    →  clamp(1.5rem, 4vw, 2.25rem)   /* Section headings */
.text-body       →  1.125rem                        /* Body — slightly larger */
.text-label      →  0.625rem                        /* Labels — uppercase */
```

---

## 8. Animation System Reference

### 8.1 Timing Guidelines

| Context | Duration | Easing |
|---------|----------|--------|
| Page transitions | 200-300ms | `easeOut` |
| Card entrances | 400-600ms | Spring (see `Springs.default`) |
| Hover micro-interactions | 150-200ms | `easeOut` |
| Active/tap feedback | 100ms | `easeIn` |
| Progress bars | 800-1200ms | Spring (`stiffness: 50`) |
| Sanctuary breathing | 4000-8000ms | `easeInOut` loop |

### 8.2 Reduced Motion Strategy

When `prefers-reduced-motion: reduce` is active:
- All `AnimatePresence` uses `mode="wait"` with instant transitions (`duration: 0`)
- `whileHover` / `whileTap` disabled
- Stagger delays set to 0
- Auto-playing animations (loading spinners, breathing) paused
- Carousels switch to simple fade

---

## 9. File-by-File Change Log

### Phase 1 Files

> **Note**: The motion preferences system (useMotionPreferences, MotionToggle, AdaptiveMotion, --motion-multiplier) was initially implemented but later removed as it provided no visible benefit (Framer Motion uses its own timing, not CSS variables). The remaining Phase 1 changes are:

| File | Action | Changes |
|------|--------|---------|
| `app/globals.css` | MODIFY | Add energy colors, spacing tokens |
| `app/page.tsx` | MODIFY | Increase padding, spacing, max-width |
| `components/CategoryGrid.tsx` | MODIFY | Increase gap, padding |
| `components/WordCard.tsx` | MODIFY | Increase padding |

### Phase 2 Files

| File | Action | Changes |
|------|--------|---------|
| `lib/motion.ts` | **CREATE** | Physics spring configs, hover/tap scales, stagger delays |
| `components/ui/ProgressBar.tsx` | **CREATE** | Animated progress bar with variants |
| `components/PageTransition.tsx` | MODIFY | Use `Springs.page` |
| `components/DesktopNav.tsx` | MODIFY | Add scale/tap micro-interactions |
| `components/SearchBar.tsx` | MODIFY | Enhanced focus glow, result hover, search icon animations |
| `components/HomeVerbDemo.tsx` | MODIFY | Spring slide between verb tabs |
| `components/ui/Button.tsx` | MODIFY | Add `whileHover`/`whileTap` with spring configs |
| `components/Flashcards.tsx` | MODIFY | Upgrade spring configs, add tilt effect |
| `components/WordOfTheDay.tsx` | MODIFY | Use `Springs.heavy`, enhance star animation |
| `components/CategoryGrid.tsx` | MODIFY | Use `Springs.default` + `Stagger.slow` |

### Phase 3 Files

| File | Action | Changes |
|------|--------|---------|
| `components/ui/EnergyBadge.tsx` | **CREATE** | Energy level badge component |
| `components/learn/MicroStepCarousel.tsx` | **CREATE** | Task Shredder step-by-step carousel |
| `components/learn/SubstitutionDrill.tsx` | MODIFY | Replace punitive error states with zero-penalty feedback |
| `components/Quiz.tsx` | MODIFY | Replace red error states, add hint-before-reveal |
| `components/learn/AppliedFluency.tsx` | MODIFY | Energy badge instead of difficulty label |
| `app/learn/page.tsx` | MODIFY | Energy-based phase labels, carousel wrapping |

### Phase 4 Files

| File | Action | Changes |
|------|--------|---------|
| `components/SanctuaryPrompt.tsx` | **CREATE** | Break/sanctuary prompt with breathing animation (see §6.1) |
| `app/learn/page.tsx` | MODIFY | Session timer, sanctuary trigger between phases |
| `app/globals.css` | MODIFY | Add breathing animation keyframes (`.sanctuary-breathe`, `.sanctuary-pulse`) |

---

## Appendix A: CSS Keyframes for Sanctuary Breathing

```css
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); }
  100% { box-shadow: 0 0 0 20px rgba(52, 211, 153, 0); }
}

.sanctuary-breathe {
  animation: breathe 6s ease-in-out infinite;
}

.sanctuary-pulse {
  animation: pulse-ring 3s ease-out infinite;
}

/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  .sanctuary-breathe,
  .sanctuary-pulse {
    animation: none;
  }
}
```

## Appendix B: Implementation Order Recommendation

```
Phase 1 (Complete):
  The motion preferences system (MotionToggle, useMotionPreferences, AdaptiveMotion) was implemented and then removed — it had no visible effect since Framer Motion uses its own timing.
  Remaining: energy colors, spacing tokens, whitespace pass.

Phase 2 (Week 1-2):
  Day 1: Create lib/motion.ts + ProgressBar
  Day 2: Upgrade PageTransition, DesktopNav, Button
  Day 3: Upgrade SearchBar, HomeVerbDemo
  Day 4: Upgrade Flashcards, WordOfTheDay, CategoryGrid
  Day 5: Test spring feel across components

Phase 3 (Week 2):
  Day 1: Create EnergyBadge + MicroStepCarousel
  Day 2: Zero-penalty SubstitutionDrill
  Day 3: Zero-penalty Quiz
  Day 4: Energy language in AppliedFluency + LearnPage
  Day 5: Test zero-penalty flow end-to-end

Phase 4 (Week 3):
  Day 1-2: SanctuaryPrompt + session timer
  Day 3: Update legacy CSS utilities (card-resting, responsive-bloom)
  Day 4: Accessibility audit + polish

Phase 5 — Future (post-GAMIFICATION_PLAN completion):
  • BiomeMap navigation (requires category data mapping)
  • DualView Profile (requires auth + XP data)
  • Multi-modal input exploration (speech-to-text for Bikol pronunciation)
```

## Appendix C: Testing Checklist

- [ ] Zero-penalty feedback never shows red/rose colors
- [ ] Energy badges render correctly for all 3 levels
- [ ] MicroStepCarousel keyboard navigation works
- [ ] Sanctuary prompt triggers after ~20 min of activity
- [ ] All components pass TypeScript typecheck
- [ ] No layout shift on animation (CLS = 0)
- [ ] Contrast ratios meet WCAG AA (4.5:1)
- [ ] `prefers-reduced-motion` respected at OS level

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-06-02 | 1.0.0 | Initial design improvement plan based on Landasan analysis |
