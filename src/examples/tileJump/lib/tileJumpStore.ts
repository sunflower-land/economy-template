import { atom } from "nanostores";

export type TileJumpMode = "play" | "spectate";

export type TileJumpHudState = {
  /** Number of times the player has died */
  deaths: number;
  /** Whether the player has won */
  won: boolean;
  /** Current mode */
  mode: TileJumpMode;
};

export const $tileJumpHud = atom<TileJumpHudState>({
  deaths: 0,
  won: false,
  mode: "spectate",
});

export function addTileJumpDeath(): void {
  const prev = $tileJumpHud.get();
  $tileJumpHud.set({ ...prev, deaths: prev.deaths + 1 });
}

export function setTileJumpWon(): void {
  const prev = $tileJumpHud.get();
  $tileJumpHud.set({ ...prev, won: true });
}

export function setTileJumpMode(mode: TileJumpMode): void {
  $tileJumpHud.set({ ...$tileJumpHud.get(), mode });
}

export function resetTileJumpHud(): void {
  $tileJumpHud.set({ deaths: 0, won: false, mode: "spectate" });
}
