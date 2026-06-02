import React, { useState } from "react";
import {
  createUnoDeck,
  shuffleUno,
  canPlay,
  aiChooseCard,
  aiChooseColor,
  colorClass,
  colorEmoji,
} from "./lib/unoLogic";
import type { UnoCard, UnoColor } from "./lib/unoLogic";

interface Props {
  onBack: () => void;
  onWin: (tokens: number) => void;
  tokenReward: number;
}

type Phase =
  | "start"
  | "playerTurn"
  | "aiTurn"
  | "pickColor"
  | "result";

interface GameState {
  drawPile: UnoCard[];
  discardPile: UnoCard[];
  playerHand: UnoCard[];
  aiHand: UnoCard[];
  currentColor: UnoColor;
  phase: Phase;
  message: string;
  winner: "player" | "ai" | null;
}

function initGame(): GameState {
  const deck = shuffleUno(createUnoDeck());
  const playerHand = deck.slice(0, 7);
  const aiHand = deck.slice(7, 14);
  let rest = deck.slice(14);

  // Start discard with first non-wild card
  let startIdx = rest.findIndex((c) => c.color !== "wild");
  if (startIdx === -1) startIdx = 0;
  const startCard = rest[startIdx];
  rest = [...rest.slice(0, startIdx), ...rest.slice(startIdx + 1)];

  return {
    drawPile: rest,
    discardPile: [startCard],
    playerHand,
    aiHand,
    currentColor: startCard.color as UnoColor,
    phase: "playerTurn",
    message: `Game started! Current color: ${startCard.color}`,
    winner: null,
  };
}

function drawCard(pile: UnoCard[], count = 1): { drawn: UnoCard[]; pile: UnoCard[] } {
  if (pile.length === 0) return { drawn: [], pile };
  const drawn = pile.slice(0, count);
  return { drawn, pile: pile.slice(count) };
}

const UnoCardView: React.FC<{
  card: UnoCard;
  selected?: boolean;
  playable?: boolean;
  onClick?: () => void;
}> = ({ card, selected, playable, onClick }) => {
  const base = colorClass(card.color);
  const border = selected
    ? "ring-2 ring-yellow-300"
    : playable
      ? "ring-1 ring-white/60"
      : "opacity-50";
  return (
    <button
      type="button"
      className={`w-12 h-16 rounded text-xs font-bold flex flex-col items-center justify-center gap-0 ${base} ${border} ${onClick ? "cursor-pointer hover:brightness-90" : "cursor-default"}`}
      onClick={onClick}
      disabled={!onClick}
    >
      <span className="text-base leading-none">{card.value}</span>
    </button>
  );
};

