import React, { useMemo, useState } from "react";
import { minigames, prizes } from "./data/hubConfig";
import ravenCoinIcon from "./assets/RavenCoin.webp";
import ticketIcon from "./assets/nightshade_ticket.webp";
import { TileJumpApp } from "examples/tileJump/TileJumpApp";
import { HideAndSeekApp } from "examples/hideAndSeek/HideAndSeekApp";
import { BlackjackGame } from "./games/blackjack/BlackjackGame";
import { GoFishGame } from "./games/gofish/GoFishGame";
import { UnoGame } from "./games/uno/UnoGame";
import { SolitaireGame } from "./games/solitaire/SolitaireGame";
import { PokerGame } from "./games/poker/PokerGame";

const cardClass = "rounded border border-[#3e2731] bg-[#f9f4e7] p-2 text-[#3e2731]";

export const NightshadeArcadeApp: React.FC = () => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const [selectedGame, setSelectedGame] = useState(minigames[0]?.id ?? "");
  const [activePlayableGame, setActivePlayableGame] = useState<string | null>(
    null,
  );
  const [statusMessage, setStatusMessage] = useState(
    "Nightshade Arcade portal catalog imported. Select a game to preview rewards.",
  );

  const activeGame = useMemo(
    () => minigames.find((game) => game.id === selectedGame) ?? minigames[0],
    [selectedGame],
  );

  const rewardPreview = () => {
    if (!activeGame) return;

    setTokenBalance((current) => current + activeGame.tokenReward);
    setStatusMessage(
      `Reward simulated: +${activeGame.tokenReward} Raven Coins from ${activeGame.name}.`,
    );
  };

  const redeemPrize = (tokenCost: number, prizeName: string) => {
    if (tokenBalance < tokenCost) {
      setStatusMessage(
        `Need ${tokenCost - tokenBalance} more Raven Coins for ${prizeName}.`,
      );
      return;
    }

    setTokenBalance((current) => current - tokenCost);
    setStatusMessage(`Redeemed ${prizeName}. Fulfillment flow will be connected next.`);
  };

  if (activePlayableGame === "tile-jump") {
    return (
      <>
        <button
          className="fixed left-2 top-2 z-50 rounded bg-[#3e2731] px-3 py-1 text-xs text-white"
          onClick={() => setActivePlayableGame(null)}
          type="button"
        >
          ← Back to Arcade
        </button>
        <TileJumpApp />
      </>
    );
  }

  if (activePlayableGame === "hide-and-seek") {
    return (
      <>
        <button
          className="fixed left-2 top-2 z-50 rounded bg-[#3e2731] px-3 py-1 text-xs text-white"
          onClick={() => setActivePlayableGame(null)}
          type="button"
        >
          ← Back to Arcade
        </button>
        <HideAndSeekApp />
      </>
    );
  }

  if (activePlayableGame === "blackjack") {
    return (
      <BlackjackGame
        onBack={() => setActivePlayableGame(null)}
        onWin={(tokens) => {
          setTokenBalance((b) => b + tokens);
          setStatusMessage(`+${tokens} Raven Coins from Blackjack!`);
        }}
        tokenReward={minigames.find((g) => g.id === "blackjack")?.tokenReward ?? 100}
      />
    );
  }

  if (activePlayableGame === "gofish") {
    return (
      <GoFishGame
        onBack={() => setActivePlayableGame(null)}
        onWin={(tokens) => {
          setTokenBalance((b) => b + tokens);
          setStatusMessage(`+${tokens} Raven Coins from Go Fish!`);
        }}
        tokenReward={minigames.find((g) => g.id === "gofish")?.tokenReward ?? 75}
      />
    );
  }

  if (activePlayableGame === "uno") {
    return (
      <UnoGame
        onBack={() => setActivePlayableGame(null)}
        onWin={(tokens) => {
          setTokenBalance((b) => b + tokens);
          setStatusMessage(`+${tokens} Raven Coins from Uno!`);
        }}
        tokenReward={minigames.find((g) => g.id === "uno")?.tokenReward ?? 90}
      />
    );
  }

  if (activePlayableGame === "solitaire") {
    return (
      <SolitaireGame
        onBack={() => setActivePlayableGame(null)}
        onWin={(tokens) => {
          setTokenBalance((b) => b + tokens);
          setStatusMessage(`+${tokens} Raven Coins from Solitaire!`);
        }}
        tokenReward={minigames.find((g) => g.id === "solitaire")?.tokenReward ?? 70}
      />
    );
  }

  if (activePlayableGame === "poker") {
    return (
      <PokerGame
        onBack={() => setActivePlayableGame(null)}
        onWin={(tokens) => {
          setTokenBalance((b) => b + tokens);
          setStatusMessage(`+${tokens} Raven Coins from Poker!`);
        }}
        tokenReward={minigames.find((g) => g.id === "poker")?.tokenReward ?? 100}
      />
    );
  }


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
                    Reward: +{game.tokenReward} Raven Coins · Status: {game.status}
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
              {activeGame?.status === "available" && (
                <button
                  className="rounded bg-[#3e8948] px-3 py-2 text-xs text-white hover:brightness-95"
                  onClick={() => setActivePlayableGame(activeGame.id)}
                  type="button"
                >
                  Play demo
                </button>
              )}
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="m-0 text-sm">Prize Redemption</h2>
            <div className="mt-2 flex flex-col gap-2">
              {prizes.map((prize) => (
                <div key={prize.id} className="rounded border border-[#3e2731] bg-white p-2">
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
