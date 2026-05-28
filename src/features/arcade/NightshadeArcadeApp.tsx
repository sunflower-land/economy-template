import React, { useMemo, useState } from "react";
import { GAME_REGISTRY, getGameEntry } from "./games/registry";
import { NightshadeArcadeScenePage } from "./scene/NightshadeArcadeScenePage";

/** Back button rendered on top of demo apps that don't own their own back nav */
const DemoBackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    className="fixed left-2 top-2 z-50 rounded bg-[#3e2731] px-3 py-1 text-xs text-white"
    onClick={onClick}
    type="button"
  >
    ← Back to Arcade
  </button>
);

export const NightshadeArcadeApp: React.FC = () => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const activeEntry = useMemo(
    () => (activeGameId ? getGameEntry(activeGameId) : undefined),
    [activeGameId],
  );
  const ActiveGameComponent = activeEntry?.component;
  const playableEntries = useMemo(
    () =>
      GAME_REGISTRY.filter(
        (entry) =>
          Boolean(entry.component) &&
          (entry.status === "available" || entry.status === "scaffolded"),
      ),
    [],
  );

  const handleBack = () => {
    setActiveGameId(null);
  };

  const handleWin = (tokens: number) => {
    setTokenBalance((b) => b + tokens);
  };

  // ── Active game rendering ─────────────────────────────────────────────────
  if (activeEntry && ActiveGameComponent) {

    // "local" and "scaffolded" games own their back button via onBack prop
    const isLocalGame =
      activeEntry.backingType === "local" || activeEntry.backingType === "scaffolded";

    if (isLocalGame) {
      return (
        <ActiveGameComponent
          onBack={handleBack}
          onWin={(tokens) => handleWin(tokens)}
          tokenReward={activeEntry.tokenReward}
        />
      );
    }

    // Demo wrapper apps do not accept ArcadeGameProps — render with overlay back button
    return (
      <>
        <DemoBackButton onClick={handleBack} />
        <ActiveGameComponent
          onBack={handleBack}
          onWin={(tokens) => handleWin(tokens)}
          tokenReward={activeEntry.tokenReward}
        />
      </>
    );
  }

  return (
    <NightshadeArcadeScenePage
      games={playableEntries}
      tokenBalance={tokenBalance}
      onLaunchGame={setActiveGameId}
    />
  );
};
