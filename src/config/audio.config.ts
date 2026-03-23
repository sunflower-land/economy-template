/**
 * SFX — bundled from private `images` repo (`assets/sfx/...`).
 * See docs/AUDIO.md for style. Add keys here + `playSfx()` from `lib/audio.ts`.
 */
import buttonPlop from "@sl-assets/sfx/Fishing/Water/Farm_Game_Fishing_Water_Lure_Drop_Hit_Light_Splash_1_Plop.mp3";

export const AUDIO_CONFIG = {
  /**
   * UI / light feedback — short water “plop” (~0.2s perceived)
   * Replace with a drier click from your pack if preferred.
   */
  button: {
    url: buttonPlop,
    volume: 0.35,
    notes:
      "Fishing lure light splash #1 — example wiring only; swap for UI tick.",
  },
  /**
   * Positive feedback (collect, win sting) — set URL when you pick a clip.
   * ~0.3–0.8s recommended.
   */
  success: {
    url: "",
    volume: 0.2,
    notes: "Import an mp3 from `@sl-assets/sfx/...` and assign here.",
  },
} as const;

export type SfxKey = keyof typeof AUDIO_CONFIG;
