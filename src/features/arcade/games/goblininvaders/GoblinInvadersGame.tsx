import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArcadeGameShell } from "../../components/ArcadeGameShell";
import type { ArcadeGameProps } from "../../types";

/**
 * Goblin Invaders — Space Invaders-style arcade shooter.
 * Target-native implementation. Source location in Sunflower-Land was not
 * verified during the research handoff, so this is a clean local build.
 *
 * Controls: ← → to move | Space to shoot
 * Win condition: destroy all goblins to earn Raven Coins.
 */

const COLS = 8;
const GOBLIN_ROWS = 3;
const PLAYER_Y = 90; // percent from top
const TICK_MS = 80;
const GOBLIN_MOVE_TICKS = 10;
const GOBLIN_SHOOT_CHANCE = 0.005; // per goblin per tick
const BULLET_SPEED = 3; // percent per tick
const PLAYER_SPEED = 2.5; // percent per tick

type BulletKind = "player" | "goblin";

interface Bullet {
  id: number;
  x: number; // percent
  y: number; // percent
  kind: BulletKind;
}

interface GameState {
  playerX: number; // percent (0-100)
  goblins: boolean[][]; // [row][col] alive?
  goblinOffsetX: number; // percent
  goblinDir: 1 | -1;
  bullets: Bullet[];
  playerLives: number;
  score: number;
  gameOver: boolean;
  won: boolean;
  moveTick: number;
  nextBulletId: number;
}

const GOBLIN_COL_SPACING = 100 / (COLS + 1); // percent between goblins
const GOBLIN_ROW_SPACING = 8; // percent between rows

function createInitialState(): GameState {
  return {
    playerX: 50,
    goblins: Array.from({ length: GOBLIN_ROWS }, () =>
      Array.from({ length: COLS }, () => true),
    ),
    goblinOffsetX: 0,
    goblinDir: 1,
    bullets: [],
    playerLives: 3,
    score: 0,
    gameOver: false,
    won: false,
    moveTick: 0,
    nextBulletId: 0,
  };
}

function countAlive(goblins: boolean[][]): number {
  return goblins.flat().filter(Boolean).length;
}

/** Get X position (percent) for a given goblin column relative to offset */
function goblinX(col: number, offset: number): number {
  return GOBLIN_COL_SPACING * (col + 1) + offset;
}

/** Get Y position (percent) for a given goblin row */
function goblinY(row: number): number {
  return 8 + row * GOBLIN_ROW_SPACING;
}

