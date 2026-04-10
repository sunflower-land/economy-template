import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { useStore } from "@nanostores/react";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { Panel } from "components/ui/Panel";
import { MMO_SERVER_REGISTRY_KEY, useMmoRoom } from "lib/mmo";
import { TileJumpScene } from "./game/TileJumpScene";
import { PLAYER_TOKEN_PARTS_REGISTRY_KEY } from "./TileJumpApp";
import {
  $tileJumpHud,
  resetTileJumpHud,
  setTileJumpMode,
} from "./lib/tileJumpStore";

function fallbackViewport() {
  return {
    width: Math.max(320, Math.floor(window.innerWidth * 0.92)),
    height: Math.max(240, Math.floor(window.innerHeight * 0.78)),
  };
}

export const TileJumpGamePage: React.FC<{ tokenParts: string }> = ({
  tokenParts,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const { deaths, won, mode } = useStore($tileJumpHud);
  const { phase, room, retry } = useMmoRoom();
  const [playOffline, setPlayOffline] = useState(false);

  useEffect(() => {
    resetTileJumpHud();
  }, []);

  const runGame = (phase === "connected" && !!room) || playOffline;

  useEffect(() => {
    if (!runGame) return;

    const parent = hostRef.current;
    if (!parent) return;

    const readSize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w >= 8 && h >= 8) {
        return { width: Math.max(320, w), height: Math.max(240, h) };
      }
      return fallbackViewport();
    };

    const { width, height } = readSize();

    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent,
      width,
      height,
      pixelArt: true,
      roundPixels: true,
      antialias: false,
      backgroundColor: "#1a1a2e",
      fps: { smoothStep: false },
      loader: { crossOrigin: "anonymous" },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          fixedStep: true,
          fps: 60,
        },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true,
      },
      scene: [TileJumpScene],
    });

    if (room) {
      game.registry.set(MMO_SERVER_REGISTRY_KEY, room);
    }

    // Pass player's real bumpkin tokenParts into the scene
    game.registry.set(PLAYER_TOKEN_PARTS_REGISTRY_KEY, tokenParts);

    game.canvas.style.imageRendering = "pixelated";

    const ro = new ResizeObserver(() => {
      const next = readSize();
      game.scale.resize(next.width, next.height);
    });
    ro.observe(parent);

    return () => {
      ro.disconnect();
      game.registry.remove(MMO_SERVER_REGISTRY_KEY);
      game.registry.remove(PLAYER_TOKEN_PARTS_REGISTRY_KEY);
      game.destroy(true);
    };
  }, [runGame, room, tokenParts]);

  if (phase === "loading" || phase === "idle") {
    return (
      <div className="fixed inset-0 z-0 bg-[#1a1a2e] flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-stone-200 text-sm">Loading...</p>
      </div>
    );
  }

  if (phase === "error" && !playOffline) {
    return (
      <div className="fixed inset-0 z-0 bg-[#1a1a2e] flex flex-col items-center justify-center p-4">
        <Panel className="max-w-md w-full">
          <div className="p-3 flex flex-col gap-2">
            <Label type="danger">Something went wrong</Label>
            <p className="text-sm text-stone-600">
              We couldn&apos;t connect to the server. You can try again or play
              on your own.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => retry()}>Try again</Button>
              <Button onClick={() => setPlayOffline(true)}>
                Play on your own
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 bg-[#1a1a2e]">
      <div ref={hostRef} className="fixed inset-0 overflow-hidden" />

      {/* Top-left HUD: deaths + win label */}
      <div className="fixed top-3 left-3 z-10 pointer-events-none flex flex-col gap-1 items-start">
        {mode === "play" && (
          <Label type="default" className="pointer-events-auto">
            Deaths: {deaths}
          </Label>
        )}
        {won && (
          <Label type="success" className="pointer-events-auto">
            You found the path!
          </Label>
        )}
      </div>

      {/* Bottom-center HUD: Play / Spectate buttons */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {mode === "spectate" ? (
          <Button onClick={() => setTileJumpMode("play")}>Play</Button>
        ) : (
          <Button onClick={() => setTileJumpMode("spectate")}>Spectate</Button>
        )}
      </div>
    </div>
  );
};
