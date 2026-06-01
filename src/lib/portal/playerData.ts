import { CONFIG } from "lib/config";
import {
  decodePortalToken,
  decodePortalTokenClaims,
} from "./decodePortalToken";
import { getJwt, getMinigamesApiUrl, getUrl } from "./url";
import type {
  MinigameSessionResponse,
  PortalLaunchContext,
  PortalPlayerData,
  ResolvedAvatarData,
} from "./types";

type UnknownRecord = Record<string, unknown>;

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

export function asRecord(value: unknown): UnknownRecord | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as UnknownRecord;
}

function asJsonRecord(value: unknown): UnknownRecord | undefined {
  if (typeof value === "string") {
    try {
      return asRecord(JSON.parse(value));
    } catch {
      return undefined;
    }
  }

  return asRecord(value);
}

export function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

export function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

export function toEquippedRecord(
  value: unknown,
): Record<string, string> | undefined {
  const direct = asJsonRecord(value);
  if (!direct) return undefined;

  const equipped = asJsonRecord(direct.equipped);
  if (equipped) return equipped as Record<string, string>;

  const clothing = asJsonRecord(direct.clothing);
  if (clothing) return clothing as Record<string, string>;

  const flattened = EQUIPPED_KEYS.reduce<Record<string, string>>((acc, key) => {
    const candidate = direct[key];
    if (typeof candidate === "string" && candidate) {
      acc[key] = candidate;
    }
    return acc;
  }, {});

  return Object.keys(flattened).length > 0 ? flattened : undefined;
}

export function normalizeResolvedAvatar(
  value: unknown,
  source: ResolvedAvatarData["source"],
): ResolvedAvatarData | undefined {
  if (typeof value === "string") {
    const parsed = asJsonRecord(value);
    if (parsed) {
      return normalizeResolvedAvatar(parsed, source);
    }

    const tokenUri = value.trim();
    return tokenUri ? { source, tokenUri } : undefined;
  }

  const direct = asRecord(value);
  if (!direct) return undefined;

  const nestedBumpkin = asRecord(direct.bumpkin);
  const profile = asRecord(direct.profile);
  const profileBumpkin = asRecord(profile?.bumpkin);

  const equipped =
    toEquippedRecord(direct) ??
    toEquippedRecord(nestedBumpkin) ??
    toEquippedRecord(profile) ??
    toEquippedRecord(profileBumpkin);

  const tokenUri = firstString(
    direct.tokenUri,
    direct.tokenURI,
    direct.uri,
    nestedBumpkin?.tokenUri,
    nestedBumpkin?.tokenURI,
    nestedBumpkin?.uri,
    profile?.tokenUri,
    profile?.tokenURI,
    profile?.uri,
    profileBumpkin?.tokenUri,
    profileBumpkin?.tokenURI,
    profileBumpkin?.uri,
  );

  const experience = firstNumber(
    direct.experience,
    nestedBumpkin?.experience,
    profile?.experience,
    profileBumpkin?.experience,
  );

  const id = firstNumber(
    direct.id,
    direct.bumpkinId,
    nestedBumpkin?.id,
    nestedBumpkin?.bumpkinId,
    profile?.id,
    profile?.bumpkinId,
    profileBumpkin?.id,
    profileBumpkin?.bumpkinId,
  );

  if (!equipped && !tokenUri && experience === undefined && id === undefined) {
    return undefined;
  }

  return { source, equipped, experience, id, tokenUri };
}

export function extractResolvedAvatarFromJwt(
  jwt: string,
): ResolvedAvatarData | undefined {
  const claims = decodePortalTokenClaims(jwt);
  if (!claims) return undefined;

  const candidates: unknown[] = [
    claims.bumpkin,
    claims.profile,
    asRecord(claims.profile)?.bumpkin,
    asRecord(claims.farm)?.bumpkin,
    asRecord(claims.state)?.bumpkin,
    asRecord(asRecord(claims.state)?.farm)?.bumpkin,
    asRecord(claims.game)?.bumpkin,
    asRecord(asRecord(claims.game)?.farm)?.bumpkin,
    asRecord(claims.user)?.bumpkin,
    asRecord(asRecord(claims.user)?.profile)?.bumpkin,
    asRecord(claims.properties)?.bumpkin,
    asRecord(claims.properties)?.profile,
    asRecord(asRecord(claims.properties)?.profile)?.bumpkin,
    asRecord(asRecord(claims.properties)?.state)?.bumpkin,
    asRecord(asRecord(asRecord(claims.properties)?.state)?.farm)?.bumpkin,
    claims.tokenUri,
    asRecord(claims.user)?.tokenUri,
    asRecord(claims.properties)?.tokenUri,
  ];

  return candidates
    .map((candidate) => normalizeResolvedAvatar(candidate, "jwt"))
    .find(Boolean);
}