function tickGameState(prev: GameState, pressedKeys: Set<string>): GameState {
  if (prev.gameOver || prev.won) return prev;

  let { playerX, goblins, goblinOffsetX, goblinDir, bullets, playerLives, score, moveTick, nextBulletId } = prev;

  // ── Player movement ───────────────────────────────────────────
  if (pressedKeys.has("ArrowLeft")) playerX = Math.max(2, playerX - PLAYER_SPEED);
  if (pressedKeys.has("ArrowRight")) playerX = Math.min(98, playerX + PLAYER_SPEED);

  // ── Move bullets ──────────────────────────────────────────────
  const movedBullets: Bullet[] = bullets
    .map((b) => ({
      ...b,
      y: b.kind === "player" ? b.y - BULLET_SPEED : b.y + BULLET_SPEED,
    }))
    .filter((b) => b.y >= 0 && b.y <= 100);

  // ── Goblin movement ───────────────────────────────────────────
  moveTick++;
  const aliveCount = countAlive(goblins);
  const moveEvery = Math.max(2, GOBLIN_MOVE_TICKS - Math.floor((GOBLIN_ROWS * COLS - aliveCount) / 4));
  if (moveTick >= moveEvery) {
    moveTick = 0;
    goblinOffsetX += goblinDir * 3;
    // Check if any alive goblin would go out of bounds → reverse
    let reverse = false;
    for (let r = 0; r < GOBLIN_ROWS && !reverse; r++) {
      for (let c = 0; c < COLS && !reverse; c++) {
        if (!goblins[r][c]) continue;
        const x = goblinX(c, goblinOffsetX);
        if (x < 2 || x > 98) reverse = true;
      }
    }
    if (reverse) {
      goblinDir = goblinDir === 1 ? -1 : 1;
      goblinOffsetX -= goblinDir * 6;
    }
  }

  // ── Goblin random shooting ────────────────────────────────────
  const newBullets: Bullet[] = [];
  for (let c = 0; c < COLS; c++) {
    // Bottom-most alive goblin in this column shoots
    let bottomRow = -1;
    for (let r = GOBLIN_ROWS - 1; r >= 0; r--) {
      if (goblins[r][c]) { bottomRow = r; break; }
    }
    if (bottomRow >= 0 && Math.random() < GOBLIN_SHOOT_CHANCE) {
      newBullets.push({
        id: nextBulletId++,
        x: goblinX(c, goblinOffsetX),
        y: goblinY(bottomRow) + 3,
        kind: "goblin",
      });
    }
  }

  const allBullets = [...movedBullets, ...newBullets];

  // ── Collision: player bullets hit goblins ─────────────────────
  const survivingPlayerBullets: Set<number> = new Set(
    allBullets.filter((b) => b.kind === "player").map((b) => b.id),
  );
  const newGoblins = goblins.map((row) => [...row]);
  let newScore = score;

  for (const bullet of allBullets) {
    if (bullet.kind !== "player") continue;
    for (let r = 0; r < GOBLIN_ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGoblins[r][c]) continue;
        const gx = goblinX(c, goblinOffsetX);
        const gy = goblinY(r);
        if (Math.abs(bullet.x - gx) < 4 && Math.abs(bullet.y - gy) < 4) {
          newGoblins[r][c] = false;
          survivingPlayerBullets.delete(bullet.id);
          newScore += 10;
        }
      }
    }
  }

  // ── Collision: goblin bullets hit player ──────────────────────
  let survivingGoblinBullets = allBullets.filter((b) => b.kind === "goblin");
  let hitPlayer = false;
  survivingGoblinBullets = survivingGoblinBullets.filter((b) => {
    if (Math.abs(b.x - playerX) < 5 && Math.abs(b.y - PLAYER_Y) < 4) {
      hitPlayer = true;
      return false;
    }
    return true;
  });
  let newLives = playerLives;
  if (hitPlayer) newLives--;

  // Keep bullets that survived
  const finalBullets = [
    ...allBullets.filter(
      (b) => b.kind === "player" && survivingPlayerBullets.has(b.id),
    ),
    ...survivingGoblinBullets,
  ];

  // ── Win / lose checks ─────────────────────────────────────────
  const allGoblinsDead = countAlive(newGoblins) === 0;
  const playerDead = newLives <= 0;
  // Goblins reached player
  let goblinsTooLow = false;
  for (let r = 0; r < GOBLIN_ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (newGoblins[r][c] && goblinY(r) >= PLAYER_Y - 5) {
        goblinsTooLow = true;
      }
    }
  }

  return {
    playerX,
    goblins: newGoblins,
    goblinOffsetX,
    goblinDir,
    bullets: finalBullets,
    playerLives: newLives,
    score: newScore,
    gameOver: playerDead || goblinsTooLow,
    won: allGoblinsDead,
    moveTick,
    nextBulletId,
  };
}

