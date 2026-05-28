import React, { useEffect, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";
import PhaserNavMeshPlugin from "phaser-navmesh";

import { Preloader } from "features/world/scenes/Preloader";
import { NightshadeArcadeScene } from "./NightshadeArcadeScene";
import { createDefaultGuestBumpkin } from "lib/mmo/defaultGuestBumpkin";

export const NightshadeArcadePhaser: React.FC = () => {
  const game = useRef<Game>(undefined);

  const scene = "nightshade-arcade";
  const scenes: any[] = [Preloader, NightshadeArcadeScene];

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
          {
            key: "PhaserNavMeshPlugin",
            plugin: PhaserNavMeshPlugin,
            mapping: "navMeshPlugin",
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

    const bumpkin = createDefaultGuestBumpkin();
    game.current.registry.set("initialScene", scene);
    game.current.registry.set("gameState", { bumpkin: bumpkin });
    game.current.registry.set("id", 0);

    return () => {
      game.current?.destroy(true);
    };
  }, []);

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
