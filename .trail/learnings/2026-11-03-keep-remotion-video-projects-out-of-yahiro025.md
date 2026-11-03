---
title: Keep Remotion video projects out of the Next.js type-check
author: Yahiro025
date: 2026-11-03
branch: main
cost: { minutes: 2, tokens: 124343 }
id: l-accb6859
scope: repo
status: active
src: agent
touches:
  - components/funnel/OnboardingFunnel.tsx
  - app/start/page.tsx
  - tsconfig.json
  - package.json
  - app/globals.css
  - components/HeroSection.tsx
  - app/layout.tsx
  - app/learn/page.tsx
  - lib/form-options.ts
---

## Decided
Exclude the `motion/` folder from the root TypeScript config. Each Remotion video project there has its own package.json and dependencies. Vercel installs only the root dependencies, so the Next.js type-check cannot resolve `remotion` or `@remotion/media`.

## Tried and ruled out
Nothing dropped. The only revert was `tsconfig.tsbuildinfo`, a side effect of running `tsc`, not an approach.

## Watch out
Root `tsconfig.json` includes `**/*.tsx`, so any new self-contained sub-project with its own dependencies breaks `next build` on Vercel at "Failed to type check". Branches `motion/bikol-archive-30s` and `motion/bikol-archive-v4-editorial` lack the exclude.

In the code:
- `tsconfig.json`: add `"motion"` to `exclude`.
- Reproduce: `npx tsc --noEmit` on branch `motion/bikol-vertical-remotion`.
