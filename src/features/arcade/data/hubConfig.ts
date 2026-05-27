export interface ArcadeMinigame {
  id: string;
  name: string;
  description: string;
  tokenReward: number;
  status: "coming-soon" | "ready-for-port";
}

export interface ArcadePrize {
  id: string;
  name: string;
  tokenCost: number;
  description: string;
}

export const minigames: ArcadeMinigame[] = [
  {
    id: "portal-hub-1",
    name: "Shadow Sprint",
    description: "Fast-paced time trial challenge.",
    tokenReward: 10,
    status: "coming-soon",
  },
  {
    id: "portal-hub-2",
    name: "Midnight Match",
    description: "Pattern memory minigame.",
    tokenReward: 15,
    status: "ready-for-port",
  },
  {
    id: "portal-hub-3",
    name: "Cryptic Clicker",
    description: "Arcade click challenge with score multipliers.",
    tokenReward: 8,
    status: "ready-for-port",
  },
];

export const prizes: ArcadePrize[] = [
  {
    id: "prize-1",
    name: "Neon Ticket",
    tokenCost: 25,
    description: "Exchange tokens for a raffle-ready ticket.",
  },
  {
    id: "prize-2",
    name: "Nightshade Crate",
    tokenCost: 60,
    description: "Mystery crate placeholder for future rewards.",
  },
  {
    id: "prize-3",
    name: "Arcade VIP Pass",
    tokenCost: 100,
    description: "Premium pass placeholder for special events.",
  },
];
