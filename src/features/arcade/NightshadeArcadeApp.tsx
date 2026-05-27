import React, { useMemo, useState } from "react";
import { minigames, prizes } from "./data/hubConfig";
import { portalPortTargets } from "./portal/portingPlan";

const cardClass = "rounded border border-[#3e2731] bg-[#f9f4e7] p-2 text-[#3e2731]";

export const NightshadeArcadeApp: React.FC = () => {
  const [tokenBalance, setTokenBalance] = useState(40);
  const [selectedGame, setSelectedGame] = useState(minigames[0]?.id ?? "");
  const [statusMessage, setStatusMessage] = useState(
    "Pick a minigame to preview rewards.",
  );

  const activeGame = useMemo(
    () => minigames.find((game) => game.id === selectedGame) ?? minigames[0],
    [selectedGame],
  );

  const rewardPreview = () => {
    if (!activeGame) return;

    setTokenBalance((current) => current + activeGame.tokenReward);
    setStatusMessage(
      `Reward simulated: +${activeGame.tokenReward} NIGHT from ${activeGame.name}.`,
    );
  };

  const redeemPrize = (tokenCost: number, prizeName: string) => {
    if (tokenBalance < tokenCost) {
      setStatusMessage(`Need ${tokenCost - tokenBalance} more NIGHT for ${prizeName}.`);
      return;
    }

    setTokenBalance((current) => current - tokenCost);
    setStatusMessage(`Redeemed ${prizeName}. Fulfillment flow will be connected next.`);
  };

  return (
    <div className="min-h-screen bg-[#1b1725] p-3 text-[#f4f4f4]">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
        <section className={cardClass}>
          <h1 className="m-0 text-lg">The Nightshade Arcade</h1>
          <p className="m-0 text-xs">
            Minigame hub foundation with token rewards and prize redemption
            placeholders.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-[#b65389] px-2 py-1 text-white">
              Token Balance: {tokenBalance} NIGHT
            </span>
            <span className="rounded bg-[#e4a672] px-2 py-1 text-[#3e2731]">
              Portal migration scaffolding ready
            </span>
          </div>
          <div className="mt-2 rounded bg-[#f09100] px-2 py-1 text-xs text-[#3e2731]">
            {statusMessage}
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-2">
          <section className={cardClass}>
            <h2 className="m-0 text-sm">Minigame Hub</h2>
            <div className="mt-2 flex flex-col gap-2">
              {minigames.map((game) => (
                <button
                  key={game.id}
                  className="flex w-full cursor-pointer flex-col gap-1 rounded border border-[#3e2731] bg-white px-2 py-1 text-left hover:brightness-95"
                  onClick={() => setSelectedGame(game.id)}
                  type="button"
                >
                  <strong className="text-xs">{game.name}</strong>
                  <span className="text-xs">{game.description}</span>
                  <span className="text-xs">
                    Reward: +{game.tokenReward} NIGHT · Status: {game.status}
                  </span>
                </button>
              ))}
            </div>
            <button
              className="mt-2 rounded bg-[#1e6dd5] px-3 py-2 text-xs text-white hover:brightness-95"
              onClick={rewardPreview}
              type="button"
            >
              Simulate minigame completion
            </button>
          </section>

          <section className={cardClass}>
            <h2 className="m-0 text-sm">Prize Redemption</h2>
            <div className="mt-2 flex flex-col gap-2">
              {prizes.map((prize) => (
                <div key={prize.id} className="rounded border border-[#3e2731] bg-white p-2">
                  <div className="text-xs font-bold">{prize.name}</div>
                  <div className="text-xs">{prize.description}</div>
                  <div className="mt-1 text-xs">Cost: {prize.tokenCost} NIGHT</div>
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

        <section className={cardClass}>
          <h2 className="m-0 text-sm">Sunflower-Land Portal Porting Queue</h2>
          <p className="m-0 text-xs">
            Structured placeholders to track upcoming game migrations.
          </p>
          <div className="mt-2 flex flex-col gap-2">
            {portalPortTargets.map((target) => (
              <div
                key={target.id}
                className="rounded border border-[#3e2731] bg-white px-2 py-1 text-xs"
              >
                <strong>{target.sourcePath}</strong> → {target.targetModule} ({target.status})
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
