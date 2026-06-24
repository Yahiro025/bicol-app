# Implementation Plan: Fix Mintz Lesson 1 Substitution Drills

## Overview
The Mintz Lesson 1 substitution drill currently returns the exact same base sentence across different sessions due to aggressive Next.js route caching. Furthermore, the cue words generated for the drill are randomly selected based only on Part of Speech, and they are naively string-replaced into the base sentence, resulting in semantically irrelevant cue words and grammatically nonsensical sentences.

## Requirements
- The API route for drills must be dynamically rendered to prevent returning the same sentence every session.
- Cue words must be semantically and grammatically appropriate for the base sentence.
- The base sentence transformation must result in a natural Bikol sentence, accommodating any necessary morphophonemic changes.

## Architecture Changes
- Modify `app/api/drills/route.ts`:
  - Add `export const dynamic = 'force-dynamic';` to prevent static caching.
  - Replace the naive random root selection and string substitution logic with the existing LLM utility `generateSubstitutionDrill` located in `lib/groq.ts`. This ensures AI-driven, grammatically correct and contextually appropriate cue words and substitutions.

## Implementation Steps

### Phase 1: Fix Caching and Cue Generation Logic (1 file)
1. **Refactor the API route to use LLM for drill generation** (File: `app/api/drills/route.ts`)
   - Action: Add `export const dynamic = 'force-dynamic';` at the top of the file to disable Next.js static route caching.
   - Action: Retain the existing logic that randomly selects a valid base sentence from the database.
   - Action: Remove the naive POS-based random root fetch (`prisma.root.findMany`) and the `String.prototype.replace` regex block.
   - Action: Call the existing `generateSubstitutionDrill(baseSentence)` from `lib/groq.ts` to retrieve 3 contextually aware substitution cues and expected answers.
   - Action: Return the `baseSentence` and the LLM-generated `cues` in the API response.
   - Why: Forcing dynamic rendering ensures a fresh sentence on every page load. Leveraging the Groq LLM ensures the cue words are semantically relevant and the resulting sentences are grammatically accurate without hardcoding complex Bikol morphological rules.
   - Dependencies: None
   - Risk: Medium — relies on Groq API availability and response format consistency.

## Testing Strategy
- Unit tests: Verify `generateSubstitutionDrill` properly parses valid JSON containing arrays of cues and expected answers.
- Integration tests: Test `GET /api/drills` across multiple requests to ensure the `baseSentence` changes (cache miss) and the returned cues are logically connected to the base sentence.

## Risks & Mitigations
- **Risk**: Groq API rate limits or failures could break the learning experience.
  - Mitigation: Use a `try/catch` block when calling `generateSubstitutionDrill`. If it fails, seamlessly fall back to a predefined set of verified drills (similar to the existing fallback in `app/learn/page.tsx`).

## Success Criteria
- [ ] Refreshing the learn page provides different base sentences.
- [ ] Cue words are semantically relevant to the base sentence.
- [ ] Expected answers represent grammatically correct Bikol sentences rather than naive string replacements inside affixed words.
