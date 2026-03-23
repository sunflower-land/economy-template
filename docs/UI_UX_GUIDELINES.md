# UI_UX_GUIDELINES.md

> **Audience:** Human developers and coding agents extending this template.  
> **Scope:** React HUD only. Phaser in-scene UI is intentionally minimal (see `TECHNICAL.md`).

## Agent summary

Build **mobile-first**, **retro pixel** UI using the shared primitives (`Panel`, `Button`, `Label`, `Input`, `Icon`). Structure screens with **panels** as regions; use **labels** sparingly for headers and emphasis; keep **equal padding** inside containers; make **primary actions full-width** at the bottom. Popups and win/lose flows live in **React**, not Phaser.

## MUST

- Use **panels** to separate content regions (one clear job per panel).
- Use **labels** for headers, status, or emphasis — **at most 2–3 labels per screen** unless the design doc explicitly allows more.
- Apply **consistent padding** inside a container for all siblings.
- Place **call-to-action buttons** at the bottom and make them **full width** (`className` may include `w-full` on `Button`).
- Design **mobile-first** (narrow viewport first, then scale up).
- Use **vibrant** pixel-art styling consistent with Sunflower Land (borders, warm browns, readable contrast).

## MUST NOT

- Do not build full-screen flows only for desktop widths.
- Do not stack many labels; prefer body text or panel grouping instead.
- Do not put modal “app chrome” (win/lose, shop, auth nudges) inside Phaser unless `TECHNICAL.md` allows an exception.

## Primitives (this repo)

| Primitive | Role |
|-----------|------|
| `Panel` | Outer + inner bordered region for a section of UI. |
| `Button` | Primary/secondary actions; bottom CTAs full-width. |
| `Label` | Small emphasis chip (header, tag, short status). |
| `Input` | Text entry; keep labels for field purpose, not repeated decoration. |
| `Icon` | Small decorative or semantic image from `config/icons.config.ts` URLs. |

Paths: `src/components/ui/*`, icon config: `src/config/icons.config.ts`.

## Screen patterns (examples)

### Win screen

- One `Panel` with: `Label` (“You win!”), short copy, **full-width** `Button` (“Play again” / “Continue”).
- Optional second `Label` for reward summary — counts toward the 2–3 label budget.

### Lose / retry screen

- Same as win: clear title label, explanation, **full-width** retry button.

### Rules / how to play

- Use `PopupProvider` + registry (see `TECHNICAL.md`): scrollable text inside a `Panel`, dismiss `Button`.

### Shop / upgrade (stub)

- Grid or list inside `Panel`; each row: icon + name + `Button`; sticky bottom `Button` “Buy” if needed.

## Layout checklist (agents)

1. One primary action visible without scrolling on mobile.
2. Tap targets large enough for touch (full-width buttons help).
3. Z-order: popups above game; never rely on Phaser for modal stacking in this template.

## Related docs

- `TECHNICAL.md` — React vs Phaser, popups, store.
- `ART.md` — pixel assets only.
- `ARCHITECTURE.md` — where to add new UI files.
