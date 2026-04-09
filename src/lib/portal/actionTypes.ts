/**
 * Minigame economy action types. Rule payloads under each action are API-shaped;
 * see {@link EconomyActionDefinition}.
 */

export type {
  EconomyActionType,
  EconomyActionDefinition,
  PlayerEconomyActionDefinition,
} from "./playerEconomyTypes";

import type { EconomyActionDefinition } from "./playerEconomyTypes";

export type MinigameActionDefinition = EconomyActionDefinition;
