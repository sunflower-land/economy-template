import React from "react";
import { ArcadeGameShell } from "../../components/ArcadeGameShell";
import type { ArcadeGameProps } from "../../types";

/**
 * Pac-Man — scaffolded placeholder.
 *
 * Status: NOT YET IMPLEMENTED (scaffolded)
 *
 * Source verification note:
 *   - Minigame id `pac-man` is listed in the migration checklist.
 *   - Local source gameplay files were NOT verified in the Sunflower-Land
 *     `portal` branch during the initial research handoff.
 *   - This component is a non-broken scaffold; implement fully when either:
 *     a) Source files are located and verified in Sunflower-Land, or
 *     b) A target-native maze-navigation game is implemented here.
 *
 * Implementation path chosen: target-native (Path A), pending full build.
 *
 * TODO: Implement Pac-Man maze navigation with ghost AI.
 */
export const PacManGame: React.FC<ArcadeGameProps> = ({ onBack }) => {
  return (
    <ArcadeGameShell title="Pac-Man" onBack={onBack}>
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="text-5xl select-none" aria-hidden>
          🕹️
        </div>
        <div className="text-center max-w-xs">
          <p className="text-sm font-semibold mb-1">Coming Soon</p>
          <p className="text-xs opacity-60">
            Pac-Man is on the implementation roadmap. The maze navigation game
            will be built as a target-native component once source verification
            is complete or a local implementation is prioritised.
          </p>
        </div>
        <div className="rounded border border-white/10 bg-white/5 px-4 py-3 text-xs opacity-50 text-center max-w-xs">
          <span className="font-semibold block mb-1">Developer note</span>
          Source minigame id: <code>pac-man</code>. Local implementation not
          yet started. See{" "}
          <code>src/features/arcade/games/pacman/PacManGame.tsx</code> for
          context.
        </div>
      </div>
    </ArcadeGameShell>
  );
};
