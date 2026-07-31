# README Rewrite Specification

## Status

Draft specification for a future README rewrite. This file records the agreed direction and repository facts gathered during the interview. **Do not modify `README.md` or application code as part of creating this spec.**

## Request

Rewrite the repository README into a human-written README for the Bikol Dictionary project.

The rewrite should feel plain, specific, modest, and maintained by a real person. It should avoid the current README's promotional, over-branded, and AI-generated feel while still explaining why the project exists, what currently works, how to develop it locally, and where the project is incomplete.

## Audience

Serve two audiences with a clear priority order:

1. People who want to understand the project and its learner-facing purpose.
2. Potential contributors, including developers, language learners, linguists, and community members.

The README should work for both audiences without becoming two unrelated documents. Lead with a concise project explanation, then provide verified features and data-source context before moving into contributor setup.

## Primary goals

The rewritten README must:

- Explain what the project is and who it is for.
- Help readers understand the current learner-facing functionality.
- Build trust by being explicit about data sources, AI-assisted content, community submissions, and limitations.
- Give a contributor enough information to run the web project locally.
- Sound like the maintainer or project team, not like generated marketing copy.
- Match the actual repository rather than an aspirational or historical architecture.

## Voice and editorial direction

Use all of the following:

- Plain and practical wording.
- Warm, community-minded language where it is natural.
- Technical detail that is useful rather than performative.
- A modest personal maintainer voice when it helps explain the project's motivation or current state.
- Short paragraphs and concrete nouns.
- Direct statements about what exists, what is experimental, and what is not included.
- A tone appropriate for an early-stage prototype: useful and intentional, but not presented as complete or authoritative beyond its evidence.

Avoid:

- Grand project branding and slogans.
- The phrase “The Living Archive” as a central identity; the user prefers to remove it.
- Corporate or AI-flavored language such as “bridging academic precision with modern accessibility,” “high-fidelity data extraction,” “functional fluency,” “agentic architecture,” “responsive bloom,” “resting rigor,” “semantic contrast,” “unlock,” “seamlessly,” “robust,” or similar filler.
- Heavy emoji use, decorative section labels, and marketing-style “pillars.”
- Claims of authority that the repository cannot demonstrate.
- Treating generated content as inherently accurate.
- Vague claims such as “thousands” or “multi-dialect support” unless the number and coverage can be verified at implementation time.
- Describing absent scripts, agents, or workflows as if they are available.
- Excessive em-dash usage and elaborate rhetorical contrasts.

## Scope decisions

### Include

- Project overview and motivation.
- Verified learner-facing features.
- Data sources and attribution.
- A short, honest project-status or limitations section.
- A local web-development setup path.
- Environment-variable configuration.
- Useful developer commands: development server, lint, typecheck, and tests if they are confirmed to work.
- A brief contributor section describing practical ways to help.
- A short note about Android/Capacitor support, without making mobile equal in scope to web development.
- A concise license section if the repository's license status can be verified.

### Exclude

- A live app link. The user explicitly prefers not to include one.
- The former “Agentic Architecture” section.
- Detailed visual-design philosophy and invented design-system branding.
- Missing data-pipeline scripts and commands.
- Unsupported claims about automated PDF extraction, Wiktionary scraping scripts, or repository-local AI subagents.
- A large roadmap or speculative architecture section.
- Any feature that cannot be verified from the current application or repository.

### Handling unsupported content

Remove unsupported claims and commands from the new README rather than preserving them with warnings. Do not move them into a historical or planned section unless the implementation author first finds concrete repository evidence that the material is genuinely part of the project's intended future.

## Repository facts to preserve or verify during implementation

The current repository is a Next.js application using the App Router. Relevant evidence includes:

- `package.json` identifies the project as `bikoldict`.
- The package scripts currently include:
  - `dev`: `next dev`
  - `build`: `next build`
  - `start`: `next start`
  - `lint`: `eslint .`
  - `test`: `bun test`
  - `typecheck`: `tsc --noEmit`
  - `postinstall`: `prisma generate`
