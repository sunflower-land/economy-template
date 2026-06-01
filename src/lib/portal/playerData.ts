import { createDefaultGuestBumpkin } from "lib/mmo/defaultGuestBumpkin";
import type { GuestBumpkinJoin } from "lib/mmo/types";
import {
  interpretTokenUri,
  tokenUriBuilder,
  type BumpkinParts,
} from "lib/utils/tokenUriBuilder";
import { decodePortalToken, decodePortalTokenClaims } from "./decodePortalToken";
import type { MinigameSessionResponse, PortalPlayerData } from "./types";
import { getJwt, getMinigamesApiUrl, getUrl } from "./url";

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

export function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

export function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return undefined;
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

function resolveFarmId(...sources: unknown[]): number {
  for (const source of sources) {
    const farm = asRecord(source);
    if (!farm) continue;
    const candidates = [
      farm.id,
      farm.farmId,
      farm.farmID,
      farm.fid,
      farm.farm_id,
    ];
    for (const candidate of candidates) {
      const parsed =
        typeof candidate === "number"
          ? candidate
          : typeof candidate === "string"
            ? Number(candidate)
            : undefined;
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function resolveLaunchContext(input: {
  jwt: string;
  portalId?: string;
}): PortalPlayerData["launchContext"] {
  const href =
    typeof window !== "undefined" && typeof window.location?.href === "string"
      ? window.location.href
      : "";
  const query = new URL(href || "https://nightshade.invalid").searchParams;
  const queryEntries = Object.fromEntries(query.entries());
  const embedded = firstString(
    queryEntries.embedded,
    queryEntries.embed,
    queryEntries.iframe,
  );

  return {
    href,
    embedded: embedded === "1" || embedded === "true",
    query: queryEntries,
    jwt: firstString(input.jwt, queryEntries.jwt, getJwt()),
    network: firstString(queryEntries.network),
    language: firstString(queryEntries.language, queryEntries.lang),
    font: firstString(queryEntries.font),
    apiUrl: firstString(queryEntries.apiUrl, queryEntries.api, getUrl()),
    minigamesApiUrl: firstString(
      queryEntries.minigamesApiUrl,
      queryEntries.minigamesApi,
      getMinigamesApiUrl(),
    ),
  };
}

export function buildPortalPlayerData(input: {
  jwt: string;
  portalId?: string;
  minigameSession?: MinigameSessionResponse;
  portalProfile?: Record<string, unknown>;
}): PortalPlayerData {
  const tokenClaims = decodePortalTokenClaims(input.jwt);
  const decoded = decodePortalToken(input.jwt);
  const sessionFarm = asRecord(input.minigameSession?.farm);
  const portalFarm = asRecord(input.portalProfile);
  const claimsRecord = asRecord(tokenClaims);

  const profileSource = input.portalProfile
    ? "portal"
    : input.minigameSession
      ? "session"
      : tokenClaims
        ? "jwt"
        : "offline";
  const avatarSource = input.portalProfile
    ? "portal"
    : input.minigameSession
      ? "session"
      : tokenClaims
        ? "jwt"
        : "fallback";
  const resolvedFarmId = resolveFarmId(
    { farmId: decoded.farmId },
    sessionFarm,
    portalFarm,
    claimsRecord,
  );

  const resolvedProfile: PortalPlayerData["resolvedProfile"] = {
    farmId: resolvedFarmId,
    portalId: firstString(
      input.portalId,
      decoded.portalId,
      portalFarm?.portalId,
      claimsRecord?.portalId,
    ) ?? "",
    username: firstString(
      sessionFarm?.username,
      portalFarm?.username,
      portalFarm?.displayName,
      portalFarm?.name,
      decoded.username,
      claimsRecord?.username,
      claimsRecord?.preferred_username,
    ),
    balance: firstString(sessionFarm?.balance, portalFarm?.balance),
    coins: pickNumber(
      input.minigameSession?.playerEconomy?.balances?.Coin,
      portalFarm?.coins,
      asRecord(portalFarm?.inventory)?.Coin,
    ),
    inventory: asRecord(portalFarm?.inventory),
    bumpkin:
      input.minigameSession?.farm.bumpkin ??
      portalFarm?.bumpkin ??
      claimsRecord?.bumpkin,
    source: profileSource,
  };

  const resolvedBumpkin =
    resolveBumpkin(resolvedProfile.bumpkin) ??
    resolveBumpkin(claimsRecord?.avatar) ??
    resolveBumpkin(claimsRecord?.tokenUri);
  const fallbackBumpkin = createDefaultGuestBumpkin();
  const bumpkin = resolvedBumpkin ?? fallbackBumpkin;

  return {
    launchContext: resolveLaunchContext(input),
    tokenClaims,
    portalProfile: input.portalProfile,
    minigameSession: input.minigameSession,
    resolvedProfile,
    resolvedAvatar: {
      equipped: bumpkin.equipped,
      experience: bumpkin.experience,
      id: bumpkin.id,
      tokenUri: bumpkin.tokenUri,
      source: resolvedBumpkin ? avatarSource : "fallback",
    },
  };
}
