import React, { useMemo, useState } from "react";
import { prizes } from "./data/hubConfig";
import { GAME_REGISTRY, getGameEntry } from "./games/registry";
import ravenCoinIcon from "./assets/RavenCoin.webp";
import ticketIcon from "./assets/nightshade_ticket.webp";

const cardClass = "rounded border border-[#3e2731] bg-[#f9f4e7] p-2 text-[#3e2731]";

/** Label shown in the hub game list for each status */
const STATUS_LABEL: Record<string, string> = {
  available: "Playable",
  scaffolded: "Scaffolded",
  "coming-soon": "Coming Soon",
};

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
  const [selectedGameId, setSelectedGameId] = useState(GAME_REGISTRY[0]?.id ?? "");
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    "Nightshade Arcade portal catalog imported. Select a game to preview rewards.",
  );

  const selectedEntry = useMemo(
    () => getGameEntry(selectedGameId) ?? GAME_REGISTRY[0],
    [selectedGameId],
  );
  const activeEntry = useMemo(
    () => (activeGameId ? getGameEntry(activeGameId) : undefined),
    [activeGameId],
  );
  const ActiveGameComponent = activeEntry?.component;
  const hasInvalidActiveGame = Boolean(activeGameId && !ActiveGameComponent);

  const handleBack = () => setActiveGameId(null);

  const handleWin = (tokens: number, gameName: string) => {
    setTokenBalance((b) => b + tokens);
    setStatusMessage(`+${tokens} Raven Coins from ${gameName}!`);
  };

  const rewardPreview = () => {
    if (!selectedEntry) return;
    setTokenBalance((b) => b + selectedEntry.tokenReward);
    setStatusMessage(
      `Reward simulated: +${selectedEntry.tokenReward} Raven Coins from ${selectedEntry.name}.`,
    );
  };

  const redeemPrize = (tokenCost: number, prizeName: string) => {
    if (tokenBalance < tokenCost) {
      setStatusMessage(
        `Need ${tokenCost - tokenBalance} more Raven Coins for ${prizeName}.`,
      );
      return;
    }
    setTokenBalance((b) => b - tokenCost);
    setStatusMessage(`Redeemed ${prizeName}. Fulfillment flow will be connected next.`);
  };

  // ── Active game rendering ─────────────────────────────────────────────────
  if (activeEntry && ActiveGameComponent) {

    // Arcade card games own their back button via onBack prop
    const isLocalGame =
      activeEntry.backingType === "local" || activeEntry.backingType === "scaffolded";

    if (isLocalGame) {
      return (
        <ActiveGameComponent
          onBack={handleBack}
          onWin={(tokens) => handleWin(tokens, activeEntry.name)}
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
          onWin={(tokens) => handleWin(tokens, activeEntry.name)}
          tokenReward={activeEntry.tokenReward}
        />
      </>
    );
  }

  // ── Hub view ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#1b1725] p-3 text-[#f4f4f4]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
        <section className={cardClass}>
          <h1 className="m-0 text-lg">The Nightshade Arcade</h1>
          <p className="m-0 text-xs">
            Minigame hub seeded from the Sunflower-Land portal branch catalog.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-[#b65389] px-2 py-1 text-white">
              <img alt="" className="mr-1 inline h-3 w-3" src={ravenCoinIcon} />
              Balance: {tokenBalance} Raven Coins
            </span>
            <span className="rounded bg-[#e4a672] px-2 py-1 text-[#3e2731]">
              <img alt="" className="mr-1 inline h-3 w-3" src={ticketIcon} />
              Portal catalog imported
            </span>
          </div>
          <div className="mt-2 rounded bg-[#f09100] px-2 py-1 text-xs text-[#3e2731]">
            {hasInvalidActiveGame
              ? `Selected game "${activeGameId}" is unavailable. Please choose another game from the hub.`
              : statusMessage}
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2">
          <section className={cardClass}>
            <h2 className="m-0 text-sm">Minigame Hub</h2>
            <div className="mt-2 flex flex-col gap-2">
              {GAME_REGISTRY.map((game) => (
                <button
                  key={game.id}
                  className="flex w-full cursor-pointer flex-col gap-1 rounded border border-[#3e2731] bg-white px-2 py-1 text-left hover:brightness-95"
                  onClick={() => setSelectedGameId(game.id)}
                  type="button"
                >
                  <strong className="text-xs">{game.name}</strong>
                  <span className="text-xs">{game.description}</span>
                  <span className="text-xs">
                    Reward: +{game.tokenReward} Raven Coins · Status:{" "}
                    {STATUS_LABEL[game.status] ?? game.status}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <button
                className="rounded bg-[#1e6dd5] px-3 py-2 text-xs text-white hover:brightness-95"
                onClick={rewardPreview}
                type="button"
              >
                Simulate completion
              </button>
              {(selectedEntry?.status === "available" || selectedEntry?.status === "scaffolded") && (
                <button
                  className="rounded bg-[#3e8948] px-3 py-2 text-xs text-white hover:brightness-95"
                  onClick={() => selectedEntry && setActiveGameId(selectedEntry.id)}
                  type="button"
                >
                  {selectedEntry?.status === "scaffolded" ? "Preview" : "Play demo"}
                </button>
              )}
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="m-0 text-sm">Prize Redemption</h2>
            <div className="mt-2 flex flex-col gap-2">
              {prizes.map((prize) => (
                <div
                  key={prize.id}
                  className="rounded border border-[#3e2731] bg-white p-2"
                >
                  <div className="text-xs font-bold">{prize.name}</div>
                  <div className="text-xs">{prize.description}</div>
                  <div className="mt-1 text-xs">
                    Cost: {prize.tokenCost} Raven Coins
                  </div>
                  <button
                    className="mt-2 rounded bg-[#3e8948] px-2 py-1 text-xs text-white hover:brightness-95"
                    onClick={() => redeemPrize(prize.tokenCost, prize.name)}
                    type="button"
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
