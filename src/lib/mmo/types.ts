import type { Room } from "colyseus.js";

import type { MMO_PRODUCTION_PLAZA_ROOM } from "./servers";

export type MmoProductionPlazaRoomName = typeof MMO_PRODUCTION_PLAZA_ROOM;

/** Join payload shape accepted by `BaseRoom.onJoin` (JWT is optional; server defaults auth to empty). */
export type GuestBumpkinEquipped = {
  background: string;
  body: string;
  hair: string;
  shoes: string;
  pants: string;
  tool: string;
  shirt: string;
  coat: string;
  onesie: string;
  suit: string;
  dress: string;
  hat: string;
  necklace: string;
  secondaryTool: string;
  wings: string;
  beard: string;
  aura: string;
  necklace?: string;
  secondaryTool?: string;
};

export type GuestBumpkinJoin = {
  equipped: GuestBumpkinEquipped;
  experience: number;
  id: number;
  skills: Record<string, unknown>;
  tokenUri: string;
  achievements: Record<string, unknown>;
};

/** Minimal room handle for Phaser (Colyseus `Room` is compatible). */
export type MmoPlazaRoom = Pick<Room, "sessionId" | "send" | "leave" | "state">;
