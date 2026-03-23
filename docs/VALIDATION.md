# VALIDATION.md

> **Audience:** Humans shipping a fork of this template. **Not** automated CI (unless you add it later).

## Agent summary

Before calling a mini-game **shippable**, a human must manually confirm the checklist below. Agents should not claim “done” without pointing a maintainer at this list.

## Pre-ship checklist (manual)

### Playability

- [ ] Game **loads** without console errors in a clean browser profile.
- [ ] **First session** can be played **end-to-end** (see `GAME_SPEC.md` win condition).
- [ ] **Anonymous** user can complete at least one core loop (if applicable).

### Win / lose / retry

- [ ] **Win state** is visible (screen or popup) and matches `GAME_SPEC.md`.
- [ ] **Lose state** is visible when fail condition triggers.
- [ ] **Retry** path exists and resets the correct state (per spec — lives, level, inventory).

### Economy & persistence (if implemented)

- [ ] **Coins** (or primary currency) update in UI when earned/spent.
- [ ] **API** errors show a safe message (no stack traces to players).

### UI / mobile

- [ ] **Primary action** reachable on a **narrow** viewport without horizontal scroll.
- [ ] Popups **dismiss** reliably; only **one** popup at a time (template constraint).

### Content & tone

- [ ] Copy is **PG** and **brief** (`DESIGN.md`).
- [ ] No placeholder **TODO** left in user-visible strings.

### Performance (smoke)

- [ ] No obvious **memory** growth over 10 minutes of casual play (subjective check).

## Related docs

- `GAME_SPEC.md` — what “win” and “retry” mean for your game.
- `UI_UX_GUIDELINES.md` — win/lose presentation.
