export type SecondsFormatOptions = {
  length: "short" | "medium" | "full";
  removeTrailingZeros: boolean;
};

/**
 * Compact English duration labels for generator / shop copy (template-local;
 * main game uses translated {@link secondsToString}).
 */
export function secondsToString(
  totalSeconds: number,
  options: SecondsFormatOptions,
): string {
  let sec = Math.max(0, Math.floor(totalSeconds));
  const d = Math.floor(sec / 86400);
  sec %= 86400;
  const h = Math.floor(sec / 3600);
  sec %= 3600;
  const m = Math.floor(sec / 60);
  sec %= 60;

  const parts: { v: number; u: string }[] = [];
  if (d) parts.push({ v: d, u: "d" });
  if (h) parts.push({ v: h, u: "h" });
  if (m) parts.push({ v: m, u: "m" });
  if (sec || parts.length === 0) parts.push({ v: sec, u: "s" });

  const max =
    options.length === "short" ? 1 : options.length === "medium" ? 2 : 4;
  let slice = parts.slice(0, max);

  if (options.removeTrailingZeros && slice.length > 1) {
    while (slice.length > 1 && slice[slice.length - 1].v === 0) {
      slice = slice.slice(0, -1);
    }
  }

  return slice.map((p) => `${p.v}${p.u}`).join(" ");
}
