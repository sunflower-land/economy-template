import React, { useEffect, useMemo, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

import { Preloader } from "features/world/scenes/Preloader";
import { NightshadeArcadeScene } from "./NightshadeArcadeScene";
import { createDefaultGuestBumpkin } from "lib/mmo/defaultGuestBumpkin";
import { useMinigameSession } from "lib/portal";
import type { GuestBumpkinJoin } from "lib/mmo/types";
import { tokenUriBuilder, type BumpkinParts } from "lib/utils/tokenUriBuilder";

export const NightshadeArcadePhaser: React.FC = () => {
  const { farm } = useMinigameSession();
  const game = useRef<Game>(undefined);

  const scene = "nightshade-arcade";
  const scenes: any[] = [Preloader, NightshadeArcadeScene];
  const bumpkin = useMemo<GuestBumpkinJoin>(() => {
    const sessionBumpkin = farm.bumpkin as
      | { equipped?: Record<string, string>; experience?: number; id?: number }
      | undefined;
    const equipped = sessionBumpkin?.equipped;

    if (!equipped) {
      return createDefaultGuestBumpkin();
    }

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

    return {
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
      experience: sessionBumpkin?.experience ?? 0,
      id: sessionBumpkin?.id ?? 0,
      skills: {},
      tokenUri: tokenUriBuilder(parts),
      achievements: {},
    };
  }, [farm.bumpkin]);

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
