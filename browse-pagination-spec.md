# Browse Page Pagination — Feature Specification

> **Status:** Ready for implementation  
> **Created:** 2026-06-21  
> **Scope:** Replace infinite scroll with traditional numbered pagination on `/browse`

---

## 1. Overview

The Browse page (`/browse`) currently loads dictionary words via **infinite scroll** (IntersectionObserver, 50 words per batch). This spec defines replacing that behavior entirely with **traditional numbered pagination** controls. The goal is to give users explicit navigation, bookmarkable pages, and a more predictable browsing experience.

---

## 2. Goals

1. **Replace infinite scroll** with Prev / Next pagination + page counter.
2. **Make pages bookmarkable and shareable** via `?page=N` URL query parameter.
3. **Preserve filter state across page navigation** (letter, category, search query, sort).
4. **Maintain existing UX patterns**: editorial color palette, loading overlay, result count, filter pills.
5. **Zero breaking changes** to the API contract or data layer beyond adding `page` support.

---

## 3. Current State Analysis

### 3.1 Files Involved

| File | Role |
|------|------|
| `app/browse/page.tsx` | Server Component. Fetches initial 50 words + categories + total count via ISR (`revalidate=300`). Passes data to `BrowseClient`. |
| `components/BrowseClient.tsx` | Client Component. Manages filters, search, sort, infinite scroll (IntersectionObserver), `pageRef`, `hasMore`, `isLoadingMore`. |
| `app/api/browse/route.ts` | API route. Accepts `page`, `limit`, `letter`, `category`, `q`, `sort`. Returns `{ words, total }`. |
| `lib/word-search.ts` | Data layer. `browseWords()` supports `offset` + `limit`. `countDistinctWords()` returns total. |

### 3.2 Current Behavior

- **Initial load**: Server renders first 50 words (SSR via `browseWords({ limit: 50, offset: 0 })`).
- **Infinite scroll**: Client observes a sentinel div. On intersection, fetches `/api/browse?page={pageRef}&limit=50` and appends to `words[]`.
- **Filters**: Letter grid, category buttons, search input. Changing any filter debounces 300ms then calls `fetchMoreWords(true)` to reset.
- **Sort**: alphabetical (default), frequency, relevance (only when query present).
- **URL**: Filters are synced to URL (`?letter=A&category=Noun&q=foo&sort=frequency`). No `page` param currently.

### 3.3 Existing API Contract

```ts
// GET /api/browse?page=0&limit=50&letter=A&category=Noun&q=foo&sort=frequency
// Response:
{
  words: WordSearchEntry[],
  total: number
}
```

The API already supports `page` (0-indexed) and `limit`. No API changes are required.

---

## 4. Functional Requirements

### 4.1 Pagination Model

- **Page size**: Fixed at `50` words per page (unchanged from current).
- **Page indexing**: **0-based internally** (matches current API), **1-based in the UI** (user-facing). Page 1 in the UI corresponds to `page=0` in the API.
- **Total pages**: `Math.ceil(totalWords / 50)`.
- **Current page range display**: Above the word list, update the existing result count text to show the current range:
  - Example: *"Showing 1–50 of 1,234 results"* or *"Showing 51–100 of 1,234 results"*.
  - If on the last page with a partial set: *"Showing 1,201–1,234 of 1,234 results"*.

### 4.2 Pagination Controls (Bottom Only)

A single pagination bar placed **below** the word list (replacing the infinite-scroll sentinel div). Controls:

| Control | Behavior | Disabled When |
|---------|----------|---------------|
| **« Previous** | Navigate to previous page (decrement UI page) | On page 1 |
| **Page counter text** | e.g., *"Page 3 of 25"* | Never |
| **Next »** | Navigate to next page (increment UI page) | On last page |

**Design notes:**
- Use existing editorial palette (`--editorial-accent` for active/hover, `--editorial-surface` for button background, `--editorial-border` for borders, `--editorial-muted` for disabled state).
- Buttons should have `active:scale-[0.98]` and smooth transitions (consistent with existing button styles).
- Font: `var(--font-body)`.
- Layout: centered horizontally, with gap between Previous and Next. Page counter sits between them.

### 4.3 URL Synchronization

- The URL **must** include `page=N` (1-based) whenever the user is on a page other than 1.
- Example: `/browse?page=3&letter=A&sort=frequency`
- On page 1, omit `page` from the URL (cleaner default URL).
- **Method**: Use `window.history.replaceState` (current approach) or `router.push` from `next/navigation`.
- **SSR support**: The server component (`app/browse/page.tsx`) must read `searchParams.page`, parse it, and pass it to `BrowseClient` as `initialPage`.

### 4.4 Filter Behavior

From interview: **Preserve current page when filters change** (do NOT reset to page 1).

However, with pagination this introduces an edge case:

- If the user is on page 10 and applies a filter that reduces total results to only 2 pages, the current page (10) is now out of bounds.
- **Resolution**: **Clamp to the last valid page**.
  - After fetching a new page, if `offset >= total`, recalculate `maxPage = Math.ceil(total / 50)` and navigate to that page.
  - Update the URL accordingly.
  - Show the results for the clamped page.

