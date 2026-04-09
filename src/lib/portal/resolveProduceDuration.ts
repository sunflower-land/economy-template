/**
 * Coerce API values (numbers or numeric strings) to whole seconds.
 */
export function parseCollectRuleSeconds(raw: unknown): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.floor(n));
}

/**
 * Milliseconds until a produce job completes from `collect[outputToken].seconds`.
 */
export function resolveProduceDurationMs(
  outputToken: string,
  collect: Record<string, { seconds?: unknown }> | undefined,
): number {
  const sec = parseCollectRuleSeconds(collect?.[outputToken]?.seconds);
  if (sec !== undefined) return sec * 1000;
  return 0;
}
