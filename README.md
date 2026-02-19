# Jyothisham Parrot Tarot

Interactive Kerala-style tarot experience built with Next.js 14, TypeScript, Tailwind, Framer Motion, and react-three-fiber.

## Features

- Cinematic landing and 3D parrot scene
- Name + DOB input
- Optional local camera capture with explicit upload consent toggle
- Shuffle ritual and parrot card pick flow
- EN + മലയാളം reading blocks (past, present, future, behaviour, advice)
- Funny parrot commentary lines
- Server route for OpenAI Responses API with strict JSON parsing + retry
- Server route for OpenAI TTS (`gpt-4o-mini-tts`) with browser Web Speech fallback
- Session save to `localStorage` + share card image download

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Environment variables

- `OPENAI_API_KEY` (optional, enables AI reading + TTS)
- `OPENAI_READING_MODEL` (optional, default `gpt-4o-mini`)

Without API key, app falls back to local deterministic reading + browser speech.

## API routes

- `POST /api/reading`
  - input: `{ name, dob, selectedCardId, includeImageForAi, imageBase64 }`
  - output: structured bilingual reading JSON
- `POST /api/tts`
  - input: `{ text, language }`
  - output: `{ fallback }` or base64 MP3 payload

## Replacing parrot model

Current app uses procedural low-poly mesh parrot for zero-asset startup.
To switch to a GLB, place model at `public/models/parrot.glb` and update `ParrotScene` loader logic.