### 4.5 Loading State

- **Keep the existing full-screen overlay spinner** (`isPending` + `AnimatePresence` overlay).
- When the user clicks Prev/Next, set `isPending = true` via `startTransition`.
- Overlay covers the word list area with the existing *"Filtering Archive..."* animation.
- Buttons should be disabled while `isPending` to prevent double-clicks.

### 4.6 Search Query + Sort Mode

- **Search relevance sort**: If `sortMode === 'relevance'`, it requires a `q` param (existing behavior). Preserve this.
- If query is cleared while on `relevance` sort, auto-switch to `alphabetical` (existing behavior).
- Page is preserved through sort changes.

### 4.7 Empty / Edge States

| Scenario | Behavior |
|----------|----------|
| No results for current filters | Show existing empty state: *"No matches found. Try adjusting your search or filters."* Hide pagination controls. |
| Total words = 0 | Show existing empty state. Hide pagination. |
| Direct navigation to `?page=9999` (way beyond total) | Server-side: clamp to max valid page. If somehow still empty, show empty state. |
| `page` param is invalid (e.g., `page=abc`) | Treat as page 1. |

---

## 5. State Management Changes

### 5.1 State to Add / Modify in `BrowseClient`

```ts
// NEW: explicit page state (1-based for UI)
const [currentPage, setCurrentPage] = useState(initialPage);

// REMOVED: pageRef (useRef), hasMore, isLoadingMore, observerTarget
// REMOVED: IntersectionObserver logic entirely

// MODIFIED: fetchMoreWords → fetchPage(pageNumber: number, isReset = false)
```

### 5.2 State to Modify in `app/browse/page.tsx`

```ts
// Read page from searchParams
const pageParam = searchParams.page;
const initialPage = Math.max(1, parseInt(pageParam || '1', 10) || 1);

// Pass to BrowseClient
<BrowseClient
  initialPage={initialPage}
  // ...existing props
/>
```

### 5.3 Fetch Logic

Replace the append-based `fetchMoreWords` with a page-based `fetchPage`:

```ts
const fetchPage = useCallback(async (targetPage: number) => {
  // targetPage is 1-based UI page
  const apiPage = targetPage - 1; // 0-based for API
  const limit = 50;

  setIsPending(true); // or use startTransition
  try {
    const params = new URLSearchParams({
      page: apiPage.toString(),
      limit: limit.toString(),
    });
    // ...add filters

    const response = await fetch(`/api/browse?${params.toString()}`);
    const data = await response.json();

    const newWords = Array.isArray(data) ? data : data.words;
    const total = data.total ?? 0;

    // Clamp if out of bounds
    const maxPage = Math.ceil(total / limit) || 1;
    if (targetPage > maxPage && total > 0) {
      // Recursively fetch the last valid page
      return fetchPage(maxPage);
    }

    setWords(newWords);
    setTotalWords(total);
    setCurrentPage(targetPage);
  } catch (error) {
    console.error('Error fetching page:', error);
  } finally {
    setIsPending(false);
  }
}, [query, selectedLetter, selectedCategory, sortMode]);
```

### 5.4 URL Update Logic

When `currentPage`, `query`, `selectedLetter`, `selectedCategory`, or `sortMode` changes:

```ts
const params = new URLSearchParams();
if (query) params.set('q', query);
if (selectedLetter) params.set('letter', selectedLetter);
if (selectedCategory) params.set('category', selectedCategory);
if (sortMode === 'frequency') params.set('sort', 'frequency');
if (sortMode === 'relevance') params.set('sort', 'relevance');
if (currentPage > 1) params.set('page', currentPage.toString());

const newUrl = `/browse${params.toString() ? `?${params.toString()}` : ''}`;
window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
```

---

## 6. Component & File Changes

### 6.1 `app/browse/page.tsx`

**Changes:**
1. Parse `searchParams.page` into `initialPage` (default 1, clamp to >=1).
2. Pass `initialPage` to `<BrowseClient />`.
3. Use `initialPage` to calculate the SSR offset: `offset: (initialPage - 1) * 50`.

### 6.2 `components/BrowseClient.tsx`

**Changes:**
1. Add `initialPage` prop.
2. Replace `pageRef`, `hasMore`, `isLoadingMore`, `observerTarget` with `currentPage` state.
3. Remove IntersectionObserver entirely.
4. Replace `fetchMoreWords` with `fetchPage(pageNumber, isReset?)`.
5. Add `handlePrevPage` and `handleNextPage` handlers.
6. Add pagination bar JSX at the bottom (Previous / Page X of Y / Next).
7. Update result count text to show range (`Showing {start}–{end} of {total}`).
8. Keep existing filter, search, sort, loading overlay, and word card rendering logic unchanged.

**Props interface update:**

```ts
interface BrowseClientProps {
  initialWords: Word[];
  initialCategories: string[];
  totalWords: number;
  initialLetter: string;
  initialCategory: string;
  initialQuery: string;
  initialSort?: string;
  initialPage?: number; // NEW
}
```

