import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { ArcadeGameShell } from "../../components/ArcadeGameShell";
import type { ArcadeGameProps } from "../../types";

/**
 * Tetris — classic falling-block puzzle game.
 * Target-native implementation. Source location in Sunflower-Land was not
 * verified during the research handoff, so this is a clean local build.
 *
 * Controls: ← → move | ↑ / Z rotate | ↓ soft drop | Space hard drop
 * Win condition: clear 5 or more lines in a run to earn Raven Coins when the
 * run ends.
 */

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BASE_TICK_MS = 500;
const LINES_TO_WIN = 5;

type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
type CellColor = string | null;
type Board = CellColor[][];

interface Piece {
  type: TetrominoType;
  shape: number[][];
  color: string;
}

const TETROMINOES: Record<TetrominoType, Omit<Piece, "type">> = {
  I: { shape: [[1, 1, 1, 1]], color: "#00bcd4" },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#ffeb3b",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#9c27b0",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#4caf50",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#f44336",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#2196f3",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#ff9800",
  },
};

function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array<CellColor>(BOARD_WIDTH).fill(null),
  );
}

function randomPiece(): Piece {
  const types: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
  const type = types[Math.floor(Math.random() * types.length)];
  return { type, ...TETROMINOES[type] };
}

function rotateCW(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const result: number[][] = Array.from({ length: cols }, () =>
    Array<number>(rows).fill(0),
  );
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = shape[r][c];
    }
  }
  return result;
}

function fits(board: Board, shape: number[][], x: number, y: number): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nr = y + r;
      const nc = x + c;
      if (nr < 0 || nr >= BOARD_HEIGHT || nc < 0 || nc >= BOARD_WIDTH)
        return false;
      if (board[nr][nc]) return false;
    }
  }
  return true;
}

function lockPiece(
  board: Board,
  shape: number[][],
  x: number,
  y: number,
  color: string,
): Board {
  const next = board.map((row) => [...row]);
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        next[y + r][x + c] = color;
      }
    }
  }
  return next;
}

function sweepLines(board: Board): { board: Board; cleared: number } {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = BOARD_HEIGHT - remaining.length;
  const blank = Array.from({ length: cleared }, () =>
    Array<CellColor>(BOARD_WIDTH).fill(null),
  );
  return { board: [...blank, ...remaining], cleared };
}

const SCORE_TABLE = [0, 100, 300, 500, 800];

interface TetrisState {
  board: Board;
  piece: Piece;
  x: number;
  y: number;
  score: number;
  lines: number;
  gameOver: boolean;
}

function spawnState(board: Board, prev?: TetrisState): TetrisState | null {
  const piece = randomPiece();
  const x = Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2);
  if (!fits(board, piece.shape, x, 0)) return null;
  return {
    board,
    piece,
    x,
    y: 0,
    score: prev?.score ?? 0,
    lines: prev?.lines ?? 0,
    gameOver: false,
  };
}

