---
name: BIKOL Dictionary
description: The Mayon Field Archive — A scholarly lexicon and functional fluency platform for the Bikol language.
colors:
  volcanic-ochre: "#A86420"
  deep-bronze: "#864E16"
  lamplight-gold: "#DDA04B"
  mayon-terracotta: "#9B4728"
  ember-terracotta: "#D47A55"
  abaca-parchment: "#FAF7F2"
  pressed-linen: "#F2ECE1"
  archival-vellum: "#FFFDF9"
  stone-ledger: "#E6DFD1"
  basalt-ink: "#1A1815"
  charcoal-umber: "#3D3933"
  weathered-ash: "#69635A"
  ledger-hairline: "#DCD4C6"
  section-rule: "#CCC2B2"
  volcanic-obsidian: "#0E0D0B"
  nocturne-basalt: "#161411"
  lamplight-study: "#1F1C17"
  warm-ivory: "#F5F1E8"
typography:
  display:
    fontFamily: "var(--font-playfair), 'Cormorant Garamond', Georgia, serif"
    fontSize: "4.5rem"
    fontWeight: 900
    lineHeight: 0.94
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "var(--font-playfair), 'Cormorant Garamond', Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "var(--font-playfair), 'Cormorant Garamond', Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "var(--font-dm-sans), 'Inter', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "var(--font-dm-sans), 'Inter', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
  caption:
    fontFamily: "var(--font-dm-sans), 'Inter', system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
  micro:
    fontFamily: "var(--font-dm-sans), 'Inter', system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.16em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.volcanic-ochre}"
    textColor: "{colors.archival-vellum}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.deep-bronze}"
  button-secondary:
    backgroundColor: "{colors.pressed-linen}"
    textColor: "{colors.basalt-ink}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card-specimen:
    backgroundColor: "{colors.archival-vellum}"
    textColor: "{colors.basalt-ink}"
    rounded: "{rounded.xl}"
    padding: "32px"
---

# Design System: BIKOL Dictionary

## Overview

**Creative North Star: "The Mayon Field Archive"**

BIKOL Dictionary is designed as a living cultural and linguistic specimen archive where a 1970s Austronesian field linguist's ledger meets the nocturnal volcanic glow of Mount Mayon. In Light Mode, surfaces evoke warm abaca fiber, pressed linen, and crisp basalt ink; in Dark Mode, the interface settles into volcanic obsidian illuminated by lamplight gold and ember terracotta.

The system explicitly rejects generic SaaS tropes—no electric blue (`#3b82f6`) or neon purple (`#9333ea`) gradients, no glowing conic-gradient cursor toys, no robotic system-monospace costumes on natural Bikol sentences, and no kicker eyebrows above headings. Headings carry their own authority through high-contrast editorial serif proportions (`Playfair Display`), while interactive tools (`SearchBar`, `VerbConjugator`, and Mintz Drills) operate with tactile, distraction-free clarity.

**Key Characteristics:**
- **Dual-Atmosphere Continuity**: The nocturnal Mount Mayon hero (`#07090E` with ember radials) transitions seamlessly into either Warm Abaca Parchment (`#FAF7F2`) in Light Mode or Volcanic Obsidian (`#0E0D0B`) in Dark Mode.
- **Lamplight Ochre & Terracotta Accents**: One unified accent family across every component—Volcanic Ochre (`#A86420` light / `#DDA04B` dark) paired with Mayon Terracotta (`#9B4728` light / `#D47A55` dark) for secondary grammatical and regional emphasis.
- **Editorial Specimen Framing**: Dictionary entries, featured words, and conjugation tables are framed like curated lexicon specimens with hairline ledger rules (`1px solid var(--editorial-border)`), serif headwords, and plain-English linguistic scaffolding.

## Colors

The palette draws directly from the geography and material culture of the Bicol Region: abaca parchment, basalt stone, volcanic ochre, and Mount Mayon's terracotta embers.

### Primary
- **Volcanic Ochre** (`#A86420` in light mode / **Lamplight Gold** `#DDA04B` in dark mode): The single authoritative primary accent used for active navigation states, primary action buttons, headword links, focus rings, and selected linguistic tabs. Engineered for ≥4.5:1 contrast against both parchment and obsidian surfaces.
- **Deep Bronze** (`#864E16`): Hover and pressed state for primary ochre controls in light mode (**Burnished Amber** `#C48735` in dark mode).

### Secondary
- **Mayon Terracotta** (`#9B4728` in light mode / **Ember Terracotta** `#D47A55` in dark mode): Used for Referential Focus (`-AN`) grammar indicators, regional dialect badges, and warm alert states.

