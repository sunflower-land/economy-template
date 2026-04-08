import { CONFIG } from "lib/config";

/** CDN base for economy `items[token].image` paths (same layout as Sunflower Land). */
function assetBase(): string {
  return CONFIG.PROTECTED_IMAGE_URL.replace(/\/$/, "");
}

/** Stable demo art for offline ui-resources (real deployments use editor/API items). */
export function uiResourcesDemoItemImages(): Record<string, string> {
  const b = assetBase();
  return {
    COIN: `${b}/ui/coins.png`,
    SEED: `${b}/fruit/apple/apple_seed.png`,
    CROP: `${b}/crops/sprout.webp`,
    /** Generator “building” shown on the production board (cap token). */
    PLOT: `${b}/buildings/kitchen.png`,
  };
}
