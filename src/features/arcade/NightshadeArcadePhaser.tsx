import React, { useEffect, useMemo, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

import { Preloader } from "features/world/scenes/Preloader";
import { NightshadeArcadeScene } from "./NightshadeArcadeScene";
import { useMinigameSession } from "lib/portal";
import { createDefaultGuestBumpkin } from "lib/mmo/defaultGuestBumpkin";
import type { GuestBumpkinJoin } from "lib/mmo/types";
import { tokenUriBuilder } from "lib/utils/tokenUriBuilder";

export const NightshadeArcadePhaser: React.FC = () => {
  const { farmId, farm, playerData } = useMinigameSession();
  const game = useRef<Game>(undefined);

  const scene = "nightshade-arcade";
  const scenes: any[] = [Preloader, NightshadeArcadeScene];
  const bumpkin = useMemo<GuestBumpkinJoin>(() => {
    const fallback = createDefaultGuestBumpkin();
    const avatar = playerData.resolvedAvatar;
    return {
      ...fallback,
      equipped: {
        ...fallback.equipped,
        ...avatar.equipped,
      },
      experience: avatar.experience ?? fallback.experience,
      id: avatar.id ?? fallback.id,
      tokenUri: avatar.tokenUri ?? fallback.tokenUri,
    };
  }, [playerData.resolvedAvatar]);

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

    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.log("[NightshadeArcadePhaser] final render bumpkin", {
        source: playerData.resolvedAvatar.source,
        equipped: bumpkin.equipped,
        tokenUri: bumpkin.tokenUri,
        tokenUriFromEquipped: tokenUriBuilder(bumpkin.equipped),
      });
    }

    game.current.registry.set("initialScene", scene);
    game.current.registry.set("gameState", {
      bumpkin,
      username: playerData.resolvedProfile.username,
      balance: farm.balance,
    });
    game.current.registry.set("id", farmId);

    return () => {
      game.current?.destroy(true);
    };
  }, [bumpkin, farm.balance, farmId, playerData.resolvedProfile.username]);

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
