import type { Card, Rank } from "../../shared/deck";

export function cardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return parseInt(rank, 10);
}

export function handValue(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (!c.faceUp) continue;
    if (c.rank === "A") aces++;
    total += cardValue(c.rank);
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

export function totalValue(cards: Card[]): number {
  const visible = cards.map((c) => ({ ...c, faceUp: true }));
  return handValue(visible);
}
