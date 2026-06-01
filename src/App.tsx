import React from "react";
import { NightshadeArcadeApp } from "features/arcade";
import { MinigamePortalProvider } from "lib/portal";

export const App: React.FC = () => {
  return (
    <MinigamePortalProvider offlineActions={{}}>
      <NightshadeArcadeApp />
    </MinigamePortalProvider>
  );
};
