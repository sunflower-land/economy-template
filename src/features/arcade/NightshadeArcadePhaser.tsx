import React, { useEffect, useMemo, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

import { Preloader } from "features/world/scenes/Preloader";
import { NightshadeArcadeScene } from "./NightshadeArcadeScene";
import { useMinigameSession } from "lib/portal";
import { createDefaultGuestBumpkin } from "lib/mmo/defaultGuestBumpkin";
import type { GuestBumpkinJoin } from "lib/mmo/types";

export const NightshadeArcadePhaser: React.FC = () => {
  const { farmId, farm } = useMinigameSession();
  const game = useRef<Game>(undefined);

  const scene = "nightshade-arcade";
  const scenes: any[] = [Preloader, NightshadeArcadeScene];
  const bumpkin = useMemo<GuestBumpkinJoin>(() => {
    const fallback = createDefaultGuestBumpkin();
    const b = farm?.bumpkin as { equipped?: Record<string, string> } | undefined;
    const equipped = b?.equipped ?? {};
    // eslint-disable-next-line no-console
    console.log("[BumpkinDiag] farm.bumpkin from session:", JSON.stringify(farm?.bumpkin));
    const result: GuestBumpkinJoin = {
      ...fallback,
      equipped: {
        ...fallback.equipped,
        ...equipped,
      },
    };
    // eslint-disable-next-line no-console
    console.log("[BumpkinDiag] final bumpkin equipped going to registry:", JSON.stringify(result.equipped));
    return result;
  }, [farm?.bumpkin]);

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
    });
    game.current.registry.set("id", farmId);

    return () => {
      game.current?.destroy(true);
    };
  }, [bumpkin, farmId]);

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
