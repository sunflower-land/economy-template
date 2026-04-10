import type { MinigameSessionResponse } from "lib/portal";
import { emptySessionMinigame } from "lib/portal/runtimeHelpers";

/** Offline / no economies API: empty economy; gameplay is local only. */
export function createTileJumpOfflineMinigame(
  now = Date.now(),
): MinigameSessionResponse["playerEconomy"] {
  return emptySessionMinigame(now);
}
