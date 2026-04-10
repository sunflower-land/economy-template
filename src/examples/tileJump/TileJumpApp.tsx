import React, { useMemo } from "react";
import { MemoryRouter, Navigate, Route, Routes } from "react-router-dom";

import { MinigamePortalProvider } from "lib/portal";
import { useMinigameSession } from "lib/portal/sessionProvider";
import { MmoRoomProvider } from "lib/mmo";
import type { GuestBumpkinJoin } from "lib/mmo/types";
import { tokenUriBuilder, type BumpkinParts } from "lib/utils/tokenUriBuilder";
import { createDefaultGuestBumpkin } from "lib/mmo/defaultGuestBumpkin";
import { createTileJumpOfflineMinigame } from "./lib/tileJumpOfflineMinigame";
import { TILE_JUMP_MINIGAME_SLUG } from "./lib/tileJumpSlug";
import { TileJumpGamePage } from "./TileJumpGamePage";

/** Registry key used to pass tokenParts into the Phaser scene. */
export const PLAYER_TOKEN_PARTS_REGISTRY_KEY = "playerTokenParts";

/**
 * Extracts equipped clothing from the session's bumpkin and builds:
 * - `GuestBumpkinJoin` for the MMO room join payload
 * - `tokenParts` string for the Phaser sprite URL
 *
 * Falls back to the default guest bumpkin when no session bumpkin is available.
 */
function useBumpkinFromSession(): {
  bumpkinJoin: GuestBumpkinJoin;
  tokenParts: string;
} {
  const { farm } = useMinigameSession();

  return useMemo(() => {
    const bumpkin = farm.bumpkin as
      | { equipped?: Record<string, string>; experience?: number; id?: number }
      | undefined;

    const equipped = bumpkin?.equipped;

    if (!equipped) {
      const fallback = createDefaultGuestBumpkin();
      const parts: BumpkinParts = {
        background: fallback.equipped.background as BumpkinParts["background"],
        body: fallback.equipped.body as BumpkinParts["body"],
        hair: fallback.equipped.hair as BumpkinParts["hair"],
        shirt: fallback.equipped.shirt as BumpkinParts["shirt"],
        pants: fallback.equipped.pants as BumpkinParts["pants"],
        shoes: fallback.equipped.shoes as BumpkinParts["shoes"],
        tool: fallback.equipped.tool as BumpkinParts["tool"],
      };
      return {
        bumpkinJoin: fallback,
        tokenParts: tokenUriBuilder(parts),
      };
    }

    // Build BumpkinParts from the equipped record
    const parts: BumpkinParts = {
      background: (equipped.background || undefined) as BumpkinParts["background"],
      body: (equipped.body || undefined) as BumpkinParts["body"],
      hair: (equipped.hair || undefined) as BumpkinParts["hair"],
      shirt: (equipped.shirt || undefined) as BumpkinParts["shirt"],
      pants: (equipped.pants || undefined) as BumpkinParts["pants"],
      shoes: (equipped.shoes || undefined) as BumpkinParts["shoes"],
      tool: (equipped.tool || undefined) as BumpkinParts["tool"],
      hat: (equipped.hat || undefined) as BumpkinParts["hat"],
      necklace: (equipped.necklace || undefined) as BumpkinParts["necklace"],
      secondaryTool: (equipped.secondaryTool || undefined) as BumpkinParts["secondaryTool"],
      coat: (equipped.coat || undefined) as BumpkinParts["coat"],
      onesie: (equipped.onesie || undefined) as BumpkinParts["onesie"],
      suit: (equipped.suit || undefined) as BumpkinParts["suit"],
      wings: (equipped.wings || undefined) as BumpkinParts["wings"],
      dress: (equipped.dress || undefined) as BumpkinParts["dress"],
      beard: (equipped.beard || undefined) as BumpkinParts["beard"],
      aura: (equipped.aura || undefined) as BumpkinParts["aura"],
    };

    const tokenParts = tokenUriBuilder(parts);

    const bumpkinJoin: GuestBumpkinJoin = {
      equipped: {
        background: equipped.background ?? "",
        body: equipped.body ?? "",
        hair: equipped.hair ?? "",
        shoes: equipped.shoes ?? "",
        pants: equipped.pants ?? "",
        tool: equipped.tool ?? "",
        shirt: equipped.shirt ?? "",
        coat: equipped.coat ?? "",
        onesie: equipped.onesie ?? "",
        suit: equipped.suit ?? "",
        dress: equipped.dress ?? "",
        hat: equipped.hat ?? "",
        wings: equipped.wings ?? "",
        beard: equipped.beard ?? "",
        aura: equipped.aura ?? "",
      },
      experience: bumpkin?.experience ?? 0,
      id: bumpkin?.id ?? 0,
      skills: {},
      tokenUri: tokenParts,
      achievements: {},
    };

    return { bumpkinJoin, tokenParts };
  }, [farm.bumpkin]);
}

/**
 * Inner shell — rendered inside MinigamePortalProvider so it can read the session.
 * Passes real bumpkin data to MmoRoomProvider and exposes tokenParts for the scene.
 */
const TileJumpInner: React.FC = () => {
  const { farmId } = useMinigameSession();
  const { bumpkinJoin, tokenParts } = useBumpkinFromSession();

  const connectOptions = useMemo(
    () => ({
      sceneId: TILE_JUMP_MINIGAME_SLUG,
      farmId,
      bumpkin: bumpkinJoin,
    }),
    [farmId, bumpkinJoin],
  );

  return (
    <MmoRoomProvider connectOptions={connectOptions}>
      {/* tokenParts is read by TileJumpGamePage and injected into the Phaser registry */}
      <TileJumpGamePage tokenParts={tokenParts} />
    </MmoRoomProvider>
  );
};

/** Tile Jump — navigate the hidden path to the golden finish tile. */
export const TileJumpApp: React.FC = () => {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <MinigamePortalProvider
        offlineActions={{}}
        offlineMinigame={createTileJumpOfflineMinigame}
      >
        <Routes>
          <Route path="/" element={<TileJumpInner />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MinigamePortalProvider>
    </MemoryRouter>
  );
};
