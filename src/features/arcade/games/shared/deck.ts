export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
  id: string;
}

export const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
export const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export function createDeck(faceUp = true): Card[] {
  return SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      suit,
      rank,
      faceUp,
      id: `${rank}${suit}`,
    })),
  );
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function isRed(suit: Suit): boolean {
  return suit === "♥" || suit === "♦";
}

export function rankIndex(rank: Rank): number {
  return RANKS.indexOf(rank);
}
