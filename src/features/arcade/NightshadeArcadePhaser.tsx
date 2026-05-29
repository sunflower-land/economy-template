import React, { useEffect, useMemo, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

import { Preloader } from "features/world/scenes/Preloader";
import { NightshadeArcadeScene } from "./NightshadeArcadeScene";
import { createDefaultGuestBumpkin } from "lib/mmo/defaultGuestBumpkin";
import { useMinigameSession } from "lib/portal";
import type { GuestBumpkinJoin } from "lib/mmo/types";
import {
  interpretTokenUri,
  tokenUriBuilder,
  type BumpkinParts,
} from "lib/utils/tokenUriBuilder";
import { decodePortalTokenClaims } from "lib/portal/decodePortalToken";

type SessionBumpkin = {
  equipped?: Record<string, string>;
  experience?: number;
  id?: number;
  tokenUri?: string;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function extractSessionBumpkinFromJwt(jwt: string): SessionBumpkin | undefined {
  const claims = decodePortalTokenClaims(jwt);
  if (!claims) return undefined;

  const candidates: unknown[] = [
    claims.bumpkin,
    asRecord(claims.farm)?.bumpkin,
    asRecord(claims.state)?.bumpkin,
    asRecord(asRecord(claims.state)?.farm)?.bumpkin,
    asRecord(claims.game)?.bumpkin,
    asRecord(asRecord(claims.game)?.farm)?.bumpkin,
  ];

  for (const candidate of candidates) {
    const bumpkin = asRecord(candidate);
    if (!bumpkin) continue;

    const equipped = asRecord(bumpkin.equipped);
    if (equipped) {
      return {
        equipped: equipped as Record<string, string>,
        experience:
          typeof bumpkin.experience === "number" ? bumpkin.experience : undefined,
        id: typeof bumpkin.id === "number" ? bumpkin.id : undefined,
        tokenUri: typeof bumpkin.tokenUri === "string" ? bumpkin.tokenUri : undefined,
      };
    }

    if (typeof bumpkin.tokenUri === "string") {
      return { tokenUri: bumpkin.tokenUri };
    }
  }

  return undefined;
}

export const NightshadeArcadePhaser: React.FC = () => {
  const { farm, jwt } = useMinigameSession();
  const game = useRef<Game>(undefined);

  const scene = "nightshade-arcade";
  const scenes: any[] = [Preloader, NightshadeArcadeScene];
  const bumpkin = useMemo<GuestBumpkinJoin>(() => {
    const sessionBumpkin =
      (farm.bumpkin as SessionBumpkin | undefined) ?? extractSessionBumpkinFromJwt(jwt);
    const equipped = sessionBumpkin?.equipped;

    let interpreted: Record<string, string> | undefined;
    if (!equipped && sessionBumpkin?.tokenUri) {
      try {
        interpreted = interpretTokenUri(sessionBumpkin.tokenUri)
          .equipped as Record<string, string>;
      } catch {
        interpreted = undefined;
      }
    }

    const resolvedEquipped = equipped ?? interpreted;

    if (!resolvedEquipped) {
      return createDefaultGuestBumpkin();
    }

    const parts: BumpkinParts = {
      background: (resolvedEquipped.background || undefined) as BumpkinParts["background"],
      body: (resolvedEquipped.body || undefined) as BumpkinParts["body"],
      hair: (resolvedEquipped.hair || undefined) as BumpkinParts["hair"],
      shirt: (resolvedEquipped.shirt || undefined) as BumpkinParts["shirt"],
      pants: (resolvedEquipped.pants || undefined) as BumpkinParts["pants"],
      shoes: (resolvedEquipped.shoes || undefined) as BumpkinParts["shoes"],
      tool: (resolvedEquipped.tool || undefined) as BumpkinParts["tool"],
      hat: (resolvedEquipped.hat || undefined) as BumpkinParts["hat"],
      necklace: (resolvedEquipped.necklace || undefined) as BumpkinParts["necklace"],
      secondaryTool: (resolvedEquipped.secondaryTool || undefined) as BumpkinParts["secondaryTool"],
      coat: (resolvedEquipped.coat || undefined) as BumpkinParts["coat"],
      onesie: (resolvedEquipped.onesie || undefined) as BumpkinParts["onesie"],
      suit: (resolvedEquipped.suit || undefined) as BumpkinParts["suit"],
      wings: (resolvedEquipped.wings || undefined) as BumpkinParts["wings"],
      dress: (resolvedEquipped.dress || undefined) as BumpkinParts["dress"],
      beard: (resolvedEquipped.beard || undefined) as BumpkinParts["beard"],
      aura: (resolvedEquipped.aura || undefined) as BumpkinParts["aura"],
    };

    return {
      equipped: {
        background: resolvedEquipped.background ?? "",
        body: resolvedEquipped.body ?? "",
        hair: resolvedEquipped.hair ?? "",
        shoes: resolvedEquipped.shoes ?? "",
        pants: resolvedEquipped.pants ?? "",
        tool: resolvedEquipped.tool ?? "",
        shirt: resolvedEquipped.shirt ?? "",
        coat: resolvedEquipped.coat ?? "",
        onesie: resolvedEquipped.onesie ?? "",
        suit: resolvedEquipped.suit ?? "",
        dress: resolvedEquipped.dress ?? "",
        hat: resolvedEquipped.hat ?? "",
        wings: resolvedEquipped.wings ?? "",
        beard: resolvedEquipped.beard ?? "",
        aura: resolvedEquipped.aura ?? "",
      },
      experience: sessionBumpkin?.experience ?? 0,
      id: sessionBumpkin?.id ?? 0,
      skills: {},
      tokenUri: tokenUriBuilder(parts),
      achievements: {},
    };
  }, [farm.bumpkin, jwt]);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: AUTO,
      fps: {
        target: 30,
        smoothStep: true,
      },
      backgroundColor: "#000000",
      parent: "game-content",
      autoRound: true,
      pixelArt: true,
      plugins: {
        global: [
          {
            key: "rexNinePatchPlugin",
            plugin: NinePatchPlugin,
            start: true,
          },
          {
            key: "rexVirtualJoystick",
            plugin: VirtualJoystickPlugin,
            start: true,
          },
        ],
      },
      width: window.innerWidth,
      height: window.innerHeight,
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
          gravity: { x: 0, y: 0 },
        },
      },
      scene: scenes,
      loader: {
        crossOrigin: "anonymous",
      },
    };

    game.current = new Game(config);

    game.current.registry.set("initialScene", scene);
    game.current.registry.set("gameState", {
      bumpkin,
      username: farm.username,
      balance: farm.balance,
    });
    game.current.registry.set("id", 0);

    return () => {
      game.current?.destroy(true);
    };
  }, [bumpkin, farm.balance, farm.username]);

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 10,
      }}
    >
      <div
        id="game-content"
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};
