# Bikol Dictionary

Bikol Dictionary is an early-stage dictionary and learning project for the Bikol language of the Bicol Region in the Philippines. It combines a searchable word database with tools for browsing entries, studying vocabulary, practicing grammar, and submitting corrections or new words.

The project is still evolving. Coverage is incomplete, and some translations, dialect labels, examples, and generated learning content need review from fluent speakers and language researchers.

## What you can do

- Search and browse Bikol words by spelling, category, letter, or frequency.
- View available definitions, English and Tagalog translations, dialect information, pronunciation, etymology, examples, and source references.
- Explore conjugations for supported verbs.
- Practice sentence substitution, verb transformations, and short dialogue scenarios.
- Study randomly selected vocabulary with Top 25, Top 50, or Top 100 flashcard decks.
- Suggest a new word, definition, correction, or source through the contribution form.

The information shown for an entry depends on the available source data. Not every entry has every field.

## Data and content

The dictionary currently brings together entries associated with:

- Malcolm Mintz's Bikol Dictionary
- Wiktionary
- LearnBikol.com
- Community submissions and references supplied through the contribution form

Source labels and references are stored with entries where they are available. The project does not treat all entries as equally complete or equally reviewed. Coverage varies by dialect and by source.

AI is used for parts of the learning experience, not as a replacement for source material or human review. Groq is used for quiz and dialogue-related learning features. Gemini is used to generate substitution-drill cues and expected replacement sentences from existing examples. Generated content can be wrong, so it should be checked before being treated as a reliable language reference.

## Project status and limitations

This is an early-stage prototype. The main web application is the primary development target.

Known limitations include:

- The dictionary does not yet provide complete coverage of Bikol vocabulary or dialects.
- Translation, pronunciation, etymology, and dialect fields may be missing or need review.
- AI-backed quizzes, drills, and dialogue require the relevant API key and may be affected by provider availability or rate limits.
- Drill prompts and dialogue scenarios may fall back to built-in examples when the API is unavailable. Live dialogue responses still require the API, and all built-in examples should be reviewed by fluent speakers.
- The installable web experience supports local history and installation prompts, but the full dictionary is not guaranteed to be available offline.
- Android packaging is present through Capacitor, but web development is the supported path documented here. The static bundle does not by itself provide the server, API, or database required by the full web application.

## Local development

### Prerequisites

- [Bun](https://bun.sh/)
- PostgreSQL database, either local or hosted
- API keys for the learning features you want to run

The repository's deployment configuration uses Bun, so the commands below use Bun as well.

### Setup

```bash
# Install dependencies
bun install

# Create a local environment file
cp .env.example .env

# Generate the Prisma client
bunx prisma generate

# Apply the checked-in database migrations
bunx prisma migrate deploy

# Start the development server
bun dev
```

You need a working `DATABASE_URL` before running the application. The migrations create the database schema, but they do not populate dictionary entries; you will need a database that already contains the project's data or a separate import process. The complete list of environment variables and their purposes is in [`.env.example`](.env.example).

At minimum, configure:

- `DATABASE_URL` for the PostgreSQL database.
- `NEXT_PUBLIC_SITE_URL` for canonical URLs and SEO metadata. `http://localhost:3000` is suitable for local development.

Optional variables enable specific parts of the application:

- `GROQ_API_KEY` for quizzes and dialogue practice.
- `GEMINI_API_KEY` for substitution-drill generation.
- `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` for protected admin and submission workflows.
- `NEXT_PUBLIC_PLATFORM=mobile` when producing the static web bundle used by Capacitor.

API keys and session secrets are server-side credentials. Do not commit `.env` or share these values.

## Useful commands

```bash
bun dev                # Start the development server
bun run build          # Create a production build
bun start              # Serve a production build
bun run lint           # Run ESLint
bun run typecheck      # Run TypeScript without emitting files
bun test               # Run the test suite
```

The repository also contains a Capacitor Android project. Mobile work is optional and is not required for normal web development:

```bash
NEXT_PUBLIC_PLATFORM=mobile bun run build
bunx cap sync android
bunx cap open android
```

## Project structure

This is a single Next.js application with a modular internal structure rather than separate `frontend/` and `backend/` folders:

- `app/` contains pages, layouts, loading/error boundaries, and the HTTP route handlers under `app/api/`.
- `components/` contains shared UI and feature UI. Dictionary UI lives under `components/dictionary/`; learning UI lives under `components/learn/`.
- `lib/server/` contains server-only infrastructure, including Prisma, AI clients, admin authentication, and database-backed dictionary search.
- `lib/dictionary/` contains client-safe dictionary logic such as conjugation and lexicography.
- `lib/types/` contains display and transport types that can safely cross into client components.
- `prisma/` contains the database schema and migrations.
- `android/` contains the Capacitor Android project.

Client components must not import `lib/server/` or Prisma-generated runtime types. The static Capacitor build is not a standalone database/API server; live mobile functionality requires a separately reachable API.

## Contributing

There are several useful ways to help:

- Report incorrect definitions, translations, examples, or source references.
- Submit missing words or corrections through the contribution form.
- Improve search, dictionary display, conjugation, learning flows, or accessibility.
- Add tests and improve the documentation.

Before opening a pull request, run the checks relevant to your change. If you are changing dictionary content, include the source or reference and identify the dialect when possible.

## Acknowledgements

The project uses material associated with Malcolm Mintz's Bikol Dictionary, [Wiktionary's Bikol language resources](https://en.wiktionary.org/wiki/Category:Bikol_language), and [LearnBikol.com](https://learnbikol.com/). Please preserve the source information attached to entries when adding or editing data. The repository does not currently maintain a dedicated URL for the Mintz source.

## License

The package metadata currently declares the project under ISC. No separate `LICENSE` file is included, so the project's distributable license should be confirmed and formalized before distribution.