export const GoblinInvadersGame: React.FC<ArcadeGameProps> = ({
  onBack,
  onWin,
  tokenReward,
}) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [wonReported, setWonReported] = useState(false);
  const pressedKeys = useRef<Set<string>>(new Set());
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const startGame = () => {
    setGameState(createInitialState());
    setWonReported(false);
    gameAreaRef.current?.focus();
  };

  const shoot = useCallback(() => {
    setGameState((prev) => {
      if (!prev || prev.gameOver || prev.won) return prev;
      // Only one player bullet at a time to keep it fair
      if (prev.bullets.some((b) => b.kind === "player")) return prev;
      return {
        ...prev,
        bullets: [
          ...prev.bullets,
          { id: prev.nextBulletId, x: prev.playerX, y: PLAYER_Y - 5, kind: "player" },
        ],
        nextBulletId: prev.nextBulletId + 1,
      };
    });
  }, []);

  // Key handlers
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      pressedKeys.current.add(e.key);
      if (e.key === " ") {
        e.preventDefault();
        shoot();
      }
    };
    const onUp = (e: KeyboardEvent) => pressedKeys.current.delete(e.key);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [shoot]);

  // Game loop
  useEffect(() => {
    if (!gameState || gameState.gameOver || gameState.won) return;
    const id = setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.gameOver || prev.won) return prev;
        return tickGameState(prev, pressedKeys.current);
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [gameState?.gameOver, gameState?.won]);

  if (gameState?.won && !wonReported) {
    setWonReported(true);
    onWin(tokenReward);
  }

  if (!gameState) {
    return (
      <ArcadeGameShell title="Goblin Invaders" onBack={onBack}>
        <p className="text-sm opacity-80 text-center max-w-xs mx-auto">
          Destroy all goblins before they reach you!
          <br />
          <span className="text-xs opacity-60">
            ← → move · Space shoot
          </span>
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            className="rounded bg-[#3e8948] px-6 py-3 text-white font-bold hover:brightness-95"
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      </ArcadeGameShell>
    );
  }

  const { playerX, goblins, goblinOffsetX, bullets, playerLives, score, gameOver, won } = gameState;

  return (
    <ArcadeGameShell title="Goblin Invaders" onBack={onBack}>
      <div className="flex items-center justify-between text-xs">
        <span>
          Score: <strong className="text-yellow-400">{score}</strong>
        </span>
        <span>
          Lives: <strong className="text-red-400">{"❤️".repeat(Math.max(0, playerLives))}</strong>
        </span>
      </div>

      {/* Game area */}
      <div
        ref={gameAreaRef}
        tabIndex={0}
        className="relative bg-black border border-white/20 rounded overflow-hidden outline-none mx-auto"
        style={{ width: "min(320px, 90vw)", aspectRatio: "1 / 1.1" }}
        onKeyDown={(e) => {
          if (e.key === " ") { e.preventDefault(); shoot(); }
        }}
      >
        {/* Goblins */}
        {goblins.map((row, r) =>
          row.map(
            (alive, c) =>
              alive && (
                <div
                  key={`g-${r}-${c}`}
                  className="absolute text-sm select-none"
                  style={{
                    left: `${goblinX(c, goblinOffsetX)}%`,
                    top: `${goblinY(r)}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  👺
                </div>
              ),
          ),
        )}

        {/* Bullets */}
        {bullets.map((b) => (
          <div
            key={b.id}
            className="absolute w-0.5 rounded-full"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              height: "3%",
              backgroundColor: b.kind === "player" ? "#00ff88" : "#ff4444",
              transform: "translateX(-50%)",
            }}
          />
        ))}

        {/* Player */}
        <div
          className="absolute text-base select-none"
          style={{
            left: `${playerX}%`,
            top: `${PLAYER_Y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          🧙
        </div>

        {/* Overlay messages */}
        {(gameOver || won) && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
            <div className="text-lg font-bold">
              {won ? "🎉 All goblins vanquished!" : "💀 Game Over"}
            </div>
            {won && (
              <div className="text-green-400 text-sm">
                +{tokenReward} Raven Coins!
              </div>
            )}
            <div className="text-xs opacity-70">Score: {score}</div>
            <button
              type="button"
              className="rounded bg-[#3e8948] px-4 py-2 text-white font-bold"
              onClick={startGame}
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Touch controls */}
      <div className="flex gap-2 justify-center mt-1">
        <button
          type="button"
          className="rounded bg-[#3e2731] px-5 py-3 text-white font-bold"
          onPointerDown={() => pressedKeys.current.add("ArrowLeft")}
          onPointerUp={() => pressedKeys.current.delete("ArrowLeft")}
          onPointerLeave={() => pressedKeys.current.delete("ArrowLeft")}
        >
          ←
        </button>
        <button
          type="button"
          className="rounded bg-[#b65389] px-5 py-3 text-white font-bold"
          onClick={shoot}
        >
          🔫 Shoot
        </button>
        <button
          type="button"
          className="rounded bg-[#3e2731] px-5 py-3 text-white font-bold"
          onPointerDown={() => pressedKeys.current.add("ArrowRight")}
          onPointerUp={() => pressedKeys.current.delete("ArrowRight")}
          onPointerLeave={() => pressedKeys.current.delete("ArrowRight")}
        >
          →
        </button>
      </div>
    </ArcadeGameShell>
  );
};
