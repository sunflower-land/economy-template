import type { BumpkinParts } from "lib/utils/tokenUriBuilder";
import { tokenUriBuilder } from "lib/utils/tokenUriBuilder";

const STORAGE_KEY = "tile_jump_offline_token_parts";

const PUMPKIN_PETE: BumpkinParts = {
  body: "Light Brown Farmer Potion",
  background: "Pumpkin Plaza Background",
  hair: "Buzz Cut",
  hat: "Pumpkin Hat",
  shirt: "Yellow Farmer Shirt",
  pants: "Lumberjack Overalls",
  shoes: "Black Farmer Boots",
  tool: "Farmer Pitchfork",
};

const BETTY: BumpkinParts = {
  body: "Beige Farmer Potion",
  hair: "Rancher Hair",
  pants: "Farmer Overalls",
  shirt: "Red Farmer Shirt",
  tool: "Parsnip",
  background: "Pumpkin Plaza Background",
  shoes: "Black Farmer Boots",
};

const GORDY: BumpkinParts = {
  body: "Dark Brown Farmer Potion",
  background: "Farm Background",
  hair: "Explorer Hair",
  shirt: "SFL T-Shirt",
  pants: "Farmer Overalls",
  shoes: "Black Farmer Boots",
  tool: "Parsnip",
};

export const OFFLINE_ICONIC_BUMPKIN_TOKENS: readonly string[] = [
  tokenUriBuilder(PUMPKIN_PETE),
  tokenUriBuilder(BETTY),
  tokenUriBuilder(GORDY),
];

export function bumpkinTextureKeyForToken(token: string): string {
  return `bumpkin_${token}`;
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function getOrCreateOfflineTileJumpTokenParts(): string {
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (
      existing &&
      (OFFLINE_ICONIC_BUMPKIN_TOKENS as readonly string[]).includes(existing)
    ) {
      return existing;
    }
    const token = pick(OFFLINE_ICONIC_BUMPKIN_TOKENS);
    sessionStorage.setItem(STORAGE_KEY, token);
    return token;
  } catch {
    return OFFLINE_ICONIC_BUMPKIN_TOKENS[0];
  }
}