export const TetrisGame: React.FC<ArcadeGameProps> = ({
  onBack,
  onWin,
  tokenReward,
}) => {
  const [state, setState] = useState<TetrisState | null>(null);
  const [wonReported, setWonReported] = useState(false);
  const stateRef = useRef<TetrisState | null>(null);
  stateRef.current = state;

  const startGame = useCallback(() => {
    const initial = spawnState(createBoard());
    setState(initial);
    setWonReported(false);
  }, []);

  // Tick: drop piece one row
  const tick = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.gameOver) return prev;
      const { board, piece, x, y } = prev;
      if (fits(board, piece.shape, x, y + 1)) {
        return { ...prev, y: y + 1 };
      }
      // Lock
      const locked = lockPiece(board, piece.shape, x, y, piece.color);
      const { board: swept, cleared } = sweepLines(locked);
      const newLines = prev.lines + cleared;
      const newScore = prev.score + SCORE_TABLE[Math.min(cleared, 4)];
      const next = spawnState(swept, { ...prev, lines: newLines, score: newScore });
      if (!next) {
        return { ...prev, board: swept, lines: newLines, score: newScore, gameOver: true };
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!state || state.gameOver) return;
    const id = setInterval(tick, BASE_TICK_MS);
    return () => clearInterval(id);
  }, [state?.gameOver, tick]);

  useEffect(() => {
    if (!state?.gameOver || state.lines < LINES_TO_WIN || wonReported) return;
    setWonReported(true);
    onWin(tokenReward);
  }, [state?.gameOver, state?.lines, wonReported, onWin, tokenReward]);

  const moveLeft = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.gameOver) return prev;
      return fits(prev.board, prev.piece.shape, prev.x - 1, prev.y)
        ? { ...prev, x: prev.x - 1 }
        : prev;
    });
  }, []);

  const moveRight = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.gameOver) return prev;
      return fits(prev.board, prev.piece.shape, prev.x + 1, prev.y)
        ? { ...prev, x: prev.x + 1 }
        : prev;
    });
  }, []);

  const rotate = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.gameOver) return prev;
      const rotated = rotateCW(prev.piece.shape);
      return fits(prev.board, rotated, prev.x, prev.y)
        ? { ...prev, piece: { ...prev.piece, shape: rotated } }
        : prev;
    });
  }, []);

  const hardDrop = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.gameOver) return prev;
      let ny = prev.y;
      while (fits(prev.board, prev.piece.shape, prev.x, ny + 1)) ny++;
      const locked = lockPiece(prev.board, prev.piece.shape, prev.x, ny, prev.piece.color);
      const { board: swept, cleared } = sweepLines(locked);
      const newLines = prev.lines + cleared;
      const newScore = prev.score + SCORE_TABLE[Math.min(cleared, 4)];
      const next = spawnState(swept, { ...prev, lines: newLines, score: newScore });
      if (!next) {
        return { ...prev, board: swept, lines: newLines, score: newScore, gameOver: true };
      }
      return next;
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!stateRef.current || stateRef.current.gameOver) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); moveLeft(); }
      if (e.key === "ArrowRight") { e.preventDefault(); moveRight(); }
      if (e.key === "ArrowDown") { e.preventDefault(); tick(); }
      if (e.key === "ArrowUp" || e.key === "z" || e.key === "Z") { e.preventDefault(); rotate(); }
      if (e.key === " ") { e.preventDefault(); hardDrop(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [moveLeft, moveRight, tick, rotate, hardDrop]);

  if (!state) {
    return (
      <ArcadeGameShell title="Tetris" onBack={onBack}>
        <p className="text-sm opacity-80 text-center max-w-xs mx-auto">
          Clear falling blocks to score. Reach {LINES_TO_WIN}+ lines, then finish
          the run to earn Raven Coins.
          <br />
          <span className="opacity-60 text-xs">
            ← → move · ↑ / Z rotate · ↓ soft drop · Space hard drop
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

  // Build display board with active piece overlaid
  const display: CellColor[][] = state.board.map((row) => [...row]);
  if (!state.gameOver) {
    const { piece, x, y } = state;
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const br = y + r;
          const bc = x + c;
          if (br >= 0 && br < BOARD_HEIGHT && bc >= 0 && bc < BOARD_WIDTH) {
            display[br][bc] = piece.color;
          }
        }
      }
    }
  }

  return (
    <ArcadeGameShell title="Tetris" onBack={onBack}>
      <div className="flex gap-4 items-start justify-center flex-wrap">
        {/* Board */}
        <div
          className="border border-white/20 bg-black/40 shrink-0"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            width: "min(200px, 55vw)",
          }}
        >
          {display.flat().map((cell, i) => (
            <div
              key={i}
              className="border border-white/5"
              style={{ backgroundColor: cell ?? "transparent", aspectRatio: "1" }}
            />
          ))}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-3 text-sm min-w-[100px]">
          <div>
            <div className="text-xs opacity-60">Score</div>
            <div className="font-bold text-yellow-400">{state.score}</div>
          </div>
          <div>
            <div className="text-xs opacity-60">Lines</div>
            <div className="font-bold">
              {state.lines} / {LINES_TO_WIN}
            </div>
          </div>

          <div className="text-xs opacity-50 mt-1 leading-relaxed">
            ← → move
            <br />
            ↑ / Z rotate
            <br />
            ↓ soft drop
            <br />
            Space hard drop
          </div>

          {/* Touch controls */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex gap-1">
              <button
                type="button"
                className="flex-1 rounded bg-[#3e2731] px-1 py-1 text-xs text-white"
                onClick={moveLeft}
              >
                ←
              </button>
              <button
                type="button"
                className="flex-1 rounded bg-[#3e2731] px-1 py-1 text-xs text-white"
                onClick={moveRight}
              >
                →
              </button>
            </div>
            <button
              type="button"
              className="rounded bg-[#3e2731] px-1 py-1 text-xs text-white"
              onClick={rotate}
            >
              ↺ Rotate
            </button>
            <button
              type="button"
              className="rounded bg-[#1e6dd5] px-1 py-1 text-xs text-white"
              onClick={tick}
            >
              ↓ Drop
            </button>
            <button
              type="button"
              className="rounded bg-[#b65389] px-1 py-1 text-xs text-white"
              onClick={hardDrop}
            >
              ⬇ Hard Drop
            </button>
          </div>

          {state.gameOver && (
            <div className="mt-2">
              <div className="text-red-400 font-bold">Game Over</div>
              {state.lines >= LINES_TO_WIN && (
                <div className="text-green-400 text-xs">
                  +{tokenReward} Raven Coins!
                </div>
              )}
              {state.lines < LINES_TO_WIN && (
                <div className="text-xs opacity-60">
                  Clear {LINES_TO_WIN}+ lines this run to earn coins at game over.
                </div>
              )}
              <button
                type="button"
                className="mt-2 rounded bg-[#3e8948] px-3 py-2 text-white text-xs font-bold"
                onClick={startGame}
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </ArcadeGameShell>
  );
};
