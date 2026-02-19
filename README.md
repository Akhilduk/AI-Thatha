# AI Thatha Tarot

Cinematic Kerala-themed tarot web app with a 3D interactive parrot, shuffle/draw ritual, bilingual English + Malayalam readings, local-only optional camera capture, Web Speech narration, and downloadable share image.

## Stack

- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- Framer Motion
- React Three Fiber + drei + three
- Web Speech API (no external APIs, no backend DB)

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Flow

1. Landing cinematic intro + parrot scene
2. Setup: name, language, mood/focus, optional camera, seeded vs true random
3. Shuffle by dragging deck
4. Draw Past/Present/Future + computed Behaviour
5. Reveal with subtitles and speech
6. Results with tone toggles and share image export

## Data

Tarot cards live in `src/data/tarot.ts`.

- Includes complete 22 Major Arcana in English + Malayalam
- Shape:
  - `id`
  - `name_en`, `name_ml`
  - `meaning_upright_en`, `meaning_reversed_en`
  - `meaning_upright_ml`, `meaning_reversed_ml`
  - `keywords_en[]`, `keywords_ml[]`

To add more cards, append items with the same shape and update draw logic if you want minor arcana suit-specific behavior.

## Malayalam TTS Notes

Malayalam voice availability depends on OS/browser voice packs.

- If Malayalam voice exists, narration uses `ml-IN`
- If unavailable, app speaks English fallback and still shows Malayalam subtitles

## Privacy

- Camera is optional
- Captured image remains in browser memory only
- No image upload or server storage

## Accessibility

- Keyboard-usable controls
- Subtitles always shown
- Reduced motion respects `prefers-reduced-motion`
