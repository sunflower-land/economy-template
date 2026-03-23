# AUDIO.md

> **Audience:** Sound design and agents triggering feedback.

## Agent summary

Sounds should be **short**, **bright**, and **friendly** — arcade / farm toy, **not** hyper-realistic. Map every clip in **`src/config/audio.config.ts`** with comments (intent, approximate duration). Playback goes through **`src/lib/audio.ts`** (Howler). **Do not** commit audio binaries here; URLs point to another repo or CDN.

## Style

- **UI:** light clicks, soft confirms, cheerful win stings.
- **Gameplay:** short feedback (collect, hit, complete); avoid long loops unless ambient is explicitly designed.
- **Avoid:** realistic foley, harsh bass, long unskippable jingles on repeat.

## Implementation

1. Add a key to `AUDIO_CONFIG` in `src/config/audio.config.ts` with `url`, `volume`, and comments.
2. Call `playSfx("yourKey")` or `preloadSfx()` as documented in `audio.ts`.

## Related docs

- `ART.md`, `TECHNICAL.md`
