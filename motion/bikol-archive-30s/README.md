# Bikol Archive — 30s Motion Film

A standalone Remotion package for Bikol Dictionary product/brand films.

## Creative direction

The film treats Bikol Dictionary as a **living language archive**, not just a search tool. The visual language is editorial and regional: literary type, warm paper, nocturne UI, restrained purple/gold accents, source-aware dictionary details, and a custom vector Mayon motif.

## Vertical 30s composition

The custom vertical film is `BikolArchiveVertical30`:

| Time | Beat | Motion idea |
| --- | --- | --- |
| 0:00–0:04 | Hook | `magayon → beautiful`, then challenge the translation: “That’s only the surface.” |
| 0:04–0:08 | Entry | Turn the word into a source-aware dictionary record. |
| 0:08–0:12 | Dialect | Move from dark UI to paper archive; show dialect as meaning-in-place. |
| 0:12–0:17 | Grammar | Keep `bakal` visually anchored while its grammatical form changes. |
| 0:17–0:22 | Practice | Carry one word through LOOK → MOVE → SAY → USE. |
| 0:22–0:26 | Community | Show correction + source + dialect + review entering the archive. |
| 0:26–0:30 | Close | Return to the Mayon motif. “Search it. Study it. Add to it.” |

The seven scenes are also registered individually under `BikolArchiveVertical30-Scenes` in Remotion Studio.

## Preview

```bash
cd motion/bikol-archive-30s
npm install
npm run validate:vertical
npm run studio:vertical
```

Open the `BikolArchiveVertical30` composition in Remotion Studio.

## Render vertical MP4

```bash
npm run render:vertical
```

Output: `out/bikol-archive-vertical-30s.mp4`.

## Technical spec

- Vertical: 1080×1920, 30 fps, 900 frames / 30 seconds
- Horizontal legacy compositions remain 1920×1080
- Frame-driven Remotion animation via `useCurrentFrame()` and `interpolate()`
- No CSS keyframe or CSS transition animation
- No stock footage or generated B-roll required
- Custom vector Mayon motif avoids remote-media dependencies for the vertical cut

## Motion rules

- Meaning causes motion; avoid ambient movement with no communication job.
- Preserve generous mobile-safe margins.
- Prefer match cuts, masks, and anchored transformations over excessive springs.
- Avoid glossy AI gradients, random particles, fake dashboards, floating feature-card stacks, and gratuitous 3D.
