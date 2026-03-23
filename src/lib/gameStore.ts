import { atom } from "nanostores";

/** Shared client state for React + Phaser (see docs/TECHNICAL.md). */
export type GameState = {
  coins: number;
  anonymous: boolean;
};

export const $gameState = atom<GameState>({
  coins: 0,
  anonymous: true,
});

export function hydrateGameState(profile: GameState): void {
  $gameState.set({ ...profile });
}

export function patchGameState(partial: Partial<GameState>): void {
  $gameState.set({ ...$gameState.get(), ...partial });
}
