import React, { useState } from "react";
import { createDeck, shuffle } from "../shared/deck";
import type { Card } from "../shared/deck";
import { CardFace } from "../shared/CardFace";
import { evaluateHand } from "./lib/pokerLogic";

interface Props {
  onBack: () => void;
  onWin: (tokens: number) => void;
  tokenReward: number;
}

type Phase = "start" | "preflop" | "flop" | "turn" | "river" | "showdown";

interface GameState {
  deck: Card[];
  playerHole: Card[];
  aiHole: Card[];
  community: Card[];
  pot: number;
  playerChips: number;
  aiChips: number;
  phase: Phase;
  message: string;
  betAmount: number;
}

const STARTING_CHIPS = 500;
const BIG_BLIND = 20;

function dealGame(playerChips: number, aiChips: number): GameState {
  const d = shuffle(createDeck());
  const playerHole = [{ ...d[0], faceUp: true }, { ...d[1], faceUp: true }];
  const aiHole = [{ ...d[2], faceUp: false }, { ...d[3], faceUp: false }];
  const deck = d.slice(4);
  return {
    deck,
    playerHole,
    aiHole,
    community: [],
    pot: BIG_BLIND * 2,
    playerChips: playerChips - BIG_BLIND,
    aiChips: aiChips - BIG_BLIND,
    phase: "preflop",
    message: `Pre-flop. Blinds posted (${BIG_BLIND} each). Bet, Check, or Fold.`,
    betAmount: BIG_BLIND,
  };
}

