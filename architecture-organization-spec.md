# Architecture and Repository Organization Specification

## Status

Draft specification for evaluating and, if approved later, reorganizing the Bikol Dictionary repository. This document is the result of a repository audit and a three-round interview. **No implementation files should be moved or changed as part of creating this spec.**

## Request

Assess whether this project should be reorganized into separate `frontend/` and `backend/` directories, and decide whether the current root-level mix of JSON, MJS, TypeScript, TOML, Python requirements, documentation, and configuration files is messy.

The eventual recommendation should improve navigation, security boundaries, future flexibility, and root-level clarity without fighting Next.js App Router conventions or creating unnecessary deployment complexity.

## User context and goals

The user wants to:

- Make the repository easier to understand for new contributors.
- Prepare for growth into either a larger product or a small contributor project.
- Make server-only code, secrets, and database access easier to distinguish from client code.
- Reduce perceived root clutter.
- Support frontend developers, backend/data developers, language contributors, and mixed contributors.
- Consider a large restructure if the long-term benefit is justified.
- Keep Vercel as the primary deployment target.
- Use a hybrid organization style rather than purely technical layers or purely product domains.
- Move Python tooling under a clear data area rather than leaving its metadata at the root, even though the current repository does not contain the historical scripts that the old README referenced.
- Receive a recommendation, proposed target tree, migration plan, and team conventions.

The user asked for the pros and cons of the major architectural choices. The eventual recommendation must explain those tradeoffs rather than presenting one structure as universally correct.

## Executive recommendation

### Do not create a top-level `frontend/` and `backend/` split yet

The preferred direction is **not** a conventional two-application `frontend/` / `backend/` structure at this stage.

This repository is a single Next.js App Router application. Its current framework layout is recognizable and largely appropriate:

- `app/` contains routes, pages, layouts, error/loading boundaries, metadata, and colocated route handlers under `app/api/`.
- `components/` contains reusable UI and client components.
- `lib/` contains shared domain logic, server utilities, AI clients, database access, and types.
- `prisma/` contains the schema and migrations.
- `android/` contains the native Capacitor project.
- root-level framework and deployment configuration files are where Next.js, TypeScript, PostCSS, ESLint, Prisma, Vercel, and Capacitor expect or conventionally support them.

A top-level frontend/backend split would add indirection and migration cost without creating independent deployables. It would also make the Next.js `app/` directory less obvious, complicate the `@/*` alias, and encourage moving route handlers away from the framework convention solely to satisfy an abstract architecture diagram.

### Prefer a hybrid, domain-aware structure inside the existing Next.js app

The target should preserve framework-required locations while making domain boundaries more visible:

- Keep `app/` at the root for Next.js routes and route handlers.
- Keep root `components/` only for genuinely shared UI, layout, navigation, and reusable primitives.
- Group domain-specific UI under feature-oriented directories such as `components/dictionary/`, `components/learn/`, `components/contribute/`, and `components/admin/`.
- Keep shared cross-domain utilities in `lib/`.
- Group server-only code explicitly under `lib/server/`, with nested infrastructure areas such as `lib/server/ai/`, `lib/server/admin/`, and `lib/server/dictionary/`, using `server-only` imports.
- Group domain logic under `lib/dictionary/`, `lib/learning/`, `lib/contributions/`, `lib/admin/`, and similar areas when enough files justify each directory.
- Keep Prisma schema and migrations under `prisma/` because Prisma tooling expects this convention and the directory is already clear.
- Move Python tooling metadata and any future active data scripts under `data/` or `tools/data/`, but do not invent or move absent scripts just to create a hierarchy.
- Keep only tool-required or genuinely project-wide config at the root.

This is a **modular monolith**: one deployable Next.js application with explicit internal modules, not two fake applications. The existing Capacitor static-export path is a separate client concern: it cannot execute the server/API layer locally and must either remain experimental/static or consume a remote API.

## Why the current structure is mostly sound

The current layout follows common Next.js conventions and already separates major concerns reasonably well. The main architectural problem is not that everything is in the root; it is that `lib/` mixes browser-safe helpers, server-only database access, AI clients, domain logic, types, and miscellaneous utilities without an obvious boundary.

The current import graph confirms the following:

