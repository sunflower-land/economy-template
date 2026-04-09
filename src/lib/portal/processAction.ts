/**
 * Player-economy action simulation (optimistic updates). {@link MinigameActionDefinition}
 * matches the published economy action shape from the API.
 */

export * from "./playerEconomyTypes";

export {
  processPlayerEconomyAction,
  processPlayerEconomyGeneratorCollect,
  emptyPlayerEconomyState,
  utcCalendarDay,
  rolloverDailyMintedIfNeeded,
  clonePlayerEconomyRuntimeState,
} from "./playerEconomyProcess";

import type {
  EconomyActionDefinition,
  PlayerEconomyConfig,
  PlayerEconomyRuntimeState,
} from "./playerEconomyTypes";

export type MinigameActionDefinition = EconomyActionDefinition;
export type MinigameConfig = PlayerEconomyConfig;
export type MinigameRuntimeState = PlayerEconomyRuntimeState;
