import type { Card, Rank } from "../../shared/deck";

export function groupByRank(hand: Card[]): Map<Rank, Card[]> {
  const map = new Map<Rank, Card[]>();
  for (const c of hand) {
    if (!map.has(c.rank)) map.set(c.rank, []);
    map.get(c.rank)!.push(c);
  }
  return map;
}

/** Remove completed sets (4 of a kind) from hand, return { sets, remaining } */
export function extractSets(hand: Card[]): { sets: Rank[]; remaining: Card[] } {
  const groups = groupByRank(hand);
  const sets: Rank[] = [];
  const remaining: Card[] = [];
  for (const [rank, cards] of groups) {
    if (cards.length >= 4) {
      sets.push(rank);
    } else {
      remaining.push(...cards);
    }
  }
  return { sets, remaining };
}

/** AI picks a rank to ask for — prefers ranks it has more of */
export function aiChooseRank(aiHand: Card[]): Rank | null {
  const groups = groupByRank(aiHand);
  if (groups.size === 0) return null;
  let best: Rank | null = null;
  let bestCount = 0;
  for (const [rank, cards] of groups) {
    if (cards.length > bestCount) {
      bestCount = cards.length;
      best = rank;
    }
  }
  return best;
}
