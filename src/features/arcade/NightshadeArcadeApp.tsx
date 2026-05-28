import React, { useEffect, useState } from "react";
import { getGameEntry } from "./games/registry";
import ravenCoinIcon from "./assets/RavenCoin.webp";
import { NightshadeArcadePhaser } from "./NightshadeArcadePhaser";
import { minigamesEventEmitter } from "./lib/minigamesEvents";
import { nightshadeArcadeEvents } from "./lib/nightshadeArcadeEvents";

/** Back button rendered on top of game apps that don't own their own back nav */
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

  const handleBack = () => {
    nightshadeArcadeEvents.setMinigameActive(false);
    setActiveGameId(null);
  };

  const handleWin = (tokens: number) => {
    setTokenBalance((b) => b + tokens);
  };

  useEffect(() => {
    // Subscribe to all machine click events from the Phaser scene
    const gameTypes = [
      "poker",
      "blackjack",
      "gofish",
      "uno",
      "solitaire",
      "goblin-invaders",
      "tetris",
      "pac-man",
      "barley-breaker",
      "frogger",
    ] as const;

    const unsubs = gameTypes.map((type) =>
      minigamesEventEmitter.subscribe(type, () => {
        nightshadeArcadeEvents.setMinigameActive(true);
        setActiveGameId(type);
      }),
    );

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // ── Active game overlay ──────────────────────────────────────────────────
  if (activeGameId) {
    const entry = getGameEntry(activeGameId);
    const Component = entry?.component;

    if (!Component) {
      // Unknown id — return to arcade
      setActiveGameId(null);
      nightshadeArcadeEvents.setMinigameActive(false);
      return null;
    }

    const isLocalGame =
      entry.backingType === "local" || entry.backingType === "scaffolded";

    if (isLocalGame) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#000",
          }}
        >
          <Component
            onBack={handleBack}
            onWin={(tokens) => handleWin(tokens)}
            tokenReward={entry.tokenReward}
          />
        </div>
      );
    }

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          background: "#000",
        }}
      >
        <DemoBackButton onClick={handleBack} />
        <Component
          onBack={handleBack}
          onWin={(tokens) => handleWin(tokens)}
          tokenReward={entry.tokenReward}
        />
      </div>
    );
  }

  // ── Arcade scene (Phaser canvas + HUD overlay) ───────────────────────────
  return (
    <>
      <NightshadeArcadePhaser />

      {/* Token balance HUD overlay */}
      <div
        style={{
          position: "fixed",
          top: 8,
          right: 8,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(30,0,40,0.75)",
          borderRadius: 6,
          padding: "4px 10px",
          fontSize: 13,
          color: "#f4f4f4",
          pointerEvents: "none",
        }}
      >
        <img alt="Raven Coin" src={ravenCoinIcon} style={{ width: 16, height: 16 }} />
        <span>{tokenBalance} Raven Coins</span>
      </div>
    </>
  );
};

