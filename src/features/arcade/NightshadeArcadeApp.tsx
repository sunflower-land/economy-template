import React, { useEffect, useMemo, useState } from "react";
import { getGameEntry } from "./games/registry";
import { NightshadeArcadePhaser } from "./NightshadeArcadePhaser";
import { minigamesEventEmitter } from "./lib/minigamesEvents";
import ravenCoinIcon from "./assets/RavenCoin.webp";

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

  const handleBack = () => {
    setActiveGameId(null);
  };

  const handleWin = (tokens: number) => {
    setTokenBalance((b) => b + tokens);
  };

  useEffect(() => {
    const openMinigame = (id: string) => setActiveGameId(id);

    const unsubscribePoker = minigamesEventEmitter.subscribe("poker", () =>
      openMinigame("poker"),
    );
    const unsubscribeBlackjack = minigamesEventEmitter.subscribe(
      "blackjack",
      () => openMinigame("blackjack"),
    );
    const unsubscribeGoFish = minigamesEventEmitter.subscribe("gofish", () =>
      openMinigame("gofish"),
    );
    const unsubscribeUno = minigamesEventEmitter.subscribe("uno", () =>
      openMinigame("uno"),
    );
    const unsubscribeSolitaire = minigamesEventEmitter.subscribe(
      "solitaire",
      () => openMinigame("solitaire"),
    );
    const unsubscribeGoblinInvaders = minigamesEventEmitter.subscribe(
      "goblin-invaders",
      () => openMinigame("goblin-invaders"),
    );
    const unsubscribeTetris = minigamesEventEmitter.subscribe("tetris", () =>
      openMinigame("tetris"),
    );
    const unsubscribeBarleyBreaker = minigamesEventEmitter.subscribe(
      "barley-breaker",
      () => openMinigame("barley-breaker"),
    );
    const unsubscribePacMan = minigamesEventEmitter.subscribe("pac-man", () =>
      openMinigame("pac-man"),
    );
    const unsubscribeFrogger = minigamesEventEmitter.subscribe("frogger", () =>
      openMinigame("frogger"),
    );

    return () => {
      unsubscribePoker();
      unsubscribeBlackjack();
      unsubscribeGoFish();
      unsubscribeUno();
      unsubscribeSolitaire();
      unsubscribeGoblinInvaders();
      unsubscribeTetris();
      unsubscribeBarleyBreaker();
      unsubscribePacMan();
      unsubscribeFrogger();
    };
  }, []);

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
    <>
      <NightshadeArcadePhaser />
      <div className="pointer-events-none fixed left-3 top-3 z-20 flex flex-col gap-1">
        <div className="rounded bg-black/55 px-3 py-2 text-xs text-white">
          <div className="font-semibold">Nightshade Arcade</div>
          <div className="text-[11px] text-[#e6bfd4]">
            Walk to a machine and click it to play
          </div>
        </div>
        <div className="rounded bg-[#b65389]/90 px-3 py-1 text-xs text-white">
          <img alt="" className="mr-1 inline h-3 w-3" src={ravenCoinIcon} />
          {tokenBalance} Raven Coins
        </div>
      </div>
    </>
  );
};