export const UnoGame: React.FC<Props> = ({ onBack, onWin, tokenReward }) => {
  const [game, setGame] = useState<GameState | null>(null);
  const [pendingWild, setPendingWild] = useState<UnoCard | null>(null);

  const start = () => {
    setGame(initGame());
    setPendingWild(null);
  };

  const topCard = game?.discardPile[game.discardPile.length - 1];

  const playCard = (card: UnoCard) => {
    if (!game || game.phase !== "playerTurn" || !topCard) return;
    if (!canPlay(card, topCard, game.currentColor)) return;

    if (card.color === "wild") {
      setPendingWild(card);
      setGame({ ...game, phase: "pickColor", message: "Pick a color for your Wild!" });
      return;
    }

    applyPlayerCard(card, game.currentColor);
  };

  const applyPlayerCard = (card: UnoCard, chosenColor: UnoColor) => {
    if (!game) return;
    let { drawPile, playerHand, aiHand, discardPile } = game;

    playerHand = playerHand.filter((c) => c.id !== card.id);
    discardPile = [...discardPile, card];

    if (playerHand.length === 0) {
      setGame({ ...game, playerHand, discardPile, phase: "result", winner: "player", message: "UNO! You win!" });
      onWin(tokenReward);
      setPendingWild(null);
      return;
    }

    let msg = `Played ${card.value}. `;
    let skipAi = false;

    if (card.value === "Skip") {
      msg += "AI turn skipped!";
      skipAi = true;
    } else if (card.value === "Reverse") {
      msg += "Reversed! (AI skipped in 2-player)";
      skipAi = true;
    } else if (card.value === "Draw Two") {
      const { drawn, pile: newPile } = drawCard(drawPile, 2);
      aiHand = [...aiHand, ...drawn];
      drawPile = newPile;
      msg += `AI draws 2 cards!`;
      skipAi = true;
    } else if (card.value === "Wild Draw Four") {
      const { drawn, pile: newPile } = drawCard(drawPile, 4);
      aiHand = [...aiHand, ...drawn];
      drawPile = newPile;
      msg += `AI draws 4 cards!`;
      skipAi = true;
    }

    const next: GameState = {
      ...game,
      drawPile,
      playerHand,
      aiHand,
      discardPile,
      currentColor: chosenColor,
      phase: skipAi ? "playerTurn" : "aiTurn",
      message: msg,
      winner: null,
    };
    setPendingWild(null);
    setGame(next);

    if (!skipAi) {
      setTimeout(() => runAiTurn(next), 1000);
    }
  };

  const pickColor = (color: UnoColor) => {
    if (!game || !pendingWild) return;
    applyPlayerCard(pendingWild, color);
  };

  const runAiTurn = (s: GameState) => {
    if (!s.discardPile.length) return;
    const top = s.discardPile[s.discardPile.length - 1];
    let { drawPile, playerHand, aiHand, discardPile } = s;

    const chosen = aiChooseCard(aiHand, top, s.currentColor);
    let msg: string;
    let currentColor = s.currentColor;
    let skipPlayer = false;

    if (!chosen) {
      // Draw a card
      const { drawn, pile: newPile } = drawCard(drawPile);
      aiHand = [...aiHand, ...drawn];
      drawPile = newPile;
      msg = "AI drew a card.";
    } else {
      aiHand = aiHand.filter((c) => c.id !== chosen.id);
      discardPile = [...discardPile, chosen];
      if (chosen.color === "wild") {
        currentColor = aiChooseColor(aiHand);
        msg = `AI played ${chosen.value} and chose ${currentColor}!`;
      } else {
        currentColor = chosen.color;
        msg = `AI played ${chosen.value} (${chosen.color}).`;
      }

      if (chosen.value === "Skip" || chosen.value === "Reverse") {
        msg += " Your turn is skipped!";
        skipPlayer = true;
      } else if (chosen.value === "Draw Two") {
        const { drawn, pile: newPile } = drawCard(drawPile, 2);
        playerHand = [...playerHand, ...drawn];
        drawPile = newPile;
        msg += " You draw 2!";
        skipPlayer = true;
      } else if (chosen.value === "Wild Draw Four") {
        const { drawn, pile: newPile } = drawCard(drawPile, 4);
        playerHand = [...playerHand, ...drawn];
        drawPile = newPile;
        msg += " You draw 4!";
        skipPlayer = true;
      }
    }

    if (aiHand.length === 0) {
      setGame({ ...s, aiHand, discardPile, phase: "result", winner: "ai", message: "AI wins! UNO!" });
      return;
    }

    const next: GameState = {
      ...s,
      drawPile,
      playerHand,
      aiHand,
      discardPile,
      currentColor,
      phase: "playerTurn",
      message: msg + ` (AI: ${aiHand.length} cards)`,
      winner: null,
    };
    setGame(next);

    if (skipPlayer) {
      setTimeout(() => runAiTurn(next), 1000);
    }
  };

  const drawFromPile = () => {
    if (!game || game.phase !== "playerTurn") return;
    const { drawn, pile } = drawCard(game.drawPile);
    if (drawn.length === 0) return;
    const newHand = [...game.playerHand, ...drawn];
    setGame({
      ...game,
      drawPile: pile,
      playerHand: newHand,
      message: `Drew a card. You have ${newHand.length}.`,
    });
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-[#1b1725] flex flex-col items-center p-4 text-[#f4f4f4]">
        <div className="w-full max-w-lg flex items-center gap-3 mb-4">
          <button type="button" className="rounded bg-[#3e2731] px-3 py-1 text-xs text-white hover:brightness-95" onClick={onBack}>← Back</button>
          <h1 className="text-lg font-bold">Uno</h1>
        </div>
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-sm opacity-80 text-center max-w-xs">Match colors or values. Play special cards. Empty your hand to win!</p>
          <button type="button" className="rounded bg-[#3e8948] px-6 py-3 text-white font-bold hover:brightness-95" onClick={start}>Deal Cards</button>
        </div>
      </div>
    );
  }

  const playableCardIds = new Set(
    game.phase === "playerTurn" && topCard
      ? game.playerHand.filter((c) => canPlay(c, topCard, game.currentColor)).map((c) => c.id)
      : [],
  );

  return (
    <div className="min-h-screen bg-[#1b1725] flex flex-col p-4 text-[#f4f4f4]">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button type="button" className="rounded bg-[#3e2731] px-3 py-1 text-xs text-white hover:brightness-95" onClick={onBack}>← Back</button>
          <h1 className="text-lg font-bold">Uno</h1>
        </div>

        <div className="flex gap-4 text-xs opacity-70">
          <span>You: {game.playerHand.length} cards</span>
          <span>AI: {game.aiHand.length} cards</span>
          <span>Draw pile: {game.drawPile.length}</span>
          <span>Color: {colorEmoji(game.currentColor)} {game.currentColor}</span>
        </div>

        <div className="rounded bg-[#f09100] px-3 py-2 text-[#3e2731] text-sm">{game.message}</div>

        {topCard && (
          <div className="flex items-center gap-3">
            <span className="text-xs opacity-70">Top card:</span>
            <UnoCardView card={topCard} />
            <span className="text-xs opacity-70">Active color: {colorEmoji(game.currentColor)}</span>
          </div>
        )}

        {game.phase === "pickColor" && (
          <div className="flex flex-col gap-2">
            <div className="text-sm font-bold">Choose a color:</div>
            <div className="flex gap-2">
              {(["red", "green", "blue", "yellow"] as UnoColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`px-4 py-2 rounded font-bold text-sm ${colorClass(c)} hover:brightness-90`}
                  onClick={() => pickColor(c)}
                >
                  {colorEmoji(c)}
                </button>
              ))}
            </div>
          </div>
        )}

        <section>
          <div className="text-xs mb-2 opacity-70">Your hand</div>
          <div className="flex flex-wrap gap-2">
            {game.playerHand.map((c) => (
              <UnoCardView
                key={c.id}
                card={c}
                playable={playableCardIds.has(c.id)}
                onClick={
                  game.phase === "playerTurn" && playableCardIds.has(c.id)
                    ? () => playCard(c)
                    : undefined
                }
              />
            ))}
          </div>
        </section>

        {game.phase === "playerTurn" && (
          <button
            type="button"
            className="self-start rounded bg-[#3e2731] px-4 py-2 text-white text-xs hover:brightness-95"
            onClick={drawFromPile}
          >
            Draw from pile ({game.drawPile.length})
          </button>
        )}

        {game.phase === "result" && (
          <div className="flex flex-col gap-3">
            <div className="rounded bg-[#f09100] px-3 py-2 text-[#3e2731] font-bold">{game.message}</div>
            <button type="button" className="rounded bg-[#3e8948] px-5 py-2 text-white text-sm font-bold hover:brightness-95" onClick={start}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  );
};
