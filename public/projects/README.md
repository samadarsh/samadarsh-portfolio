# Project screenshots

Drop `.webp` screenshots in this folder. They appear automatically inside the browser-frame preview on the Home and Work pages.

## Currently in use

| File | Project |
|------|---------|
| `bite-wise.webp` | BiteWise |
| `bluemoon-studio.webp` | Bluemoon Studio |
| `oor-snacks.webp` | Oor Snacks |

Other projects (FinSight, RepoMind, VoiceNote AI, GenAI Email Generator) intentionally have no cover — they render a branded gradient placeholder with the project name.

## Adding a new screenshot

1. Capture the most visually compelling screen (hero/landing page works best).
2. Convert to optimized WebP:

   ```bash
   magick source.png -quality 92 -define webp:method=6 output.webp
   ```

3. Save as `<slug>.webp` in this folder (slug must match `src/data/content.ts`).
4. Add `cover: 'projects/<slug>.webp'` to the project entry in `content.ts`.

## Recommended specs

- **Aspect ratio:** 16:10 (e.g. 1920×1200, 2560×1600) — fits the preview frame natively
- **Format:** WebP
- **Target size:** under 250 KB after optimization

## Fallback behaviour

If a `cover` is missing or fails to load, a branded gradient mockup with the project name shows up automatically. No code changes needed — this is what most projects use right now.
