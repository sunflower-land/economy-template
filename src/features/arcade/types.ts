import type { ComponentType } from "react";

/** Props passed to every local arcade game component */
export interface ArcadeGameProps {
  onBack: () => void;
  onWin: (tokens: number) => void;
  tokenReward: number;
}

/**
 * Implementation backing strategy.
 * - "local"      → fully playable React-native game; owns its own back button via onBack prop
 * - "scaffolded" → non-broken placeholder; owns its own back button via onBack prop
 * - "demo"       → pre-existing example app wrapped with wrapDemo(); back nav injected at hub level
 * - "portal"     → reserved for future hosted-portal integration
 */
export type ArcadeBackingType = "local" | "portal" | "scaffolded" | "demo";

/**
 * Progression status used by the hub.
 * - available: fully playable
 * - coming-soon: not yet implemented (no component rendered)
 * - scaffolded: non-broken placeholder exists with clear status message
 */
export type ArcadeGameStatus = "available" | "coming-soon" | "scaffolded";

/** Central arcade game descriptor used by the registry and the hub */
export interface ArcadeGameEntry {
  id: string;
  name: string;
  description: string;
  tokenReward: number;
  /** Hub display status */
  status: ArcadeGameStatus;
  /** Implementation strategy */
  backingType: ArcadeBackingType;
  /**
   * For local/scaffolded games: the React component to render when the game is launched.
   * Must accept ArcadeGameProps.
   */
  component?: ComponentType<ArcadeGameProps>;
  /**
   * For portal-backed games: the minigame id as registered in the
   * Sunflower-Land minigames registry (src/features/game/types/minigames.ts).
   * Source location was not verified during initial research handoff.
   */
  portalId?: string;
  /** Developer note about implementation status or source uncertainty */
  devNote?: string;
}
