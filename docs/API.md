# API.md

> **Audience:** Developers and agents wiring backend or mock services.

## Agent summary

All **remote** I/O for this template goes through **`src/lib/api.ts`**. The file ships with **stubs**, **fake delays**, and **TODO** comments. Player data is mocked with **`coins`** and an **`anonymous`** flag. **Trade** helpers live in the same module (no separate `trade.ts`). Replace stubs with real endpoints when you integrate Sunflower Land services.

## Current contract (template)

### `PlayerProfile`

```ts
interface PlayerProfile {
  coins: number;
  anonymous: boolean;
}
```

- **`coins`:** primary inflating currency for demos and early loops.
- **`anonymous`:** `true` when not signed in; use in UI to nudge signup (no auth in template).

### Functions (stubs)

| Function | Purpose |
|----------|---------|
| `loadPlayerProfile()` | Fetch or mock profile; hydrates game store. |
| `submitScore` | TODO — post session result. |
| `purchaseUpgrade` | TODO — spend currency / unlock. |
| `tradeCoinsForAxe` | Example **coins → tool** trade (stub). |
| `tradeAxeForWood` | Example **tool → resource** (stub). |
| `tradeWoodForCollectible` | Example **resource → collectible** (stub). |

Implementations live in **`src/lib/api.ts`**.

Visual inventory rows should use **`ResourceImage`** + **`RESOURCE_CONFIG`** (`src/config/resources.config.ts`), not ad-hoc URLs.

## Design guidance (economy)

- **Quick / inflating** resources: earned often in-session (e.g. coins from actions).
- **Slower / tradeable** resources: require time, skill, or purchase; design game loops so key moments revolve around these (see `DESIGN.md`).

## Environment

- Add real base URLs in `.env` when you connect services (see `.env.sample`).
- Do **not** commit secrets; document required vars here when you add them.

## Related docs

- `TECHNICAL.md` — hydrating `gameStore` from API.
- `ARCHITECTURE.md` — where API modules live.
