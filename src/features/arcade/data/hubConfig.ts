/**
 * hubConfig.ts — Arcade hub static data.
 *
 * Game metadata (id, name, description, tokenReward, status, backingType)
 * has been moved to the central game registry:
 *   src/features/arcade/games/registry.ts
 *
 * This file now owns prize redemption data only.
 * Hub-facing game lists are derived from GAME_REGISTRY at runtime so
 * registry and hub stay in sync automatically.
 */

export interface ArcadePrize {
  id: string;
  name: string;
  tokenCost: number;
  description: string;
}

export const prizes: ArcadePrize[] = [
  {
    id: "nightshade-ticket",
    name: "Nightshade Ticket",
    tokenCost: 125,
    description: "Special ticket from the Nightshade Arcade prize desk.",
  },
  {
    id: "honey-cake",
    name: "Honey Cake",
    tokenCost: 40,
    description: "A rare tier reward from the arcade kitchen.",
  },
  {
    id: "purple-smoothie",
    name: "Purple Smoothie",
    tokenCost: 65,
    description: "Premium smoothie reward from the portal branch catalog.",
  },
];
