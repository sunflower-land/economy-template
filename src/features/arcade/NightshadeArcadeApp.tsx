import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "components/ui/Modal";
import { getGameEntry } from "./games/registry";
import { NightshadeArcadePhaser } from "./NightshadeArcadePhaser";
import { minigamesEventEmitter } from "./lib/minigamesEvents";
import { nightshadeArcadeEvents } from "./lib/nightshadeArcadeEvents";
import ravenCoinIcon from "./assets/RavenCoin.webp";
import { useMinigameSession } from "lib/portal";
import { submitScore } from "lib/portal/api";
import { getMinigamesApiUrl } from "lib/portal/url";

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
  const { jwt } = useMinigameSession();
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
    if (getMinigamesApiUrl() && jwt) {
      void submitScore({ token: jwt, score: tokens }).catch(() => {
        // score submission errors are non-blocking
      });
    }
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

  useEffect(() => {
    const isGameOpen = Boolean(activeEntry && ActiveGameComponent);
    nightshadeArcadeEvents.setMinigameActive(isGameOpen);

    return () => {
      nightshadeArcadeEvents.setMinigameActive(false);
    };
  }, [activeEntry, ActiveGameComponent]);

  const isLocalGame =
    activeEntry?.backingType === "local" || activeEntry?.backingType === "scaffolded";

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
      {activeEntry && ActiveGameComponent ? (
        <Modal show className="justify-stretch items-stretch bg-black/55 p-0">
          <div className="relative h-full w-full overflow-hidden">
            {!isLocalGame ? <DemoBackButton onClick={handleBack} /> : null}
            <ActiveGameComponent
              onBack={handleBack}
              onWin={(tokens) => handleWin(tokens)}
              tokenReward={activeEntry.tokenReward}
            />
          </div>
        </Modal>
      ) : null}
    </>
  );
};
