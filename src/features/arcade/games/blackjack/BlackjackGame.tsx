import React, { useState } from "react";
import { createDeck, shuffle } from "../shared/deck";
import type { Card } from "../shared/deck";
import { CardFace } from "../shared/CardFace";
import { handValue, totalValue } from "./lib/blackjackLogic";

interface Props {
  onBack: () => void;
  onWin: (tokens: number) => void;
  tokenReward: number;
}

type Phase = "bet" | "play" | "dealer" | "result";

export const BlackjackGame: React.FC<Props> = ({
  onBack,
  onWin,
  tokenReward,
}) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("bet");
  const [result, setResult] = useState("");

  const deal = () => {
    const d = shuffle(createDeck());
    const p: Card[] = [
      { ...d[0], faceUp: true },
      { ...d[2], faceUp: true },
    ];
    const dl: Card[] = [
      { ...d[1], faceUp: true },
      { ...d[3], faceUp: false },
    ];
    setDeck(d.slice(4));
    setPlayerHand(p);
    setDealerHand(dl);
    setResult("");
    setPhase("play");
  };

  const hit = () => {
    if (phase !== "play") return;
    const newCard = deck[0];
    if (!newCard) return;
    const newDeck = deck.slice(1);
    const newHand = [...playerHand, { ...newCard, faceUp: true }];
    setPlayerHand(newHand);
    setDeck(newDeck);
    if (handValue(newHand) > 21) {
      finishDealer([...dealerHand], newDeck, newHand, true);
    }
  };

  const stand = () => {
    if (phase !== "play") return;
    const revealed = dealerHand.map((c) => ({ ...c, faceUp: true }));
    setDealerHand(revealed);
    setPhase("dealer");
    runDealer(revealed, deck, playerHand);
  };

  const runDealer = (dHand: Card[], d: Card[], pHand: Card[]) => {
    let current = [...dHand];
    let remaining = [...d];
    while (totalValue(current) < 17 && remaining.length > 0) {
      current = [...current, { ...remaining[0], faceUp: true }];
      remaining = remaining.slice(1);
    }
    setDealerHand(current);
    setDeck(remaining);
    finishDealer(current, remaining, pHand, false);
  };

  const finishDealer = (
    dHand: Card[],
    _d: Card[],
    pHand: Card[],
    playerBust: boolean,
  ) => {
    const pv = totalValue(pHand);
    const dv = totalValue(dHand);
    let msg: string;
    let won = false;
    if (playerBust) {
      msg = `Bust! You had ${pv}. Dealer wins.`;
    } else if (dv > 21) {
      msg = `Dealer busts with ${dv}! You win!`;
      won = true;
    } else if (pv > dv) {
      msg = `You win! ${pv} vs ${dv}.`;
      won = true;
    } else if (pv === dv) {
      msg = `Push! Both had ${pv}.`;
    } else {
      msg = `Dealer wins. ${dv} vs ${pv}.`;
    }
    setResult(msg);
    setPhase("result");
    if (won) onWin(tokenReward);
  };

  const playerVal = handValue(playerHand);
  const dealerVisible = handValue(dealerHand.filter((c) => c.faceUp));

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
        <h1 className="text-lg font-bold">Blackjack</h1>
      </div>

      {phase === "bet" && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-sm opacity-80">
            Beat the dealer without going over 21.
          </p>
          <button
            type="button"
            className="rounded bg-[#3e8948] px-6 py-3 text-white font-bold hover:brightness-95"
            onClick={deal}
          >
            Deal Cards
          </button>
        </div>
      )}

      {phase !== "bet" && (
        <div className="w-full max-w-lg flex flex-col gap-6">
          <section>
            <div className="text-xs mb-1 opacity-70">
              Dealer {phase === "play" ? `(showing ${dealerVisible})` : `(${totalValue(dealerHand)})`}
            </div>
            <div className="flex flex-wrap gap-2">
              {dealerHand.map((c) => (
                <CardFace key={c.id} card={c} />
              ))}
            </div>
          </section>

          <section>
            <div className="text-xs mb-1 opacity-70">
              Your hand ({playerVal})
            </div>
            <div className="flex flex-wrap gap-2">
              {playerHand.map((c) => (
                <CardFace key={c.id} card={c} />
              ))}
            </div>
          </section>

          {phase === "play" && (
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded bg-[#1e6dd5] px-5 py-2 text-white text-sm font-bold hover:brightness-95"
                onClick={hit}
              >
                Hit
              </button>
              <button
                type="button"
                className="rounded bg-[#b65389] px-5 py-2 text-white text-sm font-bold hover:brightness-95"
                onClick={stand}
              >
                Stand
              </button>
            </div>
          )}

          {phase === "result" && (
            <div className="flex flex-col gap-3">
              <div className="rounded bg-[#f09100] px-3 py-2 text-[#3e2731] text-sm font-bold">
                {result}
              </div>
              <button
                type="button"
                className="rounded bg-[#3e8948] px-5 py-2 text-white text-sm font-bold hover:brightness-95"
                onClick={deal}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