- Pages and route handlers import shared utilities from `@/lib/*`.
- API routes import `prisma` from `@/lib/server/prisma` and server-side AI clients from `@/lib/server/ai/groq` or `@/lib/server/ai/gemini`.
- Client components import browser-safe helpers and UI utilities from `@/lib/*`.
- `lib/types/word.ts` imports Prisma-generated types, which can blur the server/client boundary if those types are imported into browser bundles.
- `app/api/` is already the backend surface within Next.js; moving it to a separate top-level backend folder would be non-idiomatic unless a separate API application is intentionally created.
- The root currently contains one `package.json` and one `package-lock.json`; there is no evidence of multiple independently deployable JavaScript applications.
- `vercel.json` explicitly uses Bun for installation and build, reinforcing the single Vercel application model.

## Tradeoff analysis

### Option A: Keep the current structure unchanged

#### Benefits

- Lowest migration risk.
- Fully aligned with Next.js App Router conventions.
- No import or deployment changes.
- Easy for experienced Next.js developers to recognize.

#### Costs

- `lib/` will continue to be a mixed-purpose folder.
- Server-only and client-safe modules are not visually separated.
- Domain ownership is less obvious as the project grows.
- The root may continue to feel cluttered because data tooling and application tooling are not clearly grouped.

#### Verdict

Good short-term safety, but insufficient for the user's goals around security clarity, contributor navigation, and future growth.

### Option B: Create `frontend/` and `backend/` directories inside the same app

#### Benefits

- Looks familiar to people coming from traditional web stacks.
- Provides a simple conceptual separation at first glance.

#### Costs

- Does not match Next.js's required `app/` routing convention.
- Encourages a fake separation when route handlers, server components, database access, and frontend rendering remain part of one Next.js build.
- Requires alias, import, and configuration changes with little functional benefit.
- Makes shared types, server components, and API handlers harder to place.
- Can create duplicate or ambiguous locations for components, services, and route handlers.

#### Verdict

Not recommended for the current Vercel-first application.

### Option C: Build a true frontend plus independently deployable backend

#### Benefits

- Strong deployment and security boundary.
- API can serve web, Android, future clients, and workers independently.
- Backend scaling and ownership become clearer.
- Useful if the project gains multiple clients, long-running jobs, or a separate API team.

#### Costs

- Requires an actual service boundary, not just folders.
- Adds deployment, authentication, CORS, API versioning, environment, observability, and local-development complexity.
- Requires deciding whether server-rendered pages still access the API or share data logic.
- Increases operational burden for a small contributor project.

#### Verdict

A plausible future direction, but premature unless independent deployment, multiple clients, or worker workloads become real requirements. The current repository should be shaped so this extraction remains possible without pretending it has already happened.

### Option D: Hybrid modular monolith

#### Benefits

- Preserves Next.js conventions and Vercel deployment.
- Creates clearer domain and server/client boundaries.
- Improves contributor navigation without unnecessary service boundaries.
- Allows future extraction of a domain or worker when there is a real need.
- Keeps migrations incremental and reversible.

#### Costs

- Requires naming and dependency discipline.
- A directory boundary alone cannot prevent bad imports.
- Some files will still be framework-level and remain at the root.
- The project will not look like a traditional frontend/backend split.

#### Verdict

Recommended now.

## Root-level file policy

### Root files are not inherently messy

