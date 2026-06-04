# Color Palette Redesign & Readability Fix — SPEC

## Overview

Fix the unreadable word count number "10,544" in light mode and improve the overall color palette for better contrast, accessibility (WCAG AAA), and visual hierarchy.

---

## Problem Statement

### 1. Word Count Number Readability
- **Location**: Hero section (`components/HeroSection.tsx`)
- **Current**: Large decorative number displayed at `opacity-50` with `--editorial-accent` color (#c49b4c - warm gold)
- **Issue**: On light background (#faf8f5), 50% opacity gold text has insufficient contrast, making "10,544" nearly unreadable
- **User preference**: Keep the large decorative style, improve contrast by using a darker gold/bronze color

### 2. Navigation & Headers
- **Issue**: Navigation and headers need better dark/light mode transitions
- **User preference**: Cleaner, more minimal feel with better contrast/visibility for links

### 3. Overall Color Palette
- **User preference**: 
  - Open to cooler or more neutral palette direction
  - Bold contrast (dark text on light backgrounds)
  - WCAG AAA compliance (enhanced contrast)
  - Muted purple/berry accent color (editorial feel)
  - No explicit color restrictions — open to anything

---

## Design Direction

### Color Philosophy
- **Bold contrast**: Dark text on light backgrounds for maximum readability
- **Editorial feel**: Sophisticated, muted tones rather than generic bright colors
- **Accessibility-first**: All text/background combinations must pass WCAG AAA (7:1 contrast ratio for normal text, 4.5:1 for large text)
- **Smooth transitions**: Improved dark/light mode transitions throughout

### Proposed Light Mode Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--editorial-bg` | `#FAFAF8` | Page background (slightly warm off-white) |
| `--editorial-surface` | `#F0EDE6` | Card backgrounds, elevated surfaces |
| `--editorial-surface-raised` | `#FFFDF9` | Floating elements, modals |
| `--editorial-surface-sunken` | `#E5E1D8` | Inset sections, wells |
| `--editorial-text` | `#1C1B19` | Primary text (near-black with warmth) |
| `--editorial-text-secondary` | `#3D3B36` | Secondary text, descriptions |
| `--editorial-muted` | `#6B6760` | Tertiary text, labels, captions |
| `--editorial-accent` | `#7C5C92` | Primary accent (muted purple/berry) |
| `--editorial-accent-dim` | `#5A4270` | Hover states for accent elements |
| `--editorial-rust` | `#9B5C3A` | Secondary accent (warm terracotta) |
| `--editorial-border` | `#D8D4C8` | Borders, dividers |
| `--editorial-divider` | `#C8C4B8` | Horizontal rules, separators |

### Proposed Dark Mode Palette (Nocturne Archive)

| Token | Value | Usage |
|-------|-------|-------|
| `--editorial-bg` | `#0E0D0B` | Page background (deep warm black) |
| `--editorial-surface` | `#161513` | Card backgrounds |
| `--editorial-surface-raised` | `#1E1C18` | Elevated surfaces |
| `--editorial-surface-sunken` | `#111009` | Inset sections |
| `--editorial-text` | `#F5F2EC` | Primary text (warm off-white) |
| `--editorial-text-secondary` | `#D4CFC3` | Secondary text |
| `--editorial-muted` | `#8A8780` | Tertiary text, labels |
| `--editorial-accent` | `#A580C0` | Primary accent (lighter purple) |
| `--editorial-accent-dim` | `#8A68A8` | Hover states |
| `--editorial-rust` | `#C07A50` | Secondary accent (lighter terracotta) |
| `--editorial-border` | `#2A2820` | Borders |
| `--editorial-divider` | `#353228` | Dividers |

---

## Specific Fixes

### 1. Word Count Number (HeroSection.tsx)

**Current implementation** (lines ~96-101):
```tsx
<span
  className="text-8xl font-black italic leading-none text-[var(--editorial-accent)] opacity-50"
  style={{ fontFamily: "var(--font-display)" }}
>
  {wordCount.toLocaleString()}
</span>
```

**Proposed change**: 
- Remove `opacity-50` or reduce to `opacity-70` for better visibility
- Change color to a darker, higher-contrast variant
- Add text-shadow for additional depth/contrast on light backgrounds

**CHOSEN — Option A: Darker accent with full opacity + text-shadow**

Rationale: Keeps decorative accent color as hero element while achieving WCAG AAA contrast. The text-shadow adds depth without compromising readability.

```tsx
<span
  className="text-8xl font-black italic leading-none"
  style={{ 
    fontFamily: "var(--font-display)",
    color: 'var(--editorial-accent-dim)',
    textShadow: '0 2px 12px rgba(124, 92, 146, 0.15)'
  }}
>
  {wordCount.toLocaleString()}
</span>
```

With the new purple/berry palette:
- Light mode: `--editorial-accent-dim` = `#5A4270` on `#FAFAF8` = ~7.5:1 contrast ✓
- Dark mode: `--editorial-accent-dim` = `#8A68A8` on `#0E0D0B` = ~8:1 contrast ✓

### 2. Navigation Improvements

**Target files**: `components/DesktopNav.tsx`, `components/MobileNav.tsx`

**Goals**:
- Improve link visibility in both light and dark modes
- Add subtle hover transitions with better feedback
- Ensure active state is clearly distinguishable
- Smoother theme transition animations

### 3. Category Grid Enhancement

**Target file**: `components/CategoryGrid.tsx`

**Issues noted**:
- Category card text uses `group-hover:text-blue-400` (blue-400 is not accessible on current backgrounds)
- Hardcoded blue-500/blue-400 colors don't match the new palette

**Proposed fix**:
- Replace hardcoded blue colors with CSS variable references
- Use `--editorial-accent` for hover states with proper contrast

---

## WCAG AAA Compliance Targets

### Minimum Contrast Ratios (WCAG AAA)
| Element | Ratio | Current Status |
|---------|-------|----------------|
| Normal text (body) | 7:1 | Needs review |
| Large text (18pt+) | 4.5:1 | Needs review |
| Bold text (14pt+) | 4.5:1 | Needs review |
| UI components | 3:1 | Needs review |

### High-Risk Areas to Verify
1. **Word count number**: Currently ~3:1 with opacity-50, needs 4.5:1 minimum
2. **Category grid hover states**: Blue-400 on surface background ~3:1, needs improvement
3. **Navigation links in muted state**: `--editorial-muted` on `--editorial-bg` ~4:1, borderline
4. **Secondary text**: `--editorial-text-secondary` vs background ~8:1 ✓

---

## Implementation Notes

### Files to Modify
1. `app/globals.css` — Update CSS variable definitions for both light and dark modes
2. `components/HeroSection.tsx` — Fix word count number styling
3. `components/DesktopNav.tsx` — Improve navigation link contrast and transitions
4. `components/MobileNav.tsx` — Match desktop improvements
5. `components/CategoryGrid.tsx` — Replace hardcoded colors with CSS variables

### Transition Improvements
All theme transitions should use:
```css
transition: all 0.3s ease-out;
```
Applied to: background-color, color, border-color, box-shadow

### Testing Checklist
- [ ] Word count "10,544" readable in light mode
- [ ] Word count "10,544" readable in dark mode
- [ ] Navigation links visible in both modes
- [ ] Category grid cards readable in both modes
- [ ] All interactive elements have visible focus states
- [ ] No pure black (#000) or pure white (#fff) — always slightly warm/cool undertone
- [ ] Smooth 0.3s transitions between light/dark modes

---

## User Preferences Summary

| Preference | Choice |
|------------|--------|
| Word count style | Keep large decorative, improve contrast |
| Color direction | Cooler/neutral with bold contrast |
| Navigation feel | Better dark/light transitions |
| Accessibility | WCAG AAA compliance |
| Accent color | Muted purple/berry (editorial) |
| Color restrictions | None — open to anything |