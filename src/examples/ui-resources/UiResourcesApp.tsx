import React from "react";
import { MemoryRouter } from "react-router-dom";

import { MinigamePortalProvider } from "lib/portal";
import { UiResourcesDashboard } from "./UiResourcesDashboard";
import {
  buildUiResourcesOfflineEconomyMeta,
  createUiResourcesOfflinePlayerEconomy,
  UI_RESOURCES_OFFLINE_ACTIONS,
} from "./lib/localOfflineStub";

/**
 * Player-economy dashboard minigame: renders whatever the Minigames session returns
 * (`actions`, `items`, generator rules, …). Offline stub included when no API URL.
 *
 * Swap this in for {@link examples/chickenRescue/ChickenRescueApp} in `App.tsx` to try it.
 */
export const UiResourcesApp: React.FC = () => {
  return (
    <MemoryRouter>
      <MinigamePortalProvider
        offlineActions={UI_RESOURCES_OFFLINE_ACTIONS}
        offlineMinigame={createUiResourcesOfflinePlayerEconomy}
        offlineEconomyMeta={buildUiResourcesOfflineEconomyMeta()}
      >
        <UiResourcesDashboard />
      </MinigamePortalProvider>
    </MemoryRouter>
  );
};
