import React from "react";
import { ArcadeGameShell } from "../../components/ArcadeGameShell";
import type { ArcadeGameProps } from "../../types";

/**
 * Frogger — scaffolded placeholder.
 *
 * Status: NOT YET IMPLEMENTED (scaffolded)
 *
 * Source verification note:
 *   - Minigame id `frogger` is listed in the migration checklist.
 *   - Local source gameplay files were NOT verified in the Sunflower-Land
 *     `portal` branch during the initial research handoff.
 *   - This component is a non-broken scaffold; implement fully when either:
 *     a) Source files are located and verified in Sunflower-Land, or
 *     b) A target-native lane-crossing game is implemented here.
 *
 * Implementation path chosen: target-native (Path A), pending full build.
 *
 * TODO: Implement Frogger lane-crossing with moving vehicles and river logs.
 */
export const FroggerGame: React.FC<ArcadeGameProps> = ({ onBack }) => {
  return (
    <ArcadeGameShell title="Frogger" onBack={onBack}>
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="text-5xl select-none" aria-hidden>
          🐸
        </div>
        <div className="text-center max-w-xs">
          <p className="text-sm font-semibold mb-1">Coming Soon</p>
          <p className="text-xs opacity-60">
            Frogger is on the implementation roadmap. The lane-crossing game
            will be built as a target-native component once source verification
            is complete or a local implementation is prioritised.
          </p>
        </div>
        <div className="rounded border border-white/10 bg-white/5 px-4 py-3 text-xs opacity-50 text-center max-w-xs">
          <span className="font-semibold block mb-1">Developer note</span>
          Source minigame id: <code>frogger</code>. Local implementation not
          yet started. See{" "}
          <code>src/features/arcade/games/frogger/FroggerGame.tsx</code> for
          context.
        </div>
      </div>
    </ArcadeGameShell>
  );
};
