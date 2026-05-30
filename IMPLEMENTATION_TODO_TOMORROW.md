# Implementation TODOs — Tomorrow's Work

These items were identified during the improvement pass but require **30+ minutes each** to implement. They should be tackled next session.

---

## 1. 🟡 [MEDIUM] Query `roots` table in learn API route

**Estimate:** ~30 min

**Problem:** `app/api/learn/route.ts` only queries the legacy `words` table for flashcards and quiz data, missing entries from the normalized `roots` table.

**Files to edit:**
- `app/api/learn/route.ts` — main API handler
- `app/api/drills/route.ts` — drills API (may have same issue)
- `lib/types/learn.ts` — may need type updates

**Approach:**
```ts
// Replace raw prisma.word.findMany() with a union approach
const roots = await prisma.root.findMany({ ... });
const words = await prisma.word.findMany({ ... });
const combined = [...roots, ...words];
// Deduplicate by bikol
```

**Validation:** Run `bun test` and verify the learn page loads words from both tables.

---

## 2. 🟢 [LOW] Add rate limiting to submit API

**Estimate:** 1–2 hours

**Problem:** `app/api/submit/route.ts` has no rate limiting — anyone can spam submissions.

**Approach options:**
- **Option A (recommended):** Use Upstash Ratelimit (serverless-friendly, Redis-based) — already using Upstash for Context7
- **Option B:** Simple in-memory Map with IP-based tracking + TTL (simpler, but resets on server restart)
- **Option C:** Use Supabase's Row Level Security if migrating auth

**Files to edit:**
- `app/api/submit/route.ts`
- `package.json` (if using Upstash: `npm install @upstash/ratelimit @upstash/redis`)

**Validation:** Send 10 rapid requests to `/api/submit` — only first 5 should succeed, remaining should get 429.

---

## 3. 🟢 [LOW] Implement search history with `lib/offline.ts`

**Estimate:** 2–3 hours

**Problem:** The `lib/offline.ts` module has IndexedDB storage functions (`saveToSearchHistory`, `getSearchHistory`) but they're never consumed in the app. The `DiscoveryDashboard` component shows "Your recent searches will appear here" with empty state.

**Approach:**
1. Integrate `saveToSearchHistory()` into `SearchBar` component — call it after each search
2. Update `DiscoveryDashboard` to read from `getSearchHistory()` and display recent searches
3. Add "Clear history" button
4. Limit to last 20 searches

**Files to edit:**
- `components/SearchBar.tsx` — add history saving
- `components/DiscoveryDashboard.tsx` — read and display history
- `lib/offline.ts` — review and extend if needed

**Validation:** Search a few words, reload the app, verify they appear in "Recent searches" on the homepage.

---

## 4. 🟢 [LOW] Add `knip` to CI for dead code detection

**Estimate:** ~30 min

**Problem:** `knip` is already in `devDependencies` (`^6.14.2`) but isn't configured or run in CI.

**Approach:**
1. Create a `knip.json` config file (or use defaults — knip works zero-config)
2. Run `npx knip` to find current dead exports
3. Clean up found issues or add to `ignore` list
4. Add a `knip` script to `package.json`: `"knip": "knip"`
5. Add a `knip` step to `.github/workflows/nextjs-ci.yml`

**Files to edit/create:**
- `knip.json` (new)
- `package.json` (add script)
- `.github/workflows/nextjs-ci.yml` (add step)

**Validation:** `npx knip` exits with code 0 after cleanup.

---

## Implementation Order (Recommended)

1. Query roots in learn API (most impactful for users)
2. Add knip to CI (quickest to set up, helps find more dead code)
3. Rate limiting on submit API (security improvement)
4. Search history with IndexedDB (nice-to-have UX improvement)
