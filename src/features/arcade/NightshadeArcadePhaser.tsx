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

function isTechnicalLabel(value: string, farmId: number): boolean {
  const normalized = value.trim();
  if (!normalized) return true;
  if (normalized === String(farmId)) return true;
  if (/^\d+$/.test(normalized)) return true;
  if (/^0x[a-f0-9]{16,}$/i.test(normalized)) return true;
  return false;
}

export const NightshadeArcadePhaser: React.FC = () => {
  const { farm, farmId, playerData } = useMinigameSession();
  const game = useRef<Game>(undefined);

  const scene = "nightshade-arcade";
  const scenes: any[] = [Preloader, NightshadeArcadeScene];
  const bumpkin = useMemo<GuestBumpkinJoin>(() => {
    const avatar = playerData.resolvedAvatar;
    const equipped = avatar.equipped;

    let interpreted: Record<string, string> | undefined;
    if (!equipped && avatar.tokenUri) {
      try {
        interpreted = interpretTokenUri(avatar.tokenUri)
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
      experience: avatar.experience ?? 0,
      id: avatar.id ?? 0,
      skills: {},
      tokenUri: avatar.tokenUri ?? tokenUriBuilder(parts),
      achievements: {},
    };
  }, [playerData.resolvedAvatar]);
  const resolvedUsername = useMemo(() => {
    const fromProfile = playerData.resolvedProfile.username;
    if (
      typeof fromProfile === "string" &&
      fromProfile.trim() &&
      !isTechnicalLabel(fromProfile, farmId)
    ) {
      return fromProfile.trim();
    }
    if (
      typeof farm.username === "string" &&
      farm.username.trim() &&
      !isTechnicalLabel(farm.username, farmId)
    ) {
      return farm.username.trim();
    }
    return undefined;
  }, [farm.username, farmId, playerData.resolvedProfile.username]);

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
      username: resolvedUsername,
      balance: playerData.resolvedProfile.balance ?? farm.balance,
    });
    game.current.registry.set("id", farmId);

    return () => {
      game.current?.destroy(true);
    };
  }, [
    bumpkin,
    farm.balance,
    farmId,
    playerData.resolvedProfile.balance,
    resolvedUsername,
  ]);

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
