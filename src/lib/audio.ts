import { Howl } from "howler";
import { AUDIO_CONFIG, type SfxKey } from "config/audio.config";

const cache = new Map<SfxKey, Howl>();

function getHowl(key: SfxKey): Howl | null {
  const def = AUDIO_CONFIG[key];
  if (!def.url?.trim()) {
    return null;
  }

  let howl = cache.get(key);
  if (!howl) {
    howl = new Howl({
      src: [def.url],
      volume: def.volume,
      preload: true,
    });
    cache.set(key, howl);
  }
  return howl;
}

/** Play a one-shot SFX if `url` is configured; otherwise no-op. */
export function playSfx(key: SfxKey): void {
  const howl = getHowl(key);
  howl?.play();
}

/** Optional: warm caches after user gesture if you add real URLs. */
export function preloadSfx(...keys: SfxKey[]): void {
  keys.forEach((k) => getHowl(k));
}
