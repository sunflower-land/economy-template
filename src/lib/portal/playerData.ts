import { createDefaultGuestBumpkin } from "lib/mmo/defaultGuestBumpkin";
import type { GuestBumpkinJoin } from "lib/mmo/types";
import {
  interpretTokenUri,
  tokenUriBuilder,
  type BumpkinParts,
} from "lib/utils/tokenUriBuilder";
import { decodePortalToken } from "./decodePortalToken";
import type { MinigameSessionResponse } from "./types";

const EQUIPPED_KEYS = [
  "background",
  "body",
  "hair",
  "shirt",
  "pants",
  "shoes",
  "tool",
  "hat",
  "necklace",
  "secondaryTool",
  "coat",
  "onesie",
  "suit",
  "wings",
  "dress",
  "beard",
  "aura",
] as const;

type EquippedKey = (typeof EQUIPPED_KEYS)[number];
type EquippedRecord = Partial<Record<EquippedKey, string>>;

export type PortalPlayerData = {
  username?: string;
  bumpkin: GuestBumpkinJoin;
  hasRealBumpkin: boolean;
  balances: Record<string, number>;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function pickText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function pickNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function readEquipped(input: unknown): EquippedRecord {
  const record = asRecord(input);
  if (!record) return {};
  const equipped: EquippedRecord = {};
  for (const key of EQUIPPED_KEYS) {
    const value = pickText(record[key]);
    if (value) equipped[key] = value;
  }
  return equipped;
}

function toBumpkinParts(equipped: EquippedRecord): BumpkinParts {
  return {
    background: equipped.background as BumpkinParts["background"],
    body: equipped.body as BumpkinParts["body"],
    hair: equipped.hair as BumpkinParts["hair"],
    shirt: equipped.shirt as BumpkinParts["shirt"],
    pants: equipped.pants as BumpkinParts["pants"],
    shoes: equipped.shoes as BumpkinParts["shoes"],
    tool: equipped.tool as BumpkinParts["tool"],
    hat: equipped.hat as BumpkinParts["hat"],
    necklace: equipped.necklace as BumpkinParts["necklace"],
    secondaryTool: equipped.secondaryTool as BumpkinParts["secondaryTool"],
    coat: equipped.coat as BumpkinParts["coat"],
    onesie: equipped.onesie as BumpkinParts["onesie"],
    suit: equipped.suit as BumpkinParts["suit"],
    wings: equipped.wings as BumpkinParts["wings"],
    dress: equipped.dress as BumpkinParts["dress"],
    beard: equipped.beard as BumpkinParts["beard"],
    aura: equipped.aura as BumpkinParts["aura"],
  };
}

function parseTokenUri(input: string | undefined): EquippedRecord {
  if (!input) return {};
  try {
    const { equipped } = interpretTokenUri(input);
    return readEquipped(equipped);
  } catch {
    return {};
  }
}

function resolveBumpkin(raw: unknown): GuestBumpkinJoin | undefined {
  const root = asRecord(raw);
  const tokenUri =
    pickText(raw) ??
    pickText(root?.tokenUri) ??
    pickText(asRecord(root?.properties)?.tokenUri);

  const equipped: EquippedRecord = {
    ...parseTokenUri(tokenUri),
    ...readEquipped(root?.equipped),
    ...readEquipped(root?.wearables),
    ...readEquipped(root?.clothing),
    ...readEquipped(root),
  };

  const hasWearables = Object.values(equipped).some(Boolean);
  if (!hasWearables && !tokenUri) return undefined;

  const fallback = createDefaultGuestBumpkin();
  const parts = toBumpkinParts(equipped);

  return {
    ...fallback,
    equipped: {
      ...fallback.equipped,
      ...Object.fromEntries(
        EQUIPPED_KEYS.map((key) => [key, equipped[key] ?? ""]),
      ),
    },
    experience: pickNumber(root?.experience) ?? fallback.experience,
    id: pickNumber(root?.id) ?? fallback.id,
    tokenUri: tokenUri ?? tokenUriBuilder(parts),
  };
}

function normalizeBalances(
  balances: MinigameSessionResponse["playerEconomy"]["balances"] | undefined,
): Record<string, number> {
  const normalized: Record<string, number> = {};
  for (const [token, amount] of Object.entries(balances ?? {})) {
    const numeric = typeof amount === "number" ? amount : Number(amount);
    if (Number.isFinite(numeric)) {
      normalized[token] = numeric;
    }
  }
  return normalized;
}

export function buildPortalPlayerData(input: {
  farm: MinigameSessionResponse["farm"];
  playerEconomy: MinigameSessionResponse["playerEconomy"];
  jwt: string;
}): PortalPlayerData {
  const decoded = decodePortalToken(input.jwt);
  const username = pickText(input.farm.username) ?? decoded.username;
  const resolved = resolveBumpkin(input.farm.bumpkin);

  return {
    username,
    bumpkin: resolved ?? createDefaultGuestBumpkin(),
    hasRealBumpkin: !!resolved,
    balances: normalizeBalances(input.playerEconomy.balances),
  };
}
