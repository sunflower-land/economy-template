import React, { useState } from "react";
import { createDeck, shuffle } from "../shared/deck";
import type { Card, Rank } from "../shared/deck";
import { RANKS } from "../shared/deck";
import { CardFace } from "../shared/CardFace";
import { aiChooseRank, extractSets } from "./lib/goFishLogic";

interface Props {
  onBack: () => void;
  onWin: (tokens: number) => void;
  tokenReward: number;
}

type Phase = "start" | "playerTurn" | "aiTurn" | "result";

interface State {
  playerHand: Card[];
  aiHand: Card[];
  pool: Card[];
  playerSets: Rank[];
  aiSets: Rank[];
  phase: Phase;
  message: string;
}

function dealInitial(): State {
  const deck = shuffle(createDeck());
  const playerHand = deck.slice(0, 7);
  const aiHand = deck.slice(7, 14);
  const pool = deck.slice(14);

  const pe = extractSets(playerHand);
  const ae = extractSets(aiHand);

  return {
    playerHand: pe.remaining,
    aiHand: ae.remaining,
    pool,
    playerSets: pe.sets,
    aiSets: ae.sets,
    phase: "playerTurn",
    message: "Ask the dealer for a rank!",
  };
}

export const GoFishGame: React.FC<Props> = ({ onBack, onWin, tokenReward }) => {
  const [state, setState] = useState<State | null>(null);
  const [selectedRank, setSelectedRank] = useState<Rank | null>(null);

  const start = () => {
    setState(dealInitial());
    setSelectedRank(null);
  };

  const playerRanksInHand = state
    ? [...new Set(state.playerHand.map((c) => c.rank))]
    : [];

  const ask = () => {
    if (!state || !selectedRank || state.phase !== "playerTurn") return;

    let { playerHand, aiHand, pool, playerSets, aiSets } = state;
    let message: string;

    const matching = aiHand.filter((c) => c.rank === selectedRank);
    if (matching.length > 0) {
      playerHand = [...playerHand, ...matching];
      aiHand = aiHand.filter((c) => c.rank !== selectedRank);
      message = `Got ${matching.length} ${selectedRank}(s) from the dealer!`;
    } else {
      // Go fish
      if (pool.length > 0) {
        playerHand = [...playerHand, { ...pool[0], faceUp: true }];
        pool = pool.slice(1);
      }
      message = `Go Fish! Drew a card.`;
    }

    const pe = extractSets(playerHand);
    playerSets = [...playerSets, ...pe.sets];
    playerHand = pe.remaining;

    const gameOver = pool.length === 0 && (playerHand.length === 0 || aiHand.length === 0);
    if (gameOver) {
      return finishGame({ ...state, playerHand, aiHand, pool, playerSets, aiSets });
    }

    setSelectedRank(null);
    setState({
      ...state,
      playerHand,
      aiHand,
      pool,
      playerSets,
      aiSets,
      phase: "aiTurn",
      message,
    });

    // AI turn after short delay
    setTimeout(() => {
      runAiTurn({ ...state, playerHand, aiHand, pool, playerSets, aiSets, phase: "aiTurn", message });
    }, 900);
  };

  const runAiTurn = (s: State) => {
    let { playerHand, aiHand, pool, playerSets, aiSets } = s;
    const rank = aiChooseRank(aiHand);
    let message: string;

    if (!rank) {
      message = "Dealer has no cards to ask with.";
    } else {
      const matching = playerHand.filter((c) => c.rank === rank);
      if (matching.length > 0) {
        aiHand = [...aiHand, ...matching];
        playerHand = playerHand.filter((c) => c.rank !== rank);
        message = `Dealer asked for ${rank}s and got ${matching.length} from you!`;
      } else {
        if (pool.length > 0) {
          aiHand = [...aiHand, { ...pool[0], faceUp: false }];
          pool = pool.slice(1);
        }
        message = `Dealer asked for ${rank}s — Go Fish!`;
      }
    }

    const ae = extractSets(aiHand);
    aiSets = [...aiSets, ...ae.sets];
    aiHand = ae.remaining;

    const gameOver = pool.length === 0 && (playerHand.length === 0 || aiHand.length === 0);
    const next: State = { ...s, playerHand, aiHand, pool, playerSets, aiSets, message };

    if (gameOver) {
      finishGame(next);
      return;
    }

    setState({ ...next, phase: "playerTurn" });
  };

  const finishGame = (s: State) => {
    const pWins = s.playerSets.length > s.aiSets.length;
    const tie = s.playerSets.length === s.aiSets.length;
    const msg = tie
      ? `It's a tie! Both collected ${s.playerSets.length} sets.`
      : pWins
        ? `You win! ${s.playerSets.length} sets vs dealer's ${s.aiSets.length}.`
        : `Dealer wins. ${s.aiSets.length} sets vs your ${s.playerSets.length}.`;
    setState({ ...s, phase: "result", message: msg });
    if (pWins) onWin(tokenReward);
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-[#1b1725] flex flex-col items-center p-4 text-[#f4f4f4]">
        <div className="w-full max-w-lg flex items-center gap-3 mb-4">
          <button
            type="button"
            className="rounded bg-[#3e2731] px-3 py-1 text-xs text-white hover:brightness-95"
            onClick={onBack}
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold">Go Fish</h1>
        </div>
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-sm opacity-80 text-center max-w-xs">
            Ask the dealer for cards. Collect sets of 4. Most sets wins!
          </p>
          <button
            type="button"
            className="rounded bg-[#3e8948] px-6 py-3 text-white font-bold hover:brightness-95"
            onClick={start}
          >
            Deal Cards
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1b1725] flex flex-col p-4 text-[#f4f4f4]">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded bg-[#3e2731] px-3 py-1 text-xs text-white hover:brightness-95"
            onClick={onBack}
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold">Go Fish</h1>
        </div>

        <div className="flex gap-4 text-xs opacity-70">
          <span>Your sets: {state.playerSets.length}</span>
          <span>Dealer sets: {state.aiSets.length}</span>
          <span>Pool: {state.pool.length} cards</span>
        </div>

        <div className="rounded bg-[#f09100] px-3 py-2 text-[#3e2731] text-sm">
          {state.message}
        </div>

        <section>
          <div className="text-xs mb-2 opacity-70">
            Dealer hand ({state.aiHand.length} cards)
          </div>
          <div className="flex flex-wrap gap-1">
            {state.aiHand.map((c) => (
              <CardFace key={c.id} card={{ ...c, faceUp: false }} small />
            ))}
          </div>
        </section>

        <section>
          <div className="text-xs mb-2 opacity-70">Your hand — click a rank to ask for it</div>
          <div className="flex flex-wrap gap-2">
            {state.playerHand.map((c) => (
              <CardFace
                key={c.id}
                card={c}
                small
                selected={selectedRank === c.rank}
                onClick={
                  state.phase === "playerTurn"
                    ? () => setSelectedRank(c.rank)
                    : undefined
                }
              />
            ))}
          </div>
        </section>

        {state.phase === "playerTurn" && (
          <div className="flex flex-col gap-2">
            {selectedRank && (
              <div className="text-xs opacity-70">
                Asking for: <strong>{selectedRank}</strong> — you have{" "}
                {playerRanksInHand.filter((r) => r === selectedRank).length} of them
              </div>
            )}
            <button
              type="button"
              className="rounded bg-[#1e6dd5] px-5 py-2 text-white text-sm font-bold hover:brightness-95 disabled:opacity-40"
              disabled={!selectedRank}
              onClick={ask}
            >
              Ask for {selectedRank ?? "…"}
            </button>
          </div>
        )}

        {state.phase === "result" && (
          <button
            type="button"
            className="rounded bg-[#3e8948] px-5 py-2 text-white text-sm font-bold hover:brightness-95"
            onClick={start}
          >
            Play Again
          </button>
        )}

        {(state.playerSets.length > 0 || state.aiSets.length > 0) && (
          <div className="text-xs opacity-60">
            Your sets: {state.playerSets.join(", ") || "none"} | Dealer:{" "}
            {state.aiSets.join(", ") || "none"}
          </div>
        )}
      </div>
    </div>
  );
};