### 6.3 `app/api/browse/route.ts`

**Changes:** None required. The API already accepts `page` and `limit` and returns `{ words, total }`.

### 6.4 `lib/word-search.ts`

**Changes:** None required. `browseWords()` already supports `offset` and `limit`.

---

## 7. Design & Styling Details

### 7.1 Pagination Bar Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [ « Previous ]        Page 3 of 25        [ Next » ]       │
└─────────────────────────────────────────────────────────────┘
```

- **Container**: centered, flex row, gap-3, py-6.
- **Buttons**: px-4 py-2, rounded-xl, text-sm font-semibold.
- **Disabled state**: opacity 50%, cursor not allowed, no hover effects.
- **Active/hover**: background becomes `--editorial-accent`, text white.
- **Counter text**: text-sm, color `--editorial-muted`, font-family `var(--font-body)`.

### 7.2 Result Count Text Update

Current:
> Found 50 results out of 1,234 total words

New (when paginated):
> Showing 1–50 of 1,234 results

New (last partial page):
> Showing 1,201–1,234 of 1,234 results

New (single page, < 50 results):
> Showing 12 of 1,234 results

New (no filters, all results):
> Showing 1–50 of 1,234 results

**Logic:**
```ts
const start = (currentPage - 1) * 50 + 1;
const end = Math.min(currentPage * 50, totalWords);
const rangeText = totalWords <= 50
  ? `Showing ${totalWords} result${totalWords !== 1 ? 's' : ''}`
  : `Showing ${start.toLocaleString()}–${end.toLocaleString()} of ${totalWords.toLocaleString()} result${totalWords !== 1 ? 's' : ''}`;
```

---

## 8. Accessibility

- Pagination buttons must be `<button>` elements (not divs).
- Disabled state must have `aria-disabled="true"` and `disabled` attribute.
- Add `aria-label` to Prev/Next buttons:
  - `"Go to previous page"`
  - `"Go to next page"`
- The page counter should be a `<span>` with `aria-live="polite"` so screen readers announce page changes.
- Maintain existing focus-visible ring styles (`focus-visible:ring-2 focus-visible:ring-[var(--editorial-accent)]`).

---

## 9. Performance Considerations

- **SSR still fetches initial page server-side** — no regression in first paint.
- **Client-side page changes** fetch only 50 words (same payload as current infinite scroll batches).
- **Existing React `cache()`** in `browseWords` still deduplicates within SSR renders.
- **Existing in-memory cache** in `lib/word-search.ts` still caches browse results for 30 seconds.
- **No additional dependencies** required.

---

## 10. Testing Checklist

- [ ] Page 1 loads correctly via SSR (no `?page` in URL).
- [ ] Clicking Next increments page, updates URL to `?page=2`, fetches next 50 words.
- [ ] Clicking Previous decrements page, updates URL, fetches previous 50 words.
- [ ] Prev disabled on page 1; Next disabled on last page.
- [ ] Changing filters preserves page (or clamps if out of bounds).
- [ ] Direct URL `?page=5` loads correctly on SSR and client hydration.
- [ ] Invalid `?page=abc` defaults to page 1.
- [ ] `?page=9999` clamps to last valid page.
- [ ] Result count text shows correct range for all pages.
- [ ] Loading overlay appears during page transitions.
- [ ] Empty state displays when no results.
- [ ] Build passes (`bun run build` or `next build`).
- [ ] TypeScript checks pass (`tsc --noEmit` or `next lint`).

---

## 11. Open Questions / Future Enhancements

1. **Mobile simplification**: Should the pagination bar be simplified on very small screens (e.g., hide "Page X of Y" text to save space)? Current spec keeps full controls.
2. **Keyboard navigation**: Should arrow keys (← →) navigate pages when focus is on the pagination bar? Not in initial scope.
3. **Jump-to-page input**: A future enhancement could add a small input to jump directly to page N. Not in initial scope (user selected Prev/Next only).
4. **Page size toggle**: User selected fixed at 50. Future enhancement could add 25/50/100 dropdown.
5. **Animation between pages**: User selected to keep existing overlay spinner. A future enhancement could add fade/slide transitions between page content.

---

## 12. Decisions Log

| Decision | Rationale | Source |
|----------|-----------|--------|
| Replace infinite scroll entirely | User explicitly wants numbered pagination, not coexistence | Interview Round 1 |
| Preserve page on filter change | User preference | Interview Round 1 |
| Clamp to last valid page on out-of-bounds | Prevents empty state when filters reduce result set | Interview Round 3 |
| Fixed page size 50 | Matches current behavior; user did not want configurability | Interview Round 1 |
| Prev/Next only (no numbered buttons) | Simpler UX; user explicitly chose this | Interview Round 2 |
| URL `?page=N` | Bookmarkable/shareable pages; explicit user request | Interview Round 2 |
| Bottom-only placement | User preference; consistent with search-engine patterns | Interview Round 2 |
| Keep existing loading overlay | User finds it familiar and acceptable | Interview Round 3 |
| Update result count to show range | More informative with pagination; natural evolution | Interview Round 3 |

---

*End of specification.*
