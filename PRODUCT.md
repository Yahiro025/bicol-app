# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Heritage Learners & Diaspora Bicolanos**: Second- and third-generation Bicolanos in Manila or abroad reconnecting with family roots who need an approachable, guided starting path (`/start` and `/learn`) without intimidating academic jargon.
- **Everyday Speakers, Students & Travelers**: Learners looking up Bikol words, Tagalog/English cross-references, pronunciation, and Austronesian verb conjugations across regional varieties.
- **Language Contributors & Scholars**: Native speakers and researchers submitting regional words, usage examples, and corrections through `/contribute` and word-level edit suggestions.

## Product Purpose

BIKOL Dictionary (`An Diksiyonaryo kan Bikol`) preserves and activates the living lexicon of the Bicol Region, Philippines. Success means a visitor can look up any Bikol or English/Tagalog word in seconds, understand how Bikol verbs transform across Actor, Object, and Referential focus, and practice functional fluency through structured drills.

## Positioning

Unlike static word lists or generic flashcard apps, BIKOL Dictionary unifies published lexicography (Malcolm Mintz's Bikol Dictionary, Wiktionary, LearnBikol) with an interactive Austronesian verb focus conjugator (`MAG- / -ON / -AN / I-`) and Malcolm Mintz's 3-phase functional fluency drills (Substitution, Transformation, and Applied Fluency dialogue) across 8 documented Bikol varieties.

## Operating Context

- Used on both mobile web (quick lookup on the go, one-handed browsing, flashcard review) and desktop web (deep study, verb conjugation comparison, contributing entries).
- Supports bilingual definition modes (`EN` English, `TL` Tagalog, `ALL` combined) persisted in `localStorage` (`bikoldict-lang-mode`).
- Supports personalized learner onboarding persisted in `localStorage` (`bikoldict-learner-profile`) connecting `/start` directly to `/learn`.

## Capabilities and Constraints

- **Framework**: Next.js App Router (React 19, TypeScript, Tailwind CSS v4, Framer Motion, Prisma + PostgreSQL).
- **8 Regional Bikol Varieties**: Central Bikol (Naga), Central Bikol (Albay), Rinconada Bikol, Masbateño, Buhi-non, Northern Catanduanes, Southern Catanduanes, and Virac (plus General Bikol catch-all).
- **Core Surfaces**:
  - `/` — Archive homepage with Mount Mayon nocturnal hero, instant local+API fuzzy search, Featured Specimen (Word of the Day), interactive Verb Conjugator preview, Category directory, and Most Searched entries.
  - `/start` — Guided learner onboarding funnel capturing dialect variety, learning goal, current level, and daily pace into `bikoldict-learner-profile`.
  - `/browse` — Full searchable, filterable lexicon by initial letter, semantic category, and sort order (Alphabetical, Common/Frequency, Relevance).
  - `/word/[bikol]` — Lexicon specimen page with headword, pronunciation, audio playback, English & Tagalog definitions grouped by sense, grammar-highlighted usage sentences, interactive `VerbConjugator`, etymology, synonyms, and community edit proposals.
  - `/learn` — 3-Phase Mintz Functional Fluency curriculum (Phase 1: Substitution Drill, Phase 2: Transformation Challenge, Phase 3: Applied Fluency Dialogue with linguistic audit).
  - `/flashcards` — Tiered vocabulary recall decks (Top 25, Top 50, Top 100).
  - `/frequency-list` — Reference index of the 100 most frequent Bikol words.
  - `/contribute` — Community word submission form with Bikol diacritic & glottal-stop toolbar (`´`, `` ` ``, `ˆ`, `¨`, `ʔ`, `ŋ`).

## Brand Commitments

- **Bilingual Cultural Reverence**: Respects Bikol as a major Philippine literary and spoken language rather than a novelty; pairs scholarly precision with warmth rooted in Bicolano geography (Mount Mayon, abaca parchment, volcanic earth).
- **Honest Progress & Source Attribution**: Credits lexicographical sources (Mintz Dictionary, Wiktionary, LearnBikol.com) and reports real session state rather than fabricated gamification streaks.

## Evidence on Hand

- Hero artwork: `/public/images/mayon-hero.png` (nocturnal Mount Mayon with volcanic embers).
- Verified lexicographical corpus in PostgreSQL/Prisma with affix pairs, focus types, dialect tags, Tagalog cognates, and example sentences.

## Product Principles

1. **Immediate Lookup, Guided Mastery**: A reference visitor gets instant fuzzy search on the first screen; a new learner gets a clear bridge into `/start` and scaffolded drills on `/learn` where every Bikol sentence carries English context.
2. **Linguistic Clarity Over Academic Jargon**: Always pair Austronesian grammatical terms (`Actor Focus`, `Object Focus`, `Referential Focus`, `MAG- / -ON`) with plain-English explanations of what they do in a sentence.
3. **Zero Disposable Input**: When a learner answers onboarding questions in `/start` or completes drills in `/learn`, persist their choices and progress locally so the interface honors their work.
4. **Scholarly Calm**: Every surface behaves like a trusted field lexicon—free of unprompted install modals, neon SaaS gradients, or decorative noise.

## Accessibility & Inclusion

- WCAG AA contrast (≥4.5:1 for body and muted metadata text, ≥3:1 for large display type) across both Light Mode (Abaca Parchment) and Dark Mode (Volcanic Nocturne).
- Full keyboard operability (`/` shortcut to focus search, arrow-key combobox navigation, Escape dismissal, visible focus rings, and ≥44×44px touch targets).
- Honors `prefers-reduced-motion: reduce` across CSS and Framer Motion transitions.
- Single semantic `<h1>` per page representing the page's true subject (e.g., the Bikol headword on `/word/[bikol]`).