- The frontend uses Next.js, React, Tailwind CSS/PostCSS, Framer Motion, and Lucide icons.
- The server-side data layer uses Prisma with PostgreSQL through `@prisma/adapter-pg` and `pg`.
- `lib/prisma.ts` contains Supabase-specific PostgreSQL SSL handling, but the application does not use `@supabase/supabase-js` directly. The README should describe this accurately as PostgreSQL/Prisma hosted on or compatible with Supabase only if that distinction is made clear.
- `prisma/schema.prisma` contains normalized dictionary models (`Root`, `Definition`, `Conjugation`, and `ExampleSentence`), legacy word storage, user submissions, flashcards, learning records, and gamification-related models.
- The application has routes/features for dictionary search, browsing, word pages, frequency browsing, learning, flashcards, contributions, and administration. Each should be mentioned only if the final implementation confirms it is user-accessible and functional.
- `app/learn/page.tsx` contains a three-phase learning flow: substitution, transformation, and applied fluency/dialogue. It includes fallback drills when the drills API is unavailable.
- `app/flashcards/page.tsx` provides selectable Top 25, Top 50, and Top 100 decks loaded from the learning API.
- `app/contribute/page.tsx` provides a moderated word-submission flow.
- PWA-related files and offline helpers exist, including `public/manifest.json`, `public/site.webmanifest`, `components/PwaInstallPrompt.tsx`, and `lib/offline.ts`. The README may mention installability/offline support only at a level supported by actual behavior; do not imply complete offline dictionary availability without verification.
- Android Capacitor project files exist under `android/`, and `capacitor.config.json` sets `webDir` to `out`. The README should call this Android/Capacitor packaging support, not claim a completed iOS application unless evidence is added.
- `next.config.mjs` uses static export only when `NEXT_PUBLIC_PLATFORM=mobile`.
- AI integrations exist in `lib/groq.ts` and `lib/gemini.ts`. Current code references Groq for learning/quiz/dialogue behavior and Gemini for drill generation. Avoid claiming that AI automatically enriches the entire dictionary unless the code and data workflow prove that.
- `app/layout.tsx` and `components/Footer.tsx` identify or reference Malcolm Mintz's Bikol Dictionary, Wiktionary, and LearnBikol.com. The final README should verify the exact attribution links and explain each source's role only when known.
- `.env.example` documents `DATABASE_URL`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`, and optional `NEXT_PUBLIC_PLATFORM`.
- The current repository has `pyproject.toml` and `requirements.txt`, but the previously documented scraper/extraction files are absent.
- The following paths referenced by the existing README were found to be missing and must not appear as runnable instructions in the rewrite unless they are added later: `scripts/`, `scripts/extract_mintz_pdfs.py`, `scripts/py/extract_mintz_pdfs.py`, `scripts/ts/migrate-to-mintz.ts`, `ai_wiktionary_scraper.py`, and `.gemini/agents/`.

These facts are a starting point, not permission to make new claims. Re-check relevant files before writing the final README because the repository may change between this spec and implementation.

## Required README structure

The exact headings may be adjusted for natural flow, but the final README should cover this structure:

### 1. Title and one-paragraph overview

Use a straightforward title such as “Bikol Dictionary.” Do not use “The Living Archive.”

The opening should answer:

- What is this?
- Which language/community does it serve?
- Is it primarily a dictionary, a learning tool, or both?
- What is the current project status?

Keep this to one or two readable paragraphs. A live app link is intentionally out of scope.

### 2. What you can do with it

Use a short, verified list or compact subsections. Likely candidates include:

- Search and browse Bikol entries.
- View definitions, translations, pronunciation or etymology fields where present.
- Explore conjugations for supported verbs.
- Practice with learning drills.
- Study with flashcards.
- Submit words or corrections for review.

Each item must reflect the current UI and code. Do not claim every entry has every field, and do not imply all learning content is human-reviewed.

### 3. Data and content

Explain the source roles concisely and accurately. Distinguish between:

- Source-backed dictionary material.
- AI-assisted content used in learning or enrichment workflows.
- Community submissions that are reviewed before acceptance.

Include attribution links where the repository or maintainer can provide them. State that coverage and accuracy vary, especially across dialects and AI-generated examples. Do not present AI confidence scores as proof of correctness.

### 4. Project status and limitations

Describe the project as an early-stage prototype. Be candid but not self-defeating.

Mention only verified limitations, such as:

- Coverage is incomplete.
- Dialect labels and translations may need review.
- Some learning content depends on API keys or external model availability.
- AI-generated content can be wrong and should be checked.
- Mobile packaging exists, but web development is the primary path.
- Any other concrete limitations confirmed during implementation.

Do not invent a roadmap. If a next-steps list is useful, keep it to a few concrete items supported by repository evidence or explicit maintainer input.

### 5. Local development

Provide a minimal happy path first:

1. Clone/change into the repository, if the repository URL is known; otherwise do not invent one.
2. Install dependencies using the project's documented package-manager convention, after checking whether Bun or npm is the supported/reproducible choice.
3. Copy `.env.example` to `.env`.
4. Explain which variables are required for the basic web app and which are needed only for learning, drills, admin, SEO, or mobile builds.
5. Run Prisma generation and the appropriate database initialization command, only if it is verified against the current Prisma configuration and migration workflow.
6. Start the development server.

The setup must not imply that a reader can run the full app without a PostgreSQL database. Make external requirements and API keys obvious.

### 6. Useful commands

Include only tested or repository-defined commands. Prefer a small table or code block covering:

- Development.
- Linting.
- Typechecking.
- Tests.
- Production build/start if relevant.
- Android/Capacitor packaging as a short optional note.

Do not include commands for missing Python scripts or absent migration tools.

### 7. Contributing

Explain practical contribution paths:

- Report incorrect definitions or missing entries.
- Use the in-app contribution form where appropriate.
- Improve UI, search, learning flows, tests, or documentation.
- Run the relevant checks before opening a pull request, once those checks are verified.

Do not claim a formal governance model or moderation process beyond what the current app actually implements.

### 8. License and acknowledgements

Retain a license statement only after verifying the actual repository license. The current `package.json` says ISC while the old README says MIT; this conflict must be resolved from repository evidence before documenting a license. Add concise source acknowledgements with links where available.

## Environment documentation requirements

The final README should not paste secrets or use confusing placeholder credentials. It should refer readers to `.env.example` and summarize variables by purpose.

At minimum, verify and describe:

- `DATABASE_URL`: required PostgreSQL connection string.
- `GROQ_API_KEY`: needed for Groq-backed learning features.
- `GEMINI_API_KEY`: needed for Gemini-backed drill generation.
- `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`: needed for admin and protected submission workflows, if contributors need those locally.
- `NEXT_PUBLIC_SITE_URL`: canonical URL/SEO configuration, with localhost guidance if appropriate.
- `NEXT_PUBLIC_PLATFORM=mobile`: optional mobile static-export mode.

The README should make clear that API keys are server-side secrets and must not be committed.

## Factual accuracy checklist for implementation

Before replacing `README.md`, the implementation should:

- Check every path mentioned in the new README exists.
- Check every command against `package.json`, project configuration, and the current dependency lockfile.
- Run or otherwise validate the documented typecheck, lint, and test commands where practical.
- Resolve the Bun versus npm installation convention rather than presenting an arbitrary choice.
- Resolve the MIT versus ISC license conflict before documenting a license.
- Verify whether database setup should use migrations, `prisma db push`, or another command; do not blindly retain the current README's command.
- Confirm whether PWA/offline behavior warrants a feature claim.
- Confirm which AI provider powers which route/feature.
- Confirm exact source attribution and URLs.
- Remove all references to missing scripts and `.gemini/agents/`.

## Acceptance criteria

The rewrite is successful when:

1. A reader immediately understands that this is an early-stage Bikol dictionary and learning project.
2. The prose sounds natural, restrained, and specific rather than like generated product copy.
3. The README contains no unsupported paths, commands, architecture claims, or feature promises.
4. The README distinguishes dictionary sources, AI-assisted behavior, and community submissions.
5. The README clearly communicates limitations and uncertainty without burying them.
6. A contributor can identify prerequisites, required environment variables, and the local development path.
7. Developer commands are consistent with the repository and are not presented as tested if they were not tested.
8. Mobile support is acknowledged briefly without overshadowing web development.
9. The README does not include a live app link, “The Living Archive” branding, or an “Agentic Architecture” section.
10. The final document is concise enough to scan on GitHub while still being useful to a contributor.
11. No files other than the intended README are modified when the future implementation is performed.

## Out of scope for the future implementation

- Changing application behavior.
- Adding missing scraper or migration scripts solely to support README claims.
- Fixing package metadata, license metadata, or dependency configuration unless separately requested.
- Creating a formal contributor governance system.
- Adding screenshots, badges, live deployment links, or analytics unless the maintainer explicitly requests them.
- Reworking the project's data model or AI pipelines.
