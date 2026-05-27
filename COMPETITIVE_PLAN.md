# Competitive Plan: Beating bikoldictionary.com

> Created: May 27, 2026

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
