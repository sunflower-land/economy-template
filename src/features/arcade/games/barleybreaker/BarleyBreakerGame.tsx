import React, { useState, useCallback } from "react";
import { ArcadeGameShell } from "../../components/ArcadeGameShell";
import type { ArcadeGameProps } from "../../types";

/**
 * Barley Breaker — classic 15-puzzle (sliding tile game).
 * Target-native implementation. Source location in Sunflower-Land was not
 * verified during the research handoff, so this is a clean local build.
 *
 * Win condition: arrange tiles 1–15 in order (top-left to bottom-right)
 * with the empty slot at the bottom-right.
 */

const GRID_SIZE = 4;
const TOTAL = GRID_SIZE * GRID_SIZE;

type Grid = number[];

/** Solved state: [1, 2, ..., 15, 0] */
function createSolvedGrid(): Grid {
  return Array.from({ length: TOTAL }, (_, i) => (i + 1) % TOTAL);
}

/** Count inversions to determine if a puzzle is solvable */
function isSolvable(grid: Grid): boolean {
  const tiles = grid.filter((t) => t !== 0);
  let inversions = 0;
  for (let i = 0; i < tiles.length - 1; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inversions++;
    }
  }
  const emptyRow = Math.floor(grid.indexOf(0) / GRID_SIZE);
  const emptyFromBottom = GRID_SIZE - emptyRow;
  // 4x4 grid: solvable when (inversions + row-of-blank-from-bottom) is odd
  return (inversions + emptyFromBottom) % 2 === 1;
}

function createShuffledGrid(): Grid {
  let grid: Grid;
  do {
    grid = createSolvedGrid();
    for (let i = TOTAL - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }
  } while (!isSolvable(grid) || isWon(grid));
  return grid;
}

function isWon(grid: Grid): boolean {
  for (let i = 0; i < TOTAL - 1; i++) {
    if (grid[i] !== i + 1) return false;
  }
  return grid[TOTAL - 1] === 0;
}

function getAdjacentToEmpty(grid: Grid): number[] {
  const emptyIdx = grid.indexOf(0);
  const row = Math.floor(emptyIdx / GRID_SIZE);
  const col = emptyIdx % GRID_SIZE;
  const adjacent: number[] = [];
  if (row > 0) adjacent.push(emptyIdx - GRID_SIZE);
  if (row < GRID_SIZE - 1) adjacent.push(emptyIdx + GRID_SIZE);
  if (col > 0) adjacent.push(emptyIdx - 1);
  if (col < GRID_SIZE - 1) adjacent.push(emptyIdx + 1);
  return adjacent;
}

export const BarleyBreakerGame: React.FC<ArcadeGameProps> = ({
  onBack,
  onWin,
  tokenReward,
}) => {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [wonReported, setWonReported] = useState(false);

  const startGame = () => {
    setGrid(createShuffledGrid());
    setMoves(0);
    setWon(false);
    setWonReported(false);
  };

  const handleTileClick = useCallback(
    (idx: number) => {
      if (!grid || won) return;
      const adjacent = getAdjacentToEmpty(grid);
      if (!adjacent.includes(idx)) return;
      const newGrid = [...grid];
      const emptyIdx = grid.indexOf(0);
      [newGrid[idx], newGrid[emptyIdx]] = [newGrid[emptyIdx], newGrid[idx]];
      const newMoves = moves + 1;
      setGrid(newGrid);
      setMoves(newMoves);
      if (isWon(newGrid)) {
        setWon(true);
      }
    },
    [grid, won, moves],
  );

  if (won && !wonReported) {
    setWonReported(true);
    onWin(tokenReward);
  }

  if (!grid) {
    return (
      <ArcadeGameShell title="Barley Breaker" onBack={onBack}>
        <p className="text-sm opacity-80 text-center max-w-xs mx-auto">
          The classic 15-puzzle. Slide tiles into order (1–15 top-left to
          bottom-right). Solve it to earn Raven Coins!
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            className="rounded bg-[#3e8948] px-6 py-3 text-white font-bold hover:brightness-95"
            onClick={startGame}
          >
            Start Puzzle
          </button>
        </div>
      </ArcadeGameShell>
    );
  }

  const adjacent = getAdjacentToEmpty(grid);

  return (
    <ArcadeGameShell title="Barley Breaker" onBack={onBack}>
      <div className="flex items-center justify-between text-xs opacity-70">
        <span>
          Moves: <strong className="text-white">{moves}</strong>
        </span>
        {won && (
          <span className="text-green-400 font-bold">
            Puzzle solved! 🎉 +{tokenReward} Raven Coins
          </span>
        )}
      </div>

      <div
        className="grid gap-1 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          width: "min(280px, 88vw)",
        }}
      >
        {grid.map((tile, idx) => {
          const isEmpty = tile === 0;
          const isMoveable = adjacent.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              aria-label={isEmpty ? "empty slot" : `tile ${tile}`}
              className={[
                "aspect-square rounded flex items-center justify-center text-lg font-bold border-2 transition-colors",
                isEmpty
                  ? "border-transparent bg-transparent cursor-default"
                  : isMoveable
                    ? "bg-[#3e8948] border-[#5aba6a] text-white cursor-pointer hover:brightness-110"
                    : "bg-[#f9f4e7] border-[#3e2731] text-[#3e2731] cursor-default",
              ].join(" ")}
              onClick={() => handleTileClick(idx)}
            >
              {isEmpty ? "" : tile}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {won ? (
          <button
            type="button"
            className="rounded bg-[#3e8948] px-5 py-2 text-white font-bold hover:brightness-95"
            onClick={startGame}
          >
            Play Again
          </button>
        ) : (
          <button
            type="button"
            className="rounded bg-[#1e6dd5] px-4 py-2 text-xs text-white hover:brightness-95"
            onClick={startGame}
          >
            New Puzzle
          </button>
        )}
      </div>
    </ArcadeGameShell>
  );
};