export const PokerGame: React.FC<Props> = ({ onBack, onWin, tokenReward }) => {
  const [game, setGame] = useState<GameState | null>(null);
  const [wonReported, setWonReported] = useState(false);

  const start = () => {
    setGame(dealGame(STARTING_CHIPS, STARTING_CHIPS));
    setWonReported(false);
  };

  const dealNextStreet = (g: GameState): GameState => {
    const s = { ...g, deck: [...g.deck], community: [...g.community] };
    if (s.phase === "preflop") {
      const flop = s.deck.slice(0, 3).map((c) => ({ ...c, faceUp: true }));
      s.community = [...s.community, ...flop];
      s.deck = s.deck.slice(3);
      s.phase = "flop";
      s.message = "Flop dealt. Check or Bet?";
    } else if (s.phase === "flop") {
      s.community = [...s.community, { ...s.deck[0], faceUp: true }];
      s.deck = s.deck.slice(1);
      s.phase = "turn";
      s.message = "Turn dealt. Check or Bet?";
    } else if (s.phase === "turn") {
      s.community = [...s.community, { ...s.deck[0], faceUp: true }];
      s.deck = s.deck.slice(1);
      s.phase = "river";
      s.message = "River dealt. Check or Bet?";
    } else if (s.phase === "river") {
      s.phase = "showdown";
      s.aiHole = s.aiHole.map((c) => ({ ...c, faceUp: true }));
      return showdown(s);
    }
    return s;
  };

  const showdown = (g: GameState): GameState => {
    const playerCards = [...g.playerHole, ...g.community];
    const aiCards = [...g.aiHole.map((c) => ({ ...c, faceUp: true })), ...g.community];
    const playerResult = evaluateHand(playerCards);
    const aiResult = evaluateHand(aiCards);

    let msg: string;
    let pc = g.playerChips;
    let ac = g.aiChips;

    if (playerResult.score > aiResult.score) {
      pc += g.pot;
      msg = `You win! ${playerResult.label} beats dealer's ${aiResult.label}. +${g.pot} chips.`;
    } else if (playerResult.score < aiResult.score) {
      ac += g.pot;
      msg = `Dealer wins with ${aiResult.label} over your ${playerResult.label}.`;
    } else {
      pc += Math.floor(g.pot / 2);
      ac += Math.ceil(g.pot / 2);
      msg = `Split pot! Both had ${playerResult.label}.`;
    }

    return { ...g, playerChips: pc, aiChips: ac, phase: "showdown", message: msg };
  };

  const handleBet = () => {
    if (!game) return;
    const amount = game.betAmount;
    const actual = Math.min(amount, game.playerChips);
    const aiCall = Math.min(actual, game.aiChips);
    const g = {
      ...game,
      pot: game.pot + actual + aiCall,
      playerChips: game.playerChips - actual,
      aiChips: game.aiChips - aiCall,
    };
    setGame(dealNextStreet(g));
  };

  const handleCheck = () => {
    if (!game) return;
    setGame(dealNextStreet(game));
  };

  const handleFold = () => {
    if (!game) return;
    setGame({
      ...game,
      phase: "showdown",
      aiChips: game.aiChips + game.pot,
      message: "You folded. Dealer takes the pot.",
    });
  };

  const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!game) return;
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v)) setGame({ ...game, betAmount: Math.max(BIG_BLIND, Math.min(v, game.playerChips)) });
  };

  const isShowdown = game?.phase === "showdown";
  const playerWon = isShowdown && game.playerChips > STARTING_CHIPS;

  if (isShowdown && playerWon && !wonReported) {
    setWonReported(true);
    onWin(tokenReward);
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-[#1b1725] flex flex-col items-center p-4 text-[#f4f4f4]">
        <div className="w-full max-w-lg flex items-center gap-3 mb-4">
          <button type="button" className="rounded bg-[#3e2731] px-3 py-1 text-xs text-white hover:brightness-95" onClick={onBack}>← Back</button>
          <h1 className="text-lg font-bold">Poker</h1>
        </div>
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-sm opacity-80 text-center max-w-xs">Texas Hold'em vs the dealer. You start with {STARTING_CHIPS} chips. End with more to win Raven Coins!</p>
          <button type="button" className="rounded bg-[#3e8948] px-6 py-3 text-white font-bold hover:brightness-95" onClick={start}>Deal Cards</button>
        </div>
      </div>
    );
  }

  const canAct = !isShowdown;

  return (
    <div className="min-h-screen bg-[#1b1725] flex flex-col p-4 text-[#f4f4f4]">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button type="button" className="rounded bg-[#3e2731] px-3 py-1 text-xs text-white hover:brightness-95" onClick={onBack}>← Back</button>
          <h1 className="text-lg font-bold">Poker — Texas Hold'em</h1>
        </div>

        <div className="flex gap-4 text-xs opacity-70 flex-wrap">
          <span>Your chips: <strong className="text-white">{game.playerChips}</strong></span>
          <span>Dealer chips: <strong className="text-white">{game.aiChips}</strong></span>
          <span>Pot: <strong className="text-yellow-400">{game.pot}</strong></span>
          <span>Phase: {game.phase}</span>
        </div>

        <div className="rounded bg-[#f09100] px-3 py-2 text-[#3e2731] text-sm">{game.message}</div>

        <section>
          <div className="text-xs mb-2 opacity-70">Dealer's hand</div>
          <div className="flex flex-wrap gap-2">
            {game.aiHole.map((c) => <CardFace key={c.id} card={c} />)}
          </div>
        </section>

        <section>
          <div className="text-xs mb-2 opacity-70">Community cards</div>
          <div className="flex flex-wrap gap-2 min-h-[4rem] rounded border border-white/10 p-2">
            {game.community.map((c) => <CardFace key={c.id} card={c} />)}
            {game.community.length === 0 && <span className="text-white/30 text-xs self-center">No community cards yet</span>}
          </div>
        </section>

        <section>
          <div className="text-xs mb-2 opacity-70">Your hand</div>
          <div className="flex flex-wrap gap-2">
            {game.playerHole.map((c) => <CardFace key={c.id} card={c} />)}
          </div>
        </section>

        {canAct && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-xs">Bet amount:</label>
              <input
                type="number"
                className="w-20 rounded border border-[#3e2731] bg-[#f9f4e7] px-2 py-1 text-xs text-[#3e2731]"
                value={game.betAmount}
                min={BIG_BLIND}
                max={game.playerChips}
                onChange={handleBetChange}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="button" className="rounded bg-[#1e6dd5] px-4 py-2 text-white text-xs font-bold hover:brightness-95" onClick={handleBet}>
                Bet {game.betAmount}
              </button>
              <button type="button" className="rounded bg-[#b65389] px-4 py-2 text-white text-xs font-bold hover:brightness-95" onClick={handleCheck}>
                Check / Next Street
              </button>
              <button type="button" className="rounded bg-red-700 px-4 py-2 text-white text-xs font-bold hover:brightness-95" onClick={handleFold}>
                Fold
              </button>
            </div>
          </div>
        )}

        {isShowdown && (
          <div className="flex gap-2 flex-wrap">
            <button type="button" className="rounded bg-[#3e8948] px-5 py-2 text-white text-sm font-bold hover:brightness-95" onClick={start}>Play Again</button>
          </div>
        )}
      </div>
    </div>
  );
};
