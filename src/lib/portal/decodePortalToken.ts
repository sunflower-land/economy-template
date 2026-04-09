/**
 * Portal JWT payload: `farmId` and `portalId` at the top level of the decoded JSON.
 */
export function decodePortalToken(token: string): {
  farmId?: number;
  portalId?: string;
} {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return {};
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = payload.length % 4;
    const padded = pad ? payload + "=".repeat(4 - pad) : payload;
    const json = atob(padded);
    const decoded = JSON.parse(json) as Record<string, unknown>;
    const farmRaw = decoded.farmId;
    const farmId =
      typeof farmRaw === "number"
        ? farmRaw
        : typeof farmRaw === "string"
          ? Number(farmRaw)
          : undefined;
    const p = decoded.portalId;
    const portalId =
      typeof p === "string" && p.trim().length > 0 ? p.trim() : undefined;
    return {
      farmId: Number.isFinite(farmId) ? farmId : undefined,
      portalId,
    };
  } catch {
    return {};
  }
}
