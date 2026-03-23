import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { MainScene } from "game/MainScene";

export function PhaserGame() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = hostRef.current;
    if (!parent) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      width: 480,
      height: 320,
      pixelArt: true,
      roundPixels: true,
      antialias: false,
      backgroundColor: "#3d3d3d",
      fps: {
        smoothStep: false,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          fixedStep: true,
          fps: 60,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        autoRound: true,
      },
      scene: [MainScene],
    });

    game.canvas.style.imageRendering = "pixelated";

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="w-full max-w-2xl aspect-[480/320] bg-[#2a2a2a] rounded-sm overflow-hidden"
    />
  );
}
