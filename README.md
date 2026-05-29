# The Nightshade Arcade

The Nightshade Arcade is a minigame hub where players earn **NIGHT** tokens and redeem them for prizes.

This repository starts from the economy-template and now includes:

- A branded base shell for **The Nightshade Arcade**
- A foundational minigame hub UI to browse games and view token balance
- A placeholder reward + prize redemption flow for economy iteration
- A migration queue scaffold for future game ports from `ispankzombiez/Sunflower-Land` (`portal` branch)

## Quick start

```bash
npm install
npm run dev
```

## Current foundation

- **App entry:** `src/App.tsx`
- **Arcade shell:** `src/features/arcade/NightshadeArcadeApp.tsx`
- **Hub config:** `src/features/arcade/data/hubConfig.ts`
- **Portal migration placeholders:** `src/features/arcade/portal/portingPlan.ts`
- **Arcade migration handoff (canonical):** `docs/arcade-migration-handoff.txt`

## Next migration step

Use `portalPortTargets` in `src/features/arcade/portal/portingPlan.ts` to track and prioritize imports from Sunflower-Land's `portal` branch as each minigame is moved into `src/features/arcade/games`.

## Hosted upload testing (Sunflower Land uploader)

For manual uploader testing at:

- `https://Nightshade-Arcade.economies.sunflower-land.com`

Use this flow:

1. Run `npm install`
2. Run `npm run build`
3. Upload the contents of `dist/` (not the project root)

Notes:

- `dist/index.html` is the required entry file at site root for the uploader.
- This project expects root-hosted static paths (`/assets`, `/game`, `/world`) for hosted upload.
- The active app entry (`src/App.tsx`) does not use `BrowserRouter`; embedded game flows use in-memory routing where needed, avoiding deep-link refresh routing issues for hosted uploads.
- Runtime minigame session uses:
  - `?jwt=...` (required for authenticated live economy session)
  - `?minigamesApiUrl=...` (optional runtime override)
  - `VITE_MINIGAMES_API_URL` (build-time fallback when query param is absent)
