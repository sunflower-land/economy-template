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

## Next migration step

Use `portalPortTargets` in `src/features/arcade/portal/portingPlan.ts` to track and prioritize imports from Sunflower-Land's `portal` branch as each minigame is moved into `src/features/arcade/games`.
