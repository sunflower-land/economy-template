# ART.md

> **Audience:** Artists, designers, and agents choosing or requesting assets.

## Agent summary

Use **pixel art** only — **vibrant**, **30° top-down** farming / Sunflower Land vibe. **No** arbitrary vector illustrations or random stock photos in-game. **1 game pixel = 1 texture pixel** in Phaser (see `TECHNICAL.md` for rendering flags). **Hitboxes** hug the **base** of objects to match the perspective.

## MUST

- **Pixel art** sprites and UI chrome that match the retro panel style already in `components/ui`.
- **Preload** or reference only assets intended for the game (Phaser `preload` or URL config for HUD icons).
- Keep **collision** aligned with **footprint** at the bottom of tall sprites.

## MUST NOT

- Do not substitute **CSS gradients** or **SVG illustrations** for gameplay art.
- Do not use **non-pixel** photos as gameplay elements.
- Do not draw **maze walls, pickups, or obstacles** with Phaser **`Graphics`** (filled rects, strokes, or arbitrary vector shapes) when the template already ships **pixel resources and icons** from `@sl-assets`. Map those roles to **`RESOURCE_CONFIG`** / **`ICON_CONFIG`** (see **`src/examples/pacman/pacman.config.ts`** for the optional Bumpkin maze sample).

## Phaser characters

- **Bumpkins** in-world use **`BumpkinContainer`** (`src/game/BumpkinContainer.ts`): silhouette + shadow from `public/game/`, then the remote **animation spritesheet** from **`https://animations.sunflower-land.com`** (`getAnimationApiBase` in `lib/portal/url.ts`). Do not replace the player or NPCs with colored `Arc` / `Circle` placeholders when a bumpkin is required.

## Repo policy (this template)

- Game art is **not** committed inside the template; it is **bundled at build time** from a sibling clone of the **`images`** repo (`@sl-assets` in Vite). See root **README.md** for folder layout.
- You may still use **CDN URLs** for extra assets if you add them manually to config.

## Related docs

- `AUDIO.md` — sound style.
- `UI_UX_GUIDELINES.md` — layout with panels.
- `DESIGN.md` — world tone.