For a Next.js/Prisma/Vercel/Capacitor repository, the following root-level files are normal and should generally remain at the root because tools discover them there or contributors expect them there:

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next-env.d.ts`
- `next.config.mjs`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `.prettierrc`
- `vercel.json`
- `capacitor.config.json`
- `.env.example`
- `.gitignore`
- `README.md`
- `prisma.config.ts`
- `pyproject.toml` and `requirements.txt` only while Python is treated as a project-level toolchain

The fact that these files use different formats does not by itself indicate disorder. Each belongs to a different tool: JSON for package/deployment metadata, MJS for JavaScript-based build configuration, TypeScript for typed config, TOML for Python packaging, and text requirements for Python dependencies.

### Root files that should be reviewed

- `ENV_AUDIT.md` is useful documentation but could eventually live under `docs/` if the project accumulates more operational documentation.
- `rewrite-readme-spec.md` is a temporary planning artifact. It should not become a permanent root document unless the team wants a formal documentation/spec process; otherwise archive or remove it after implementation.
- `tsconfig.tsbuildinfo` is generated state and is currently ignored by `.gitignore` patterns; it should not be intentionally committed or treated as source.
- `requirements.txt` currently contains only PDF-related dependencies, while `pyproject.toml` declares a much broader Python package. This is a dependency-management consistency issue, not a folder-structure issue.
- `config/` contains environment templates. It should be evaluated separately for duplication with `.env.example`, not automatically moved as part of the frontend/backend decision.

### Recommended root policy

Keep a file at the root when at least one of these is true:

1. A framework or build tool expects or conventionally discovers it there.
2. It controls the whole repository or primary deployment.
3. It is the main entry point for contributors.
4. Moving it would require custom configuration without improving navigation.

Move a file under a subdirectory when:

1. It belongs to a specialized toolchain that is not active in the main application.
2. Multiple files form a coherent subsystem.
3. The move improves discoverability and does not fight tool conventions.
4. The tool can be configured reliably to use the new location.

## Proposed target tree

This is a target direction, not an instruction to move every file immediately.

```text
.
├── app/                         # Next.js routes, layouts, pages, route handlers
│   ├── api/                     # HTTP/API surface, grouped by route domain
│   ├── admin/
│   ├── browse/
│   ├── contribute/
│   ├── flashcards/
│   ├── frequency-list/
│   ├── learn/
│   └── word/
├── components/                  # Shared UI and feature UI
│   ├── ui/                      # Generic primitives
│   ├── layout/                  # Navigation, footer, transitions, providers if useful
│   ├── dictionary/              # Dictionary-specific UI
│   ├── learn/                   # Learning-specific UI
│   ├── contribute/              # Submission/edit UI
│   └── admin/                   # Admin UI
├── lib/                         # Shared application modules
│   ├── server/                  # Server-only infrastructure and adapters
│   │   ├── prisma.ts
│   │   ├── ai/
│   │   │   ├── groq.ts
│   │   │   └── gemini.ts
│   │   ├── admin/
│   │   │   └── auth.ts
│   │   └── dictionary/
│   │       └── search.ts
│   ├── dictionary/               # Search, definitions, lexicography, conjugation
│   ├── learning/                 # Learning helpers and types
│   ├── contributions/            # Submission/domain helpers
│   ├── gamification/             # Gamification domain logic
│   ├── types/                    # Shared types that are safe to import by clients
│   └── shared utilities           # Small cross-domain helpers only
├── prisma/                      # Prisma schema and migrations
├── data/                        # Active data tooling and import documentation
│   ├── README.md
│   ├── python/                  # Future Python scripts/package
│   │   ├── pyproject.toml       # Move only if Python becomes a real subproject
│   │   └── requirements.txt     # Keep dependency sources consistent
│   └── sources/                 # Optional source files or source notes, if permitted
├── docs/                        # Durable architecture, operations, and data docs
├── android/                     # Capacitor Android project
├── public/                      # Static assets and web manifests
├── tests/                       # Cross-module tests, if not colocated
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
├── eslint.config.mjs
├── prisma.config.ts
├── capacitor.config.json
├── vercel.json
├── .env.example
└── README.md
```

### Important target-tree caveats

- Do not move `app/api` to `backend/`; it is a Next.js route surface.
- Do not move all of `lib/` into `backend/`; some modules are shared by client and server code.
- Do not move framework configs merely to make the root visually smaller.
- Do not create empty domain directories before there are enough related files to justify them.
- Do not create `data/python/` solely because `pyproject.toml` exists if no active Python source is present. The first Python move should happen when a real pipeline is restored or added.
- Do not move `prisma/` unless Prisma configuration is intentionally changed and validated.

## Server/client boundary requirements

Security clarity is a primary goal. The eventual implementation should establish the following rules.

### Server-only modules

The following categories must be server-only:

- Prisma client and database adapters.
- Groq and Gemini clients using private API keys.
- Admin authentication and session signing.
- Direct use of private environment variables.
- Database-backed domain services.
- Import/enrichment jobs and filesystem/network tooling intended for server execution.

These modules live under `lib/server/` and use the `server-only` package/import guard. Route handlers under `app/api/` are also trusted server boundaries and may import these modules directly.

### Client-safe modules

Client components may import:

- Pure formatting and validation helpers.
- UI primitives and feature components.
- Shared types that do not import Prisma runtime or server modules.
- Browser-only utilities such as IndexedDB history helpers, when explicitly marked or documented.

Types intended for the browser should not import `@prisma/client` merely to reuse model types. Define transport/display types in `lib/types/` and keep Prisma-derived types inside server modules or map them at the boundary.

### Dependency direction

Prefer this direction:

```text
app routes/pages
  -> components and domain modules
  -> server services or client-safe helpers
  -> infrastructure adapters (Prisma/AI/external services)
