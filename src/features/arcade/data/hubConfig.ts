export interface ArcadeMinigame {
  id: string;
  name: string;
  description: string;
  tokenReward: number;
  status: "available" | "coming-soon";
}

export interface ArcadePrize {
  id: string;
  name: string;
  tokenCost: number;
  description: string;
}

export const minigames: ArcadeMinigame[] = [
  {
    id: "poker",
    name: "Poker",
    description: "Texas Hold'em against the house.",
    tokenReward: 100,
    status: "available",
  },
  {
    id: "blackjack",
    name: "Blackjack",
    description: "Beat the dealer without busting.",
    tokenReward: 100,
    status: "available",
  },
  {
    id: "gofish",
    name: "Go Fish",
    description: "Collect matching sets before your opponent.",
    tokenReward: 75,
    status: "available",
  },
  {
    id: "uno",
    name: "Uno",
    description: "Play special cards to empty your hand first.",
    tokenReward: 90,
    status: "available",
  },
  {
    id: "solitaire",
    name: "Solitaire",
    description: "Classic card-stacking challenge.",
    tokenReward: 70,
    status: "available",
  },
  {
    id: "goblin-invaders",
    name: "Goblin Invaders",
    description: "Arcade survival shooter.",
    tokenReward: 120,
    status: "coming-soon",
  },
  {
    id: "tetris",
    name: "Tetris",
    description: "Clear lines with falling blocks.",
    tokenReward: 110,
    status: "coming-soon",
  },
  {
    id: "barley-breaker",
    name: "Barley Breaker",
    description: "Classic 15-puzzle tile challenge.",
    tokenReward: 80,
    status: "coming-soon",
  },
  {
    id: "pac-man",
    name: "Pac-Man",
    description: "Navigate mazes and avoid enemies.",
    tokenReward: 95,
    status: "coming-soon",
  },
  {
    id: "frogger",
    name: "Frogger",
    description: "Cross lanes and rivers safely.",
    tokenReward: 85,
    status: "coming-soon",
  },
  {
    id: "tile-jump",
    name: "Tile Jump (Playable Demo)",
    description: "Playable minigame already wired in this repo.",
    tokenReward: 50,
    status: "available",
  },
  {
    id: "hide-and-seek",
    name: "Hide & Seek (Playable Demo)",
    description: "Playable MMO-style minigame demo.",
    tokenReward: 50,
    status: "available",
  },
];

export const prizes: ArcadePrize[] = [
  {
    id: "nightshade-ticket",
    name: "Nightshade Ticket",
    tokenCost: 125,
    description: "Special ticket from the Nightshade Arcade prize desk.",
  },
  {
    id: "honey-cake",
    name: "Honey Cake",
    tokenCost: 40,
    description: "A rare tier reward from the arcade kitchen.",
  },
  {
    id: "purple-smoothie",
    name: "Purple Smoothie",
    tokenCost: 65,
    description: "Premium smoothie reward from the portal branch catalog.",
  },
];
