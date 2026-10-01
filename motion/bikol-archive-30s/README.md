# Bikol Archive — 30s Motion Film

A standalone Remotion composition for a 30-second Bikol Dictionary product/brand film.

## Creative direction

The film treats Bikol Dictionary as a **living language archive**, not just a search tool. The visual language comes directly from the product: nighttime Mayon imagery, literary/editorial typography, warm paper surfaces, nocturne dark mode, purple archive accents, and source-aware dictionary UI.

### Storyboard

| Time | Beat | Motion idea |
| --- | --- | --- |
| 0:00–0:04.5 | Cultural opening | Slow Mayon push-in. `A language is more than its words.` |
| 0:04–0:09.5 | Search | Type `magayon`; the definition resolves into a source-rich entry. |
| 0:09–0:14 | Dialects | One word expands into five dialect labels around a language core. |
| 0:14–0:18.5 | Conjugation | `bakal` transforms across verb forms on a motion timeline. |
| 0:18.5–0:23 | Learning | Flashcards, dialogue, and grammar drill cards enter as tactile study objects. |
| 0:23–0:27 | Community | Contribution UI shows corrections, new words, definitions, and sources. |
| 0:27–0:30 | Brand close | Return to Mayon. `Search it. Study it. Add to it.` |

## Run

```bash
cd motion/bikol-archive-30s
npm install
npm run studio
```

Open the `BikolArchive30` composition in Remotion Studio.

## Render

```bash
npm run render
```

The render script outputs `out/bikol-archive-30s.mp4`.

## Technical spec

- 1920×1080
- 30 fps
- 900 frames / 30 seconds
- Frame-driven Remotion animation (`useCurrentFrame`, `interpolate`, `spring`)
- No CSS keyframe animation
- Standalone package to avoid changing the production Next.js dependency graph

## Audio direction

The cut is intentionally authored without bundled music so the final score can be licensed deliberately. Recommended sound direction:

- restrained cinematic drone under the Mayon opening
- paper/ink or soft interface ticks for search and source reveals
- tonal percussive hits on conjugation transformations
- warm pulse as learning cards land
- subtle human/room texture under the community section
- resolved two-note sonic logo on the final title

Avoid generic corporate EDM. The film should feel archival, modern, regional, and human.
