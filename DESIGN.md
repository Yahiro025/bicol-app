---
name: Bikol Dictionary
description: A living archive for the Bikol language, bridging academic precision with community warmth.
colors:
  primary: "#3b82f6"
  primary-hover: "#2563eb"
  secondary: "#a855f7"
  secondary-hover: "#9333ea"
  accent: "#0ea5e9"
  background: "#09090b"
  surface: "#18181b"
  border: "#27272a"
  text-main: "#fafafa"
  text-muted: "#a1a1aa"
typography:
  display:
    fontFamily: "Clash Display, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  "2xl": "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-main}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
  card-base:
    backgroundColor: "rgba(24, 24, 27, 0.5)"
    rounded: "{rounded.2xl}"
    padding: "20px"
---

# Design System: Bikol Dictionary

## 1. Overview

**Creative North Star: "The Living Archive"**

The Bikol Dictionary design system is a dual-natured interface that balances **Academic Authority** with **Community Warmth**. The data itself is treated with the reverence of an archive—clean, high-contrast, and precisely gridded. The "chrome" surrounding that data (buttons, search, cards) acts as the "living" element, using organic rounded corners and responsive motion to invite interaction.

This system explicitly rejects the **Sterile Machine Translation** look and the **Web 1.0 Text Wall**. It is modern, spacious, and dignified.

**Key Characteristics:**
- **Resting Rigor**: Clean 1px borders and zinc-based neutrals create a structured, authoritative baseline.
- **Responsive Bloom**: Interactive elements "come alive" on hover with shadows and lifts.
- **Deep Slate Palette**: A dark zinc foundation ensures high-contrast readability for definitions.

## 2. Colors

The palette is anchored in deep neutrals to provide an "academic" stage for vibrant cultural accents.

### Primary
- **Bicolano Sea Blue** (#3b82f6): Used for primary actions, the main word headings, and active state indicators. It represents the depth and vitality of the Bikol language.

### Secondary
- **Community Purple** (#a855f7): Used for learning modules, contribution CTA's, and decorative accents that signify human presence and growth.

### Neutral
- **Deep Zinc** (#09090b): The foundation background.
- **Surface Zinc** (#18181b): Used for cards and secondary panels to create subtle depth without relying on shadows.
- **Text Zinc-100** (#fafafa): High-contrast primary text for definitions.
- **Text Zinc-400** (#a1a1aa): Muted text for etymology and metadata, ensuring WCAG AA legibility.

### Named Rules
**The Resting Precision Rule.** Surfaces at rest must use 1px borders (#27272a) and background shifts for separation. Shadows are prohibited in resting states.

## 3. Typography

**Display Font:** Clash Display (with system-ui fallback)
**Body Font:** Inter (with system-ui fallback)

**Character:** The pairing of a geometric, bold display face with a clean, highly-legible sans-serif reflects the hybrid "Academic + Community" personality.

### Hierarchy
- **Display** (Bold, 3.5rem, 1.1): Used for the main word lemma on entry pages. High impact.
- **Headline** (Bold, 1.25rem, 1.4): Used for word titles in search results and card headings.
- **Body** (Regular, 1rem, 1.6): Used for primary definitions. Max line length: 70ch.
- **Label** (Bold, 0.625rem, uppercase): Used for parts of speech (POS) and technical metadata.

### Named Rules
**The Semantic Contrast Rule.** Dictionary entries must use clear weight contrast between the Word (Bold) and the Definition (Regular) to ensure quick scanning.

## 4. Elevation

Elevation is used strictly as a **response to state**, never as a static decoration.

### Shadow Vocabulary
- **Responsive Bloom** (0 20px 25px -5px rgba(59, 130, 246, 0.1)): A subtle blue-tinted shadow that appears only on card hover.
- **Surface Lift**: A -4px Y-axis translation combined with a shadow to signify an element is "active" or "ready."

### Named Rules
**The Flat-at-Rest Rule.** All cards and buttons must appear flat against the background until the user interacts with them. This preserves the academic, structured feel of the archive.

## 5. Components

### Buttons
- **Shape:** Soft Rounded (16px / xl)
- **Primary:** Bicolano Sea Blue background with white text.
- **Hover:** Bouncy lift (-2px) and a deeper blue tint.
- **Micro-interaction:** Spring-based scale down (0.98) on click.

### Word Cards
- **Corner Style:** Extra Large (24px / 2xl)
- **Background:** Glass-effect (Zinc-900 at 50% opacity + backdrop blur).
- **Border:** 1px Zinc-800.
- **Hover State:** Border shifts to primary blue (30% opacity), shadow-xl blooms, and the card lifts -4px.

### Search Bar
- **Style:** Fully rounded (full) with a subtle zinc border.
- **Focus State:** 2px Blue-500 ring with an offset, signifying the tool is ready for input.

## 6. Do's and Don'ts

### Do:
- **Do** use semantic `<dl>`, `<dt>`, and `<dd>` tags for all dictionary entries.
- **Do** ensure a minimum 44x44px touch target for all filter pills and A-Z buttons.
- **Do** disable all complex motion for users who `prefer-reduced-motion`, falling back to simple fades.

### Don't:
- **Don't** use "Web 1.0" blocks of text; use vertical spacing and card containers to break up definitions.
- **Don't** use bright, clashing colors that feel "elementary school" or overly gamified.
- **Don't** use static drop shadows on cards at rest; keep the archive clean and structured.
