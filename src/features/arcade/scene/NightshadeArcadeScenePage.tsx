import React, { useEffect, useMemo, useRef, useState } from "react";
import Phaser from "phaser";
import ravenCoinIcon from "../assets/RavenCoin.webp";
import type { ArcadeGameEntry } from "../types";
import {
  ARCADE_CALLBACKS_REGISTRY_KEY,
  ARCADE_MACHINES_REGISTRY_KEY,
  ARCADE_TOUCH_VECTOR_REGISTRY_KEY,
  NightshadeArcadeScene,
  type ArcadeMachinePlacement,
  type NightshadeArcadeSceneCallbacks,
} from "./NightshadeArcadeScene";

interface NightshadeArcadeScenePageProps {
  games: ArcadeGameEntry[];
  tokenBalance: number;
  onLaunchGame: (gameId: string) => void;
}

const JOYSTICK_RADIUS = 56;

function createMachinePlacements(games: ArcadeGameEntry[]): ArcadeMachinePlacement[] {
  const columns = 4;
  const columnGap = 245;
  const rowGap = 140;
  const startX = 280;
  const startY = 200;

  return games.map((game, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return {
      id: game.id,
      name: game.name,
      x: startX + col * columnGap,
      y: startY + row * rowGap,
      width: 100,
      height: 68,
    };
  });
}

export const NightshadeArcadeScenePage: React.FC<NightshadeArcadeScenePageProps> = ({
  games,
  tokenBalance,
  onLaunchGame,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const touchVectorRef = useRef({ x: 0, y: 0 });
  const [focusedGameId, setFocusedGameId] = useState<string | null>(null);
  const [isTouchControls, setIsTouchControls] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickVisual, setJoystickVisual] = useState({ x: 0, y: 0 });

  const placements = useMemo(() => createMachinePlacements(games), [games]);
  const focusedGame = useMemo(
    () => games.find((game) => game.id === focusedGameId),
    [focusedGameId, games],
  );

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const sync = () => setIsTouchControls(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const parent = hostRef.current;
    if (!parent) return;

    const readSize = () => {
      const width = Math.max(320, parent.clientWidth || window.innerWidth);
      const height = Math.max(260, parent.clientHeight || window.innerHeight);
      return { width, height };
    };
    const { width, height } = readSize();

    const callbacks: NightshadeArcadeSceneCallbacks = {
      onFocusMachineChange: setFocusedGameId,
      onInteractMachine: onLaunchGame,
    };

    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent,
      width,
      height,
      pixelArt: true,
      roundPixels: true,
      antialias: false,
      backgroundColor: "#130b1f",
      fps: { smoothStep: false },
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
      scene: [NightshadeArcadeScene],
    });

    game.registry.set(ARCADE_MACHINES_REGISTRY_KEY, placements);
    game.registry.set(ARCADE_TOUCH_VECTOR_REGISTRY_KEY, touchVectorRef.current);
    game.registry.set(ARCADE_CALLBACKS_REGISTRY_KEY, callbacks);
    game.canvas.style.imageRendering = "pixelated";

    const ro = new ResizeObserver(() => {
      const next = readSize();
      game.scale.resize(next.width, next.height);
    });
    ro.observe(parent);

    return () => {
      ro.disconnect();
      game.registry.remove(ARCADE_MACHINES_REGISTRY_KEY);
      game.registry.remove(ARCADE_TOUCH_VECTOR_REGISTRY_KEY);
      game.registry.remove(ARCADE_CALLBACKS_REGISTRY_KEY);
      game.destroy(true);
    };
  }, [onLaunchGame, placements]);

  const updateJoystick = (clientX: number, clientY: number, rect: DOMRect) => {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const length = Math.hypot(dx, dy);
    if (length <= 0.001) {
      touchVectorRef.current.x = 0;
      touchVectorRef.current.y = 0;
      setJoystickVisual({ x: 0, y: 0 });
      return;
    }
    const clamped = Math.min(length, JOYSTICK_RADIUS);
    touchVectorRef.current.x = (dx / length) * (clamped / JOYSTICK_RADIUS);
    touchVectorRef.current.y = (dy / length) * (clamped / JOYSTICK_RADIUS);
    setJoystickVisual({
      x: touchVectorRef.current.x,
      y: touchVectorRef.current.y,
    });
  };

  const resetJoystick = () => {
    touchVectorRef.current.x = 0;
    touchVectorRef.current.y = 0;
    setJoystickVisual({ x: 0, y: 0 });
    setJoystickActive(false);
  };

  return (
    <div className="fixed inset-0 z-0 bg-[#130b1f]">
      <div ref={hostRef} className="fixed inset-0 overflow-hidden" />

      <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-1">
        <div className="rounded bg-black/55 px-3 py-2 text-xs text-white">
          <div className="font-semibold">Nightshade Arcade</div>
          <div className="text-[11px] text-[#e6bfd4]">Walk with WASD / arrows</div>
        </div>
        <div className="rounded bg-[#b65389]/90 px-3 py-1 text-xs text-white">
          <img alt="" className="mr-1 inline h-3 w-3" src={ravenCoinIcon} />
          {tokenBalance} Raven Coins
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded bg-black/55 px-3 py-2 text-xs text-white">
        {focusedGame
          ? `Near ${focusedGame.name} · Press E${isTouchControls ? " or tap PLAY" : ""}`
          : "Move near a machine to interact"}
      </div>

      {focusedGame && isTouchControls && (
        <button
          className="absolute bottom-6 right-5 z-30 rounded bg-[#1e6dd5] px-4 py-3 text-xs text-white shadow-md"
          onClick={() => onLaunchGame(focusedGame.id)}
          type="button"
        >
          Play {focusedGame.name}
        </button>
      )}

      {isTouchControls && (
        <div
          className="absolute bottom-6 left-5 z-30 h-28 w-28 touch-none rounded-full border border-[#b65389]/80 bg-black/50"
          onPointerDown={(event) => {
            setJoystickActive(true);
            event.currentTarget.setPointerCapture(event.pointerId);
            updateJoystick(
              event.clientX,
              event.clientY,
              event.currentTarget.getBoundingClientRect(),
            );
          }}
          onPointerMove={(event) => {
            if (!joystickActive) return;
            updateJoystick(
              event.clientX,
              event.clientY,
              event.currentTarget.getBoundingClientRect(),
            );
          }}
          onPointerUp={resetJoystick}
          onPointerCancel={resetJoystick}
        >
          <div
            className="pointer-events-none absolute h-10 w-10 rounded-full bg-[#f9f4e7]/80"
            style={{
              left: `calc(50% - 1.25rem + ${joystickVisual.x * 1.75}rem)`,
              top: `calc(50% - 1.25rem + ${joystickVisual.y * 1.75}rem)`,
            }}
          />
        </div>
      )}
    </div>
  );
};
