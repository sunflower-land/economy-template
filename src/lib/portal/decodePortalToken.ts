/**
 * Merge top-level JWT claims with `properties` (SSO / portal tokens mirror main-game
 * `jwt-decode` handling in sunflower-land `portal.ts` / `login.ts`).
 */
function mergePortalJwtPayload(
  decoded: Record<string, unknown>,
): Record<string, unknown> {
  const props = decoded.properties;
  if (props && typeof props === "object" && !Array.isArray(props)) {
    return { ...decoded, ...(props as Record<string, unknown>) };
  }
  return { ...decoded };
}

function pickDisplayUsername(merged: Record<string, unknown>): string | undefined {
  const keys = [
    "username",
    "displayName",
    "preferred_username",
    "nickname",
    "userName",
  ] as const;
  for (const k of keys) {
    const v = merged[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  const user = merged.user;
  if (user && typeof user === "object" && !Array.isArray(user)) {
    const u = user as Record<string, unknown>;
    for (const k of keys) {
      const v = u[k];
      if (typeof v === "string" && v.trim().length > 0) return v.trim();
    }
  }
  const name = merged.name;
  if (typeof name === "string" && name.trim().length > 0) return name.trim();
  return undefined;
}

/**
 * Portal JWT payload: `farmId`, `portalId`, and optional display `username` when the
 * issuer embeds it (merged with `properties`, same idea as sunflower-land).
 */
export function decodePortalToken(token: string): {
  farmId?: number;
  portalId?: string;
  username?: string;
} {
  try {
    const merged = decodePortalTokenClaims(token);
    if (!merged) return {};
    const farmCandidates = [
      merged.farmId,
      merged.farmID,
      merged.id,
      (merged as Record<string, unknown>).fid,
      (merged as Record<string, unknown>).farm,
      (merged as Record<string, unknown>).farm_id,
    ];
    const farmRaw = farmCandidates.find(
      (value) => typeof value === "number" || typeof value === "string",
    );
    const farmId =
      typeof farmRaw === "number"
        ? farmRaw
        : typeof farmRaw === "string"
          ? Number(farmRaw)
          : undefined;
    const p = merged.portalId;
    const portalId =
      typeof p === "string" && p.trim().length > 0 ? p.trim() : undefined;
    const username = pickDisplayUsername(merged);
    return {
      farmId: Number.isFinite(farmId) ? farmId : undefined,
      portalId,
      username,
    };
  } catch {
    return {};
  }
}

export function decodePortalTokenClaims(
  token: string,
): Record<string, unknown> | null {
  try {
    const trimmed = token.trim();
    if (!trimmed) return null;
    const parts = trimmed.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = payload.length % 4;
    const padded = pad ? payload + "=".repeat(4 - pad) : payload;
    const json = atob(padded);
    const decoded = JSON.parse(json) as Record<string, unknown>;
    return mergePortalJwtPayload(decoded);
  } catch {
    return null;
  }
}
