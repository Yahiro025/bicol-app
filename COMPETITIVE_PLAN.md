# Competitive Plan: Beating bikoldictionary.com

> Created: May 27, 2026
> Updated: After Mintz PDF analysis

---

## 🆕 NEW: Suggestions from Mintz PDF Linguistic Analysis

The Mintz "BIKOL DICTIONARY" PDF (810 pages, University of Hawai'i Press) is the academic gold standard. It contains deep linguistic content we can leverage to build an unmatched moat.

### 10. 🔤 Advanced Affix & Series Conjugation — Expand VerbConjugator
Our `lib/conjugator.ts` currently handles MAG, ON, I, AN focuses. Mintz details many more:

- **Causative Series (PA-)** — "to cause someone to do X"
- **Social/Request Series (MAKI- / PAKI-)** — polite requests
- **Unintentional/Ability Series (MAKA- / NAKA-)** — accidental actions, ability
- **Becoming (MAG-ÍN)** — state change verbs
- **Intent/Effort (HING- series)**
- **Combined Affix Forms**

**Action:** Extend the conjugator to generate all series. Show them in the VerbConjugator component with labels and example sentences.

### 11. 🔄 English-to-Bikol Reverse Search
The Mintz PDF is literally half Bikol→English and half English→Bikol. Our app only does Bikol→English lookups.

**Action:** Add an English→Bikol reverse search endpoint and toggle in SearchBar. Allow users to switch direction.

### 12. 🗣️ Syllable Stress Markers
Mintz devotes entire sections to stress (Verbal vs. Non-Verbal). Stress placement changes meaning in Bikol (e.g., `báka` = "cow" vs. `baká` = "maybe").

**Action:** Add a stress field to the word data model. Display stressed syllables visually (bold, underline, or accent marks) on word cards and entry pages.

### 13. 📜 Etymology & Loanword Tags
Mintz has explicit policies for Spanish and English loanword orthography. Many Bikol words come from Spanish (e.g., `bintana` from `ventana`, `kabayo` from `caballo`).

**Action:** Add etymology tags to word entries. Flag Spanish/English origins. Show the original word and orthographic shift (e.g., why "c" → "k", "v" → "b").

### 14. 🔢 Pluralization Engine
Mintz covers pluralization rules for nouns, verbs, AND adjectives. Not just `mga` — Bikol uses reduplication and specific affixes.

**Action:** Build a `pluralize.ts` utility (mirroring `conjugator.ts`). Generate and display plurals on word pages.

### 15. 📚 Culturally Accurate Alphabetization (NG as a Letter)
Mintz alphabetizes "NG" as its own letter section. This is standard Philippine linguistic practice.

**Action:** Adjust database sorting and browse A-Z to treat `Ng` as a distinct letter between N and O.

### 16. 📖 Alphabet & Orthography Reference Page
Mintz has hundreds of pages on the Bikol alphabet, orthographic representation, sound system, etc.

**Action:** Create a `/reference` or `/learn/alphabet` page with:
- The Bikol alphabet
- Spanish/English loanword orthography rules
- Consonant and vowel charts
- Diphthong guide
- Stress rules (verbal vs non-verbal)

### 17. 🔊 Sound & Pronunciation Guide
Mintz has detailed phonetics: consonant charts, vowel distribution, diphthongs.

**Action:** Add a phonetics reference with:
- IPA transcriptions for each sound
- Audio recordings for each phoneme
- Visual mouth/tongue position diagrams

### 18. 📘 Dictionary Usage Guide + Attribution
Mintz has a "USE OF THE DICTIONARY" section explaining entry structure. We should credit the source material properly.

**Action:**
- Add a "How to Use This Dictionary" page
- Add proper attribution to Malcolm W. Mintz and University of Hawai'i Press
- Note the Creative Commons license (CC BY-NC-SA 4.0)

---

## ✅ Completed (This Session)

### 1. SEO & Content Marketing
- [x] Sitemap.xml generation
- [x] JSON-LD structured data on word pages
- [x] Open Graph + Twitter Card meta tags
- [x] Dynamic page titles and meta descriptions

### 2. Landing Page Improvements
- [x] "Start Learning" CTA above the fold
- [x] Social proof stats ("X words", "X learners")
- [x] Interactive verb conjugator demo on homepage

### 3. Mobile Push
- [x] Android app download banner
- [x] Custom PWA install prompt UI

---

## 📋 Remaining Recommendations (Not Yet Implemented)

### 4. 🎓 Expand Learning Content — Our Biggest Moat
The competitor has ZERO learning features. Double down:

- **Add more drill types:**
  - Listening comprehension (play audio, type the word)
  - Spelling challenges (hear the word, spell it)
  - Word-to-picture matching for concrete nouns
  - Multiple choice quiz component (Quiz.tsx already referenced)

- **Add progress tracking with local storage:**
  - XP points for completing drills
  - Daily streaks
  - Achievement levels (Beginner → Intermediate → Advanced)
  - Track words mastered vs. words in review

- **Add a "Daily Challenge":**
  - One new drill every day
  - Streak counter to encourage daily engagement
  - Push notification reminders (via PWA)

- **Add grammar reference pages:**
  - Inline grammar explanations linked from word entries
  - Dedicated `/grammar` page with focus system explanation
  - Affix pairing cheat sheets

### 5. 🔗 Community & Network Effects
- Add social sharing buttons on word pages ("I just learned 'bakal' on Bikol Dictionary!")
- Allow users to create and share custom flashcard decks
- Add a leaderboard for daily/weekly learners
- User profiles with learning history

### 6. ⚡ Performance — Be Noticeably Faster
- Verify Core Web Vitals (LCP, FID, CLS)
- Preload common word pages for instant navigation
- Image optimization for any visual assets
- Consider partial prerendering (PPR) for static content

### 7. 🎨 Content Completeness — The Data Moat
- Continue the data audit (POST_AUDIT_PLAN.md) to ensure accuracy
- Add audio pronunciations for top 500 most common words
- Fill in missing Tagalog translations
- Add images for concrete nouns (animals, food, objects) — visual dictionary
- Expand example sentences across all entries

### 8. 📊 Analytics & Growth
- Add analytics to track popular searches
- Identify most-looked-up words to prioritize improvements
- Track learning feature engagement
- A/B test landing page variants

### 9. 🌐 Language & Accessibility
- Add Filipino/Tagalog UI translations
- WCAG AA compliance audit
- Keyboard navigation improvements
- Screen reader testing

---

## 📊 Priority Matrix

| Priority | Feature | Effort | Impact |
|---|---|---|---|
| 🔥 P0 | Advanced Affix Conjugation (#10) | High | Very High |
| 🔥 P0 | English-to-Bikol Search (#11) | Medium | Very High |
| 🔥 P0 | Syllable Stress Markers (#12) | Medium | High |
| ⭐ P1 | Pluralization Engine (#14) | Medium | High |
| ⭐ P1 | Authentic Alphabetization (#15) | Low | Medium |
| ⭐ P1 | Grammar Reference Pages (#4) | High | High |
| ⭐ P1 | More Drill Types (#4) | High | Very High |
| 📋 P2 | Etymology Tags (#13) | Low | Medium |
| 📋 P2 | Alphabet Reference Page (#16) | Medium | Medium |
| 📋 P2 | Sound/Pronunciation Guide (#17) | High | Medium |
| 📋 P2 | Attribution & Usage Guide (#18) | Low | Low |
| 📋 P2 | Progress Tracking (#4) | High | High |
| 📋 P3 | Community Features (#5) | Very High | High |
| 📋 P3 | Analytics (#8) | Medium | Medium |
| 📋 P3 | Accessibility (#9) | Medium | Medium |