### Neutral
- **Abaca Parchment** (`#FAF7F2`): Root page canvas in light mode (`--editorial-bg`).
- **Pressed Linen** (`#F2ECE1`): Standard card, filter bar, and secondary control surface in light mode (`--editorial-surface`).
- **Archival Vellum** (`#FFFDF9`): Elevated specimen cards, active inputs, and search dropdowns (`--editorial-surface-raised`).
- **Stone Ledger** (`#E6DFD1`): Recessed wells, progress bar tracks, and inactive badge backgrounds (`--editorial-surface-sunken`).
- **Basalt Ink** (`#1A1815`): Primary typography in light mode (`--editorial-text`).
- **Charcoal Umber** (`#3D3933`): Secondary prose and definition body copy (`--editorial-text-secondary`).
- **Weathered Ash** (`#69635A`): Muted metadata, phonetic transcriptions, and labels (`--editorial-muted`, ≥4.8:1 contrast on parchment).
- **Ledger Hairline** (`#DCD4C6`) & **Section Rule** (`#CCC2B2`): Crisp 1px structural borders and horizontal dividers.
- **Volcanic Obsidian** (`#0E0D0B`), **Nocturne Basalt** (`#161411`), **Lamplight Study** (`#1F1C17`), & **Warm Ivory** (`#F5F1E8`): Dark-mode counterparts preserving warm mineral undertones.

### Named Rules
**The One Palette Rule.** Legacy SaaS blue (`#3b82f6`) and dusty plum (`#7C5C92`) are retired across the entire repository. Every interactive accent, focus ring, loading spinner, and highlight mark uses `--editorial-accent` (Volcanic Ochre / Lamplight Gold) or `--editorial-rust` (Mayon Terracotta).

**The Contrast Integrity Rule.** Every text token—including revealed drill answers, phonetic slashes, and input placeholders—must use theme-aware `--editorial-*` variables so Light Mode and Dark Mode both maintain ≥4.5:1 WCAG AA contrast.

## Typography

**Display Font:** `Playfair Display` (with `Cormorant Garamond, Georgia, serif` fallback) — weights `400` (regular & italic), `700` (bold), `900` (black).
**Body Font:** `DM Sans` (with `Inter, system-ui, sans-serif` fallback) — weights `400`, `500`, `600`, `700`.

**Character:** High-contrast literary serif headlines give Bikol headwords the gravitas of a printed lexicon, while geometric-humanist `DM Sans` keeps definitions, grammar tables, and controls effortless to scan.

### Hierarchy
- **Display** (`900`, `clamp(2.75rem, 6vw, 5.5rem)`, `0.94` line-height, `-0.03em` tracking): Reserved for the Hero title and dictionary headword (`<h1>`) on `/word/[bikol]`.
- **Headline** (`700`–`900`, `clamp(1.875rem, 3.5vw, 2.75rem)`, `1.15` line-height, `-0.02em` tracking): Section and page headings (`Word of the Day`, `Verb Conjugator`, `Mintz Drills`).
- **Title** (`700`, `1.25rem`–`1.5rem`, `1.25` line-height): Card headwords and drill prompts.
- **Body** (`400`–`500`, `1rem`–`1.125rem`, `1.65` line-height, `65ch` max measure): Definitions, explanations, and example translations.
- **Label** (`700`, `0.75rem`, `0.14em` uppercase tracking): Part-of-speech badges, tense column headers, and metadata tags.

### Named Rules
**The No-Kicker Rule.** Never place decorative uppercase eyebrows or section-number labels above `<h1>` or `<h2>` headings. Let the heading speak for itself; use `.rule-divider` with its 3rem ochre lead-in to separate major sections.

**The Natural Language Rule.** Bikol words, conjugated verb forms, and example sentences are human language, not source code. Render Bikol sentences and conjugated verbs in `var(--font-display)` italic or `var(--font-body)`—never in `font-mono`. Reserve `tabular-nums` for counts, pagination, and indices.

## Layout

- **Container Max Widths**: `72rem` (`max-w-6xl`) for primary archive and browse grids; `56rem` (`max-w-4xl`) for word specimen pages and learning modules; `42rem` (`max-w-2xl`) for focused drills and search consoles.
- **Vertical Rhythm**: Major homepage sections use `5rem` (`py-20`) vertical padding separated by `.rule-divider` hairlines.
- **Single Focus on Learning Views**: On `/learn`, the 3-phase curriculum stepper sits compactly *above* the active drill so learners can switch phases or see where they are without scrolling past competing cards.

## Elevation & Depth

Depth is achieved primarily through **tonal surface layering** (`--editorial-surface-sunken` → `--editorial-bg` → `--editorial-surface` → `--editorial-surface-raised`) paired with 1px hairline borders (`--editorial-border`) and soft, warm ambient shadows (`--editorial-shadow`).