function extractPortalFarm(portalProfile?: UnknownRecord): UnknownRecord | undefined {
  if (!portalProfile) return undefined;

  const farm = asRecord(portalProfile.farm);
  if (farm) return farm;

  const dataFarm = asRecord(asRecord(portalProfile.data)?.farm);
  if (dataFarm) return dataFarm;

  return portalProfile;
}

export function readPortalLaunchContext(): PortalLaunchContext {
  const params = new URLSearchParams(window.location.search);

  return {
    href: window.location.href,
    embedded: window.parent !== window,
    query: Object.fromEntries(params.entries()),
    jwt: getJwt() ?? undefined,
    network: params.get("network") ?? undefined,
    language: params.get("language") ?? undefined,
    font: params.get("font") ?? undefined,
    apiUrl: getUrl() ?? undefined,
    minigamesApiUrl: getMinigamesApiUrl() ?? undefined,
  };
}

function resolveProfileInventory(
  portalFarm?: UnknownRecord,
): Record<string, unknown> | undefined {
  const inventory = asRecord(portalFarm?.inventory);
  return inventory && Object.keys(inventory).length > 0 ? inventory : undefined;
}

export function buildPortalPlayerData(params: {
  jwt: string;
  portalId?: string;
  minigameSession?: MinigameSessionResponse;
  portalProfile?: UnknownRecord;
}): PortalPlayerData {
  const launchContext = readPortalLaunchContext();
  const tokenClaims = decodePortalTokenClaims(params.jwt);
  const decoded = decodePortalToken(params.jwt);
  const portalFarm = extractPortalFarm(params.portalProfile);
  const sessionFarm = asRecord(params.minigameSession?.farm);

  const farmId =
    firstNumber(
      decoded.farmId,
      sessionFarm?.id,
      sessionFarm?.farmId,
      sessionFarm?.farmID,
      sessionFarm?.fid,
      sessionFarm?.farm_id,
      portalFarm?.id,
      portalFarm?.farmId,
      portalFarm?.farmID,
      portalFarm?.fid,
      portalFarm?.farm_id,
    ) ?? 0;

  const portalId =
    firstString(params.portalId, decoded.portalId, CONFIG.PORTAL_APP) ?? "";

  const username = firstString(
    sessionFarm?.username,
    portalFarm?.username,
    portalFarm?.displayName,
    portalFarm?.name,
    decoded.username,
  );

  const balance = firstString(
    sessionFarm?.balance,
    portalFarm?.balance,
    portalFarm?.sfl,
    portalFarm?.flower,
  );

  const inventory = resolveProfileInventory(portalFarm);
  const bumpkin = sessionFarm?.bumpkin ?? portalFarm?.bumpkin;

  const portalAvatar = normalizeResolvedAvatar(portalFarm?.bumpkin ?? portalFarm, "portal");
  const sessionAvatar = normalizeResolvedAvatar(sessionFarm?.bumpkin, "session");
  const jwtAvatar = extractResolvedAvatarFromJwt(params.jwt);

  const resolvedAvatar =
    portalAvatar ??
    sessionAvatar ??
    jwtAvatar ?? {
      source: "fallback",
    };

  const source = portalFarm
    ? "portal"
    : sessionFarm
      ? "session"
      : params.jwt
        ? "jwt"
        : "offline";

  return {
    launchContext,
    tokenClaims,
    portalProfile: portalFarm,
    minigameSession: params.minigameSession,
    resolvedProfile: {
      farmId,
      portalId,
      username,
      balance,
      inventory,
      bumpkin,
      source,
    },
    resolvedAvatar,
  };
}
