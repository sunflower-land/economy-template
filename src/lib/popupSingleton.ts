import type { PopupId } from "lib/popups";

type OpenFn = (id: PopupId, payload?: Record<string, unknown>) => void;
type CloseFn = () => void;

let openImpl: OpenFn | null = null;
let closeImpl: CloseFn | null = null;

/**
 * Imperative popups for Phaser or non-React code. Bound once inside `PopupProvider`.
 * One popup at a time — opening replaces the current popup.
 */
export const popupSingleton = {
  bind(open: OpenFn, close: CloseFn): void {
    openImpl = open;
    closeImpl = close;
  },

  unbind(): void {
    openImpl = null;
    closeImpl = null;
  },

  open(id: PopupId, payload?: Record<string, unknown>): void {
    openImpl?.(id, payload);
  },

  close(): void {
    closeImpl?.();
  },
};
