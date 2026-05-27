import type { Card, Rank } from "../../shared/deck";
import { RANKS } from "../../shared/deck";

export type HandRank =
  | "Royal Flush"
  | "Straight Flush"
  | "Four of a Kind"
  | "Full House"
  | "Flush"
  | "Straight"
  | "Three of a Kind"
  | "Two Pair"
  | "Pair"
  | "High Card";

export interface HandResult {
  rank: HandRank;
  score: number;
  label: string;
}

function rankVal(rank: Rank): number {
  if (rank === "A") return 14;
  if (rank === "K") return 13;
  if (rank === "Q") return 12;
  if (rank === "J") return 11;
  return parseInt(rank, 10);
}

export function evaluateHand(cards: Card[]): HandResult {
  // Take best 5 from 7 (or all provided)
  const best = bestFive(cards);
  return classify(best);
}

function bestFive(cards: Card[]): Card[] {
  if (cards.length <= 5) return cards;
  let best: Card[] = cards.slice(0, 5);
  let bestScore = classify(best).score;
  const indices = cards.map((_, i) => i);
  // Generate all C(n,5) combinations
  for (let a = 0; a < cards.length - 4; a++) {
    for (let b = a + 1; b < cards.length - 3; b++) {
      for (let c = b + 1; c < cards.length - 2; c++) {
        for (let d = c + 1; d < cards.length - 1; d++) {
          for (let e = d + 1; e < cards.length; e++) {
            const combo = [
              cards[indices[a]],
              cards[indices[b]],
              cards[indices[c]],
              cards[indices[d]],
              cards[indices[e]],
            ];
            const s = classify(combo).score;
            if (s > bestScore) {
              bestScore = s;
              best = combo;
            }
          }
        }
      }
    }
  }
  return best;
}

function classify(five: Card[]): HandResult {
  const vals = five.map((c) => rankVal(c.rank)).sort((a, b) => b - a);
  const suits = five.map((c) => c.suit);
  const isFlush = suits.every((s) => s === suits[0]);
  const sorted = [...vals].sort((a, b) => a - b);
  const isStraight =
    sorted[4] - sorted[0] === 4 && new Set(sorted).size === 5;
  // Wheel straight A-2-3-4-5
  const isWheel =
    sorted.join() === "2,3,4,5,14" ||
    sorted.join() === [2, 3, 4, 5, 14].join();

  const counts = countValues(vals);
  const freq = Object.values(counts).sort((a, b) => b - a);

  if (isFlush && (isStraight || isWheel)) {
    if (vals[0] === 14 && !isWheel) {
      return { rank: "Royal Flush", score: 9000000, label: "Royal Flush" };
    }
    return { rank: "Straight Flush", score: 8000000 + highCard(vals), label: "Straight Flush" };
  }
  if (freq[0] === 4) return { rank: "Four of a Kind", score: 7000000 + highCard(vals), label: "Four of a Kind" };
  if (freq[0] === 3 && freq[1] === 2) return { rank: "Full House", score: 6000000 + highCard(vals), label: "Full House" };
  if (isFlush) return { rank: "Flush", score: 5000000 + highCard(vals), label: "Flush" };
  if (isStraight || isWheel) return { rank: "Straight", score: 4000000 + highCard(vals), label: "Straight" };
  if (freq[0] === 3) return { rank: "Three of a Kind", score: 3000000 + highCard(vals), label: "Three of a Kind" };
  if (freq[0] === 2 && freq[1] === 2) return { rank: "Two Pair", score: 2000000 + highCard(vals), label: "Two Pair" };
  if (freq[0] === 2) return { rank: "Pair", score: 1000000 + highCard(vals), label: "Pair" };
  return { rank: "High Card", score: highCard(vals), label: "High Card" };
}

function countValues(vals: number[]): Record<number, number> {
  const m: Record<number, number> = {};
  for (const v of vals) m[v] = (m[v] ?? 0) + 1;
  return m;
}

function highCard(vals: number[]): number {
  return vals.reduce((acc, v, i) => acc + v * Math.pow(15, 4 - i), 0);
}

export function rankLabel(r: Rank): string {
  return r;
}
