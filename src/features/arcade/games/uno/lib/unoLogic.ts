export type UnoColor = "red" | "green" | "blue" | "yellow" | "wild";
export type UnoValue =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "Skip"
  | "Reverse"
  | "Draw Two"
  | "Wild"
  | "Wild Draw Four";

export interface UnoCard {
  id: string;
  color: UnoColor;
  value: UnoValue;
}

const COLORS: UnoColor[] = ["red", "green", "blue", "yellow"];
const NUMBERED: UnoValue[] = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];
const ACTION: UnoValue[] = ["Skip", "Reverse", "Draw Two"];

let _uid = 0;
function uid() {
  return `u${++_uid}`;
}

export function createUnoDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  for (const color of COLORS) {
    // One "0", two of each 1-9 and action
    for (const value of NUMBERED) {
      deck.push({ id: uid(), color, value });
      if (value !== "0") deck.push({ id: uid(), color, value });
    }
    for (const value of ACTION) {
      deck.push({ id: uid(), color, value });
      deck.push({ id: uid(), color, value });
    }
  }
  // 4 Wild, 4 Wild Draw Four
  for (let i = 0; i < 4; i++) {
    deck.push({ id: uid(), color: "wild", value: "Wild" });
    deck.push({ id: uid(), color: "wild", value: "Wild Draw Four" });
  }
  return deck;
}

export function shuffleUno<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function canPlay(
  card: UnoCard,
  topCard: UnoCard,
  currentColor: UnoColor,
): boolean {
  if (card.color === "wild") return true;
  if (card.color === currentColor) return true;
  if (card.value === topCard.value) return true;
  return false;
}

/** Simple AI: play first matching card, prefer action cards, prefer wilds last */
export function aiChooseCard(
  hand: UnoCard[],
  topCard: UnoCard,
  currentColor: UnoColor,
): UnoCard | null {
  const playable = hand.filter((c) => canPlay(c, topCard, currentColor));
  if (playable.length === 0) return null;
  // Prefer non-wild action cards, then numbered, then wilds
  const actions = playable.filter(
    (c) => c.color !== "wild" && ACTION.includes(c.value as UnoValue),
  );
  if (actions.length > 0) return actions[0];
  const numbered = playable.filter((c) => c.color !== "wild");
  if (numbered.length > 0) return numbered[0];
  return playable[0];
}

/** AI chooses a color when playing a wild */
export function aiChooseColor(hand: UnoCard[]): UnoColor {
  const counts: Record<UnoColor, number> = {
    red: 0,
    green: 0,
    blue: 0,
    yellow: 0,
    wild: 0,
  };
  for (const c of hand) counts[c.color]++;
  const best = (["red", "green", "blue", "yellow"] as UnoColor[]).reduce(
    (a, b) => (counts[a] >= counts[b] ? a : b),
  );
  return best;
}

export function colorEmoji(color: UnoColor): string {
  switch (color) {
    case "red":
      return "🔴";
    case "green":
      return "🟢";
    case "blue":
      return "🔵";
    case "yellow":
      return "🟡";
    default:
      return "⚫";
  }
}

export function colorClass(color: UnoColor): string {
  switch (color) {
    case "red":
      return "bg-red-600 text-white";
    case "green":
      return "bg-green-600 text-white";
    case "blue":
      return "bg-blue-600 text-white";
    case "yellow":
      return "bg-yellow-400 text-[#1a1a1a]";
    default:
      return "bg-[#1a1a1a] text-white";
  }
}
