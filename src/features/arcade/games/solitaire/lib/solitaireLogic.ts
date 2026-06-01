import type { Card, Rank, Suit } from "../../shared/deck";
import { isRed } from "../../shared/deck";
import { RANKS } from "../../shared/deck";

export interface SolitaireState {
  tableau: Card[][];
  foundations: Card[][];
  stock: Card[];
  waste: Card[];
}

export function buildSolitaire(deck: Card[]): SolitaireState {
  const tableau: Card[][] = [];
  let idx = 0;
  for (let col = 0; col < 7; col++) {
    const column: Card[] = [];
    for (let row = 0; row <= col; row++) {
      column.push({ ...deck[idx++], faceUp: row === col });
    }
    tableau.push(column);
  }
  const stock = deck.slice(idx).map((c) => ({ ...c, faceUp: false }));
  return { tableau, foundations: [[], [], [], []], stock, waste: [] };
}

export function canMoveToTableau(card: Card, column: Card[]): boolean {
  if (column.length === 0) return card.rank === "K";
  const top = column[column.length - 1];
  if (!top.faceUp) return false;
  const topIdx = RANKS.indexOf(top.rank);
  const cardIdx = RANKS.indexOf(card.rank);
  return cardIdx === topIdx - 1 && isRed(card.suit) !== isRed(top.suit);
}

export function canMoveToFoundation(card: Card, foundation: Card[]): boolean {
  if (foundation.length === 0) return card.rank === "A";
  const top = foundation[foundation.length - 1];
  if (top.suit !== card.suit) return false;
  const topIdx = RANKS.indexOf(top.rank);
  const cardIdx = RANKS.indexOf(card.rank);
  return cardIdx === topIdx + 1;
}

export function isWon(foundations: Card[][]): boolean {
  return foundations.every((f) => f.length === 13);
}

export interface CardLocation {
  area: "tableau" | "waste" | "foundation";
  colIdx: number;
  cardIdx: number;
}

/** Suit label per foundation pile (fixed slots) */
export const FOUNDATION_SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export function foundationIndexForSuit(suit: Suit): number {
  return FOUNDATION_SUITS.indexOf(suit);
}

/** Try to auto-move top of waste or tableau to a foundation. Returns new state or null. */
export function autoFoundation(state: SolitaireState): SolitaireState | null {
  const s = { ...state, foundations: state.foundations.map((f) => [...f]), tableau: state.tableau.map((c) => [...c]) };

  // Check waste top
  if (s.waste.length > 0) {
    const card = s.waste[s.waste.length - 1];
    const fIdx = foundationIndexForSuit(card.suit);
    if (canMoveToFoundation(card, s.foundations[fIdx])) {
      s.foundations[fIdx] = [...s.foundations[fIdx], { ...card }];
      s.waste = s.waste.slice(0, -1);
      return s;
    }
  }

  // Check tableau tops
  for (let c = 0; c < s.tableau.length; c++) {
    const col = s.tableau[c];
    if (col.length === 0) continue;
    const card = col[col.length - 1];
    if (!card.faceUp) continue;
    const fIdx = foundationIndexForSuit(card.suit);
    if (canMoveToFoundation(card, s.foundations[fIdx])) {
      s.foundations[fIdx] = [...s.foundations[fIdx], { ...card }];
      s.tableau[c] = col.slice(0, -1);
      if (s.tableau[c].length > 0 && !s.tableau[c][s.tableau[c].length - 1].faceUp) {
        s.tableau[c][s.tableau[c].length - 1] = { ...s.tableau[c][s.tableau[c].length - 1], faceUp: true };
      }
      return s;
    }
  }

  return null;
}

export function rankLabel(rank: Rank): string {
  return rank;
}