### Shadow Vocabulary
- **Editorial Resting Shadow** (`box-shadow: 0 4px 24px -4px rgba(26, 24, 21, 0.07)` in light / `0 8px 32px -4px rgba(0, 0, 0, 0.45)` in dark): Used on raised specimen cards (`.surface-raised`) and search dropdowns.
- **Elevated Hover Shadow** (`box-shadow: 0 16px 32px -8px rgba(168, 100, 32, 0.14)`): Subtle warm lift on interactive word and category cards.

### Named Rules
**The No-Neon-Halo Rule.** Zero-offset colored neon glows (`BorderGlow`, electric blue box-shadows, WebGL lightning shaders) are banned. Depth comes from paper-and-stone layering and warm directional shadows.

## Shapes

- **Specimen Cards & Modals**: Generous archival curves (`16px` / `1rem` for standard cards, `24px` / `1.5rem` for featured specimen containers).
- **Interactive Controls & Inputs**: Tactile `12px` (`rounded-xl`) corners with a minimum `44×44px` hit target on all buttons, alphabet filter tiles, and icon actions.
- **Badges & Chips**: Full pill geometry (`rounded-full`) with `1px` subtle borders.

## Components

### Buttons
- **Shape:** Rounded rectangle (`12px` radius, `min-h-11` / `44px` touch target).
- **Primary:** Volcanic Ochre background (`var(--editorial-accent)`), crisp white/ivory label (`#FFFDF9`), warm subtle shadow, smooth hover transition to Deep Bronze (`var(--editorial-accent-dim)`).
- **Secondary / Outline:** Pressed Linen surface (`var(--editorial-surface)`) with `1px solid var(--editorial-border)` and Basalt Ink text (`var(--editorial-text)`).
- **Hover / Focus:** Pure CSS `:hover` and `:focus-visible` states (`2px` ring in `var(--editorial-accent)` with `2px` offset)—never mutate inline DOM styles in `onMouseEnter`/`onMouseLeave`.

### Chips & Filter Pills
- **Style:** Pill radius (`9999px`), `1px solid var(--editorial-border)`, background `var(--editorial-surface-raised)`.
- **State:** Selected state uses `var(--editorial-accent)` background with `#FFFDF9` text; starter chips on the Hero pair the Bikol word in bold with its English gloss in warm amber.

### Specimen Cards (`WordOfTheDay`, `WordCard`, Word Entry)
- **Corner Style:** `16px` (`WordCard`) to `24px` (`WordOfTheDay` featured specimen).
- **Background:** `var(--editorial-surface-raised)` with a subtle top-right warm radial wash (`var(--editorial-accent-glow)`) and a `1px solid var(--editorial-border)` frame.
- **Content Structure:** Part-of-speech + dialect badge, Playfair Display headword, phonetic transcription (`/ ... /`), English and Tagalog definitions, and italic example sentence.

### Inputs & Search Combobox
- **Style:** `12px`–`16px` radius, `var(--editorial-surface-raised)` background, `1px solid var(--editorial-border)`.
- **Focus:** `border-color: var(--editorial-accent)` with a soft `0 0 0 3px var(--editorial-accent-glow)` ring and `/` keyboard shortcut badge to focus from anywhere.

### Navigation
- **Header:** Sticky `.header-glass` bar with non-heading brand mark (`BIKOL`), clear top-level links (`Home`, `Dictionary`, `Drills`, `Flashcards`, `Contribute`), accessible `LanguageToggle` (`EN` / `TL` / `ALL` with `aria-pressed` and `role="status"` live feedback), and `ThemeToggle`.

## Do's and Don'ts

### Do:
- **Do** use `var(--editorial-accent)` (`#A86420` light / `#DDA04B` dark) and `var(--editorial-rust)` (`#9B4728` light / `#D47A55` dark) for all interactive highlights, badges, and focus rings.
- **Do** include plain-English translations and word glosses alongside Bikol sentences in drills (`SubstitutionDrill`, `TransformationChallenge`) and verb demos (`HomeVerbDemo`, `VerbConjugator`).
- **Do** ensure every page has exactly one semantic `<h1>` naming that view's primary subject.
- **Do** persist learner onboarding choices (`bikoldict-learner-profile`) and real drill completions in `localStorage`.

### Don't:
- **Don't** use legacy Tailwind blue (`bg-blue-*`, `text-blue-*`, `ring-blue-*`), purple (`#7C5C92`, `purple-*`), or neon `BorderGlow` / `Lightning` shaders anywhere in the UI.
- **Don't** place uppercase kicker/eyebrow labels (`.section-number`) above `<h1>` or `<h2>` headings.
- **Don't** hardcode dark-only Tailwind text utilities (`text-zinc-100`, `placeholder:text-zinc-700`) on theme-switching surfaces.
- **Don't** hide the root document scrollbar (`scrollbar-width: none`) or trigger unprompted full-screen install modals on page load.
