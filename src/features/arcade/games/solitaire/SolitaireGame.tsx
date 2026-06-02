import React, { useState } from "react";
import { createDeck, shuffle } from "../shared/deck";
import type { Card } from "../shared/deck";
import { CardFace } from "../shared/CardFace";
import {
  buildSolitaire,
  canMoveToFoundation,
  canMoveToTableau,
  foundationIndexForSuit,
  isWon,
  FOUNDATION_SUITS,
} from "./lib/solitaireLogic";
import type { SolitaireState, CardLocation } from "./lib/solitaireLogic";

interface Props {
  onBack: () => void;
  onWin: (tokens: number) => void;
  tokenReward: number;
}

function cloneState(s: SolitaireState): SolitaireState {
  return {
    tableau: s.tableau.map((c) => c.map((card) => ({ ...card }))),
    foundations: s.foundations.map((f) => f.map((card) => ({ ...card }))),
    stock: s.stock.map((c) => ({ ...c })),
    waste: s.waste.map((c) => ({ ...c })),
  };
}

export const SolitaireGame: React.FC<Props> = ({
  onBack,
  onWin,
  tokenReward,
}) => {
  const [state, setState] = useState<SolitaireState | null>(null);
  const [selected, setSelected] = useState<CardLocation | null>(null);
  const [won, setWon] = useState(false);
  const [wonReported, setWonReported] = useState(false);

  const startGame = () => {
    const deck = shuffle(createDeck(false));
    setState(buildSolitaire(deck));
    setSelected(null);
    setWon(false);
    setWonReported(false);
  };

  const checkWin = (s: SolitaireState) => {
    if (isWon(s.foundations)) {
      setWon(true);
      if (!wonReported) {
        setWonReported(true);
        onWin(tokenReward);
      }
    }
  };

  const drawFromStock = () => {
    if (!state) return;
    const s = cloneState(state);
    setSelected(null);
    if (s.stock.length === 0) {
      // Recycle waste
      s.stock = s.waste.map((c) => ({ ...c, faceUp: false })).reverse();
      s.waste = [];
    } else {
      const card = { ...s.stock[s.stock.length - 1], faceUp: true };
      s.stock = s.stock.slice(0, -1);
      s.waste = [...s.waste, card];
    }
    setState(s);
  };

  const getCardAndStack = (
    s: SolitaireState,
    loc: CardLocation,
  ): Card[] => {
    if (loc.area === "waste") {
      return s.waste.length > 0 ? [s.waste[s.waste.length - 1]] : [];
    }
    if (loc.area === "tableau") {
      return s.tableau[loc.colIdx].slice(loc.cardIdx);
    }
    if (loc.area === "foundation") {
      const f = s.foundations[loc.colIdx];
      return f.length > 0 ? [f[f.length - 1]] : [];
    }
    return [];
  };

  const handleSelect = (loc: CardLocation) => {
    if (!state) return;
    const cards = getCardAndStack(state, loc);
    if (cards.length === 0 || !cards[0].faceUp) return;

    if (!selected) {
      setSelected(loc);
      return;
    }

    // Try to move
    const s = cloneState(state);
    const movingCards = getCardAndStack(s, selected);

    if (movingCards.length === 0) {
      setSelected(loc);
      return;
    }

    const topCard = movingCards[0];

    // Move to foundation
    if (loc.area === "foundation" && movingCards.length === 1) {
      const fIdx = loc.colIdx;
      if (canMoveToFoundation(topCard, s.foundations[fIdx])) {
        applyMove(s, selected, { area: "foundation", colIdx: fIdx, cardIdx: 0 }, movingCards);
        return;
      }
    }

    // Move to tableau
    if (loc.area === "tableau") {
      const col = s.tableau[loc.colIdx];
      if (canMoveToTableau(topCard, col)) {
        applyMove(s, selected, loc, movingCards);
        return;
      }
    }

    // Deselect or change selection
    setSelected(loc);
  };

  const applyMove = (
    s: SolitaireState,
    from: CardLocation,
    to: CardLocation,
    movingCards: Card[],
  ) => {
    // Remove from source
    if (from.area === "waste") {
      s.waste = s.waste.slice(0, -1);
    } else if (from.area === "tableau") {
      s.tableau[from.colIdx] = s.tableau[from.colIdx].slice(0, from.cardIdx);
      // Flip revealed card
      const col = s.tableau[from.colIdx];
      if (col.length > 0 && !col[col.length - 1].faceUp) {
        col[col.length - 1] = { ...col[col.length - 1], faceUp: true };
      }
    } else if (from.area === "foundation") {
      s.foundations[from.colIdx] = s.foundations[from.colIdx].slice(0, -1);
    }

    // Add to destination
    if (to.area === "foundation") {
      s.foundations[to.colIdx] = [...s.foundations[to.colIdx], ...movingCards];
    } else if (to.area === "tableau") {
      s.tableau[to.colIdx] = [...s.tableau[to.colIdx], ...movingCards];
    }

    setSelected(null);
    setState(s);
    checkWin(s);
  };

  const autoMoveToFoundation = (loc: CardLocation) => {
    if (!state) return false;
    const s = cloneState(state);
    const cards = getCardAndStack(s, loc);
    if (cards.length !== 1 || !cards[0].faceUp) return false;
    const card = cards[0];
    const fIdx = foundationIndexForSuit(card.suit);
    if (!canMoveToFoundation(card, s.foundations[fIdx])) return false;
    applyMove(s, loc, { area: "foundation", colIdx: fIdx, cardIdx: 0 }, [card]);
    return true;
  };

  const handleDoubleClick = (loc: CardLocation) => {
    autoMoveToFoundation(loc);
  };

  const isSelected = (loc: CardLocation) =>
    selected?.area === loc.area &&
    selected.colIdx === loc.colIdx &&
    selected.cardIdx === loc.cardIdx;

  if (!state) {
    return (
      <div className="min-h-screen bg-[#1b1725] flex flex-col items-center p-4 text-[#f4f4f4]">
        <div className="w-full max-w-3xl flex items-center gap-3 mb-4">
          <button type="button" className="rounded bg-[#3e2731] px-3 py-1 text-xs text-white hover:brightness-95" onClick={onBack}>← Back</button>
          <h1 className="text-lg font-bold">Solitaire</h1>
        </div>
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-sm opacity-80 text-center max-w-xs">Klondike Solitaire. Move all cards to the foundations. Click to select, click again to place. Double-click to auto-move to foundation.</p>
          <button type="button" className="rounded bg-[#3e8948] px-6 py-3 text-white font-bold hover:brightness-95" onClick={startGame}>New Game</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#146b3a] flex flex-col p-2 text-[#f4f4f4]">
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" className="rounded bg-[#3e2731] px-3 py-1 text-xs text-white hover:brightness-95" onClick={onBack}>← Back</button>
          <h1 className="text-sm font-bold">Solitaire</h1>
          <button type="button" className="rounded bg-[#1e6dd5] px-3 py-1 text-xs text-white hover:brightness-95" onClick={startGame}>New Game</button>
          {won && <span className="text-xs bg-yellow-400 text-[#1a1a1a] rounded px-2 py-1 font-bold">🎉 You Won!</span>}
          {selected && <span className="text-xs opacity-70">Card selected — click destination</span>}
        </div>

        {/* Top row: stock + waste + foundations */}
        <div className="flex gap-2 items-start flex-wrap">
          {/* Stock */}
          <div
            className="w-12 h-16 rounded border-2 border-white/30 flex items-center justify-center cursor-pointer hover:brightness-90"
            onClick={drawFromStock}
          >
            {state.stock.length > 0 ? (
              <div className="w-10 h-14 rounded bg-[#b65389] flex items-center justify-center text-white text-xs font-bold">🂠</div>
            ) : (
              <span className="text-white/40 text-xs">↺</span>
            )}
          </div>

          {/* Waste */}
          <div
            className="w-12 h-16 rounded border-2 border-white/30 flex items-center justify-center cursor-pointer"
            onClick={() => state.waste.length > 0 && handleSelect({ area: "waste", colIdx: 0, cardIdx: 0 })}
          >
            {state.waste.length > 0 ? (
              <CardFace
                card={state.waste[state.waste.length - 1]}
                selected={isSelected({ area: "waste", colIdx: 0, cardIdx: 0 })}
              />
            ) : (
              <span className="text-white/30 text-xs">empty</span>
            )}
          </div>

          <div className="w-4" />

          {/* Foundations */}
          {FOUNDATION_SUITS.map((suit, fIdx) => (
            <div
              key={suit}
              className="w-12 h-16 rounded border-2 border-white/30 flex items-center justify-center cursor-pointer hover:brightness-90"
              onClick={() => {
                if (selected) {
                  handleSelect({ area: "foundation", colIdx: fIdx, cardIdx: 0 });
                }
              }}
            >
              {state.foundations[fIdx].length > 0 ? (
                <CardFace
                  card={state.foundations[fIdx][state.foundations[fIdx].length - 1]}
                  selected={isSelected({ area: "foundation", colIdx: fIdx, cardIdx: 0 })}
                />
              ) : (
                <span className="text-white/40 text-sm">{suit}</span>
              )}
            </div>
          ))}
        </div>

        {/* Tableau */}
        <div className="flex gap-1 items-start overflow-x-auto pb-2">
          {state.tableau.map((col, cIdx) => (
            <div key={cIdx} className="flex flex-col relative" style={{ minWidth: "3rem" }}>
              {col.length === 0 ? (
                <div
                  className="w-12 h-16 rounded border-2 border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/5"
                  onClick={() => selected && handleSelect({ area: "tableau", colIdx: cIdx, cardIdx: 0 })}
                >
                  <span className="text-white/20 text-xs">K</span>
                </div>
              ) : (
                col.map((card, rIdx) => (
                  <div
                    key={card.id}
                    style={{ marginTop: rIdx === 0 ? 0 : card.faceUp ? -48 : -56 }}
                    onClick={() => {
                      const loc: CardLocation = { area: "tableau", colIdx: cIdx, cardIdx: rIdx };
                      handleSelect(loc);
                    }}
                    onDoubleClick={() => {
                      const loc: CardLocation = { area: "tableau", colIdx: cIdx, cardIdx: rIdx };
                      handleDoubleClick(loc);
                    }}
                  >
                    <CardFace
                      card={card}
                      selected={isSelected({ area: "tableau", colIdx: cIdx, cardIdx: rIdx })}
                    />
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
