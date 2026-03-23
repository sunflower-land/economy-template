# GAME_SPEC.md

> **Living document.** Clone maintainers edit this file as the single source for **numbers**, **rules**, and **content** specific to **their** mini-game.

## Agent summary

Before changing code, update this spec when you alter: **starting resources**, **win/lose conditions**, **timers**, **costs**, **enemy counts**, or **progression tiers**. Agents should read this file when implementing balance or UI copy tied to rules.

---

## Game identity

- **Working title:** _[your game name]_
- **One-line pitch:** _[what the player does in one sentence]_

## Core loop (fill in)

1. _[Step 1 — e.g. gather resource]_
2. _[Step 2 — e.g. spend at station]_
3. _[Step 3 — e.g. unlock upgrade]_

**Target:** Player understands loop in **~10 seconds**; first full loop within **~60 seconds** (adjust in `DESIGN.md` context).

## Win / lose

- **Win condition:** _[e.g. reach score X, survive Y seconds, craft Z]_
- **Lose condition:** _[e.g. run out of lives, timer hits 0]_
- **Retry:** _[what resets vs what persists]_

## Resources

| Resource | Type (inflating / sink / tradeable) | Notes |
|----------|--------------------------------------|--------|
| Coins | | |
| _[add rows]_ | | |

## Costs & rewards

| Action / upgrade | Cost | Reward |
|------------------|------|--------|
| | | |

## Progression

- **Tier 1:** _
- **Tier 2:** _
- **Tier 3:** _

## Copy & strings

- **Welcome popup summary:** _
- **Win title:** _
- **Lose title:** _

## Out of scope (this template)

- This file does **not** replace `DESIGN.md` (philosophy) or `TECHNICAL.md` (implementation).

## Related docs

- `DESIGN.md`, `VALIDATION.md`, `API.md`