```

Avoid:

- `components/` importing `lib/server/*` directly.
- `lib/types/` importing runtime server infrastructure.
- Server infrastructure importing UI components.
- A domain module importing another domain's private internals when a shared type or service boundary would suffice.
- Client components receiving raw Prisma records when a narrow display/DTO type is sufficient.

## Domain organization guidance

Use domain grouping when it reduces search time, not as a mandatory folder-count exercise.

### Dictionary domain
Potential future homes:

- `lib/server/dictionary/search.ts`
- `lib/dictionary/conjugation.ts`
- `lib/dictionary/lexicography.ts`
- `lib/dictionary/definitions.ts`
- `components/dictionary/*`

Implemented candidates include `lib/server/dictionary/search.ts`, `lib/dictionary/conjugation.ts`, `lib/dictionary/lexicography.ts`, and `lib/dictionary/definitions.ts`.

### Learning domain
Potential future homes:

- `lib/learning/types.ts`
- `lib/learning/scoring.ts`
- `components/learn/*`
- server-side learning providers under `lib/server/learning/*` if needed

Current learning UI already has a useful `components/learn/` boundary. Avoid moving it unless the target grouping improves consistency.

### Contribution and admin domains
Potential future homes:

- `components/contribute/*`
- `components/admin/*`
- `lib/contributions/*`
- `lib/server/admin/*`

Do not expose admin auth or moderation logic to client bundles.

### Gamification domain
Potential future homes:

- `lib/gamification/*`
- `app/api/profile/*`
- `components/profile/*` if profile UI grows

The existing `lib/gamification.ts` is a candidate for domain grouping, not evidence that a separate service is needed.

## Migration plan

The later implementation should be phased and reversible. Do not combine a directory move with unrelated behavior changes.

### Phase 0: Baseline and inventory

- Confirm the repository is clean or record existing user changes.
- Run the available typecheck, lint, and tests before moving files.
- Generate a complete import/reference map.
- Identify which modules are imported by client components, server components, route handlers, scripts, and tests.
- Confirm current build/deployment commands for Vercel and Capacitor.
- Decide whether `rewrite-readme-spec.md` is temporary and whether it should remain.

### Phase 1: Establish boundaries without broad moves

- Add clear naming/documentation for server-only and client-safe modules.
- Add `server-only` guards where supported and appropriate.
- Split Prisma-derived browser types from transport/display types.
- Add or update lint rules/import restrictions if they can be introduced without destabilizing the project.
- Document dependency direction in contributor documentation.

This phase provides much of the security and navigation benefit without immediately changing every import path.

### Phase 2: Move only obvious server infrastructure

Candidate moves:

- `lib/prisma.ts` -> `lib/server/prisma.ts`
- `lib/groq.ts` -> `lib/server/ai/groq.ts`
- `lib/gemini.ts` -> `lib/server/ai/gemini.ts`
- `lib/admin-auth.ts` -> `lib/server/admin/auth.ts`

For each move:

- Update all imports using a repository-wide search.
- Preserve public exports or add compatibility wrappers temporarily if needed.
- Run typecheck, lint, tests, and a production build.
- Verify no client bundle imports private environment variables or server adapters.
- Verify route behavior and error boundaries.

### Phase 3: Group domain modules when justified

Move only coherent groups with multiple related files:

- Dictionary utilities into `lib/dictionary/`.
- Learning types/helpers into `lib/learning/`.
- Contribution/admin helpers into their domains.
- Gamification logic into `lib/gamification/`.

Do not create wrappers or barrel files solely for aesthetics. Preserve import clarity and avoid circular dependencies.

### Phase 4: Group feature-specific components

Potentially move:

- Root-level dictionary-specific components into `components/dictionary/`.
- Contribution form/edit components into `components/contribute/`.
- Admin components into `components/admin/`.
- Layout/navigation components into `components/layout/` if the group is large enough.

Keep generic primitives in `components/ui/` and shared components at the root of `components/` only when they are truly cross-domain.

### Phase 5: Move Python tooling only when active

If data scripts return or are added:

- Create `data/python/` or `tools/data/` as the Python boundary.
- Decide whether `pyproject.toml` should become the canonical dependency definition.
- Avoid maintaining conflicting dependency lists in root `requirements.txt` and a new nested file.
- Add a `data/README.md` documenting inputs, outputs, source licensing, secrets, and reproducibility.
- Ensure Python tooling cannot accidentally be packaged into the Next.js application.

Until active Python source exists, leaving `pyproject.toml` and `requirements.txt` at the root is acceptable and lower risk than moving metadata into an empty directory.

### Phase 6: Mobile/API decision and optional future service extraction

The current refactor does not make the Capacitor bundle a standalone live application. With `NEXT_PUBLIC_PLATFORM=mobile`, Next.js produces a static bundle; it cannot run Prisma or `app/api` route handlers on the device. If Android must support live search, submissions, profiles, or AI interactions, the next step is a client API adapter targeting a deployed API. Extract that API into a separate service only when the mobile/API requirements justify the operational cost.



Only consider a true `apps/web` plus `apps/api` or package workspace when at least one concrete trigger exists:

- A second client needs the API.
- API and web deployments need independent scaling or release cadence.
- Background imports/enrichment require long-running workers.
- A separate backend owner/team exists.
- Vercel route handlers no longer meet runtime or operational needs.

At that point, define the API contract, auth model, CORS policy, environment ownership, shared types package, local orchestration, deployment pipeline, and data-access ownership before moving files.

## Root-level file decisions

### Keep at root for now

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next-env.d.ts`
- `next.config.mjs`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `.prettierrc`
- `vercel.json`
- `capacitor.config.json`
- `.env.example`
- `.gitignore`
- `README.md`
- `prisma.config.ts`
- `prisma/`

### Consider moving later

- `ENV_AUDIT.md` -> `docs/ENV_AUDIT.md` if a durable docs hierarchy is adopted.
- `rewrite-readme-spec.md` -> temporary planning/archive location or remove after the README work is complete.
- `pyproject.toml` and `requirements.txt` -> `data/python/` only when Python becomes an active, coherent subproject and the dependency strategy is consolidated.

### Do not intentionally track

- `tsconfig.tsbuildinfo` or other generated build state.
- Secrets or local environment files.
- Generated Capacitor/Android artifacts that are already ignored.

## Team conventions

### Naming

- Use `components/` for React components and `lib/` for non-React modules.
- Use explicit `server` naming for server-only modules.
- Use domain names (`dictionary`, `learning`, `contributions`, `gamification`) rather than vague buckets (`misc`, `helpers`, `stuff`).
- Avoid adding a directory for a single file unless the boundary has clear ownership or security value.

### Client/server annotations

- Add `"use client"` only to components that require client behavior.
- Keep private environment access out of client modules.
- Mark server-only modules explicitly.
- Prefer narrow DTO/display types at page/component boundaries.

### Import rules

- Use the existing `@/*` alias consistently.
- Prefer imports from a domain's public entry point only if a domain actually needs one; do not create large barrel files by default.
- Do not import from another domain's private implementation path without a clear reason.
- Keep relative imports for files that are tightly colocated within one route or component group.

### Documentation

- Keep `README.md` focused on users and contributors.
- Put durable architecture and operations guidance under `docs/` once more than one such document exists.
- Document data-source ownership, AI-generated content boundaries, and server-only secrets.
- Keep migration notes close to the change or in a dated architecture record.

### Testing and validation

Every structural move should be validated with:

- `bun run typecheck`
- `bun run lint`
- `bun test`
- `bun run build`
- A targeted smoke test of affected routes or UI when practical.

If the environment lacks Bun or installed dependencies, record that limitation rather than claiming the move was validated.

## Acceptance criteria

The architecture recommendation/spec is successful when:

1. It clearly recommends against a premature top-level `frontend/` / `backend/` split for the current Vercel-first Next.js app.
2. It proposes a hybrid modular-monolith structure that preserves Next.js conventions.
3. It explains the benefits and costs of unchanged, split-app, true-service, and hybrid options.
4. It distinguishes normal root-level configuration from genuinely misplaced or temporary files.
5. It establishes an explicit server/client security boundary.
6. It gives contributors a practical target directory tree.
7. It provides a phased, reversible migration plan.
8. It explains when a true frontend/backend service split would become justified.
9. It treats Python metadata as a separate data-tooling concern rather than evidence that the entire app needs a backend folder.
10. It prioritizes Vercel compatibility, low migration risk, future flexibility, and contributor navigation.
11. It does not require moving files or changing code until a separate implementation request is approved.

## Out of scope for this specification

- Moving files now.
- Changing imports, aliases, or build configuration now.
- Adding a monorepo tool or new deployment service now.
- Rewriting the application architecture solely to make the root visually smaller.
- Adding a Python data pipeline that is not currently present.
- Changing database schema, API behavior, authentication behavior, or UI behavior.
- Formalizing the license or package metadata unless separately requested.
