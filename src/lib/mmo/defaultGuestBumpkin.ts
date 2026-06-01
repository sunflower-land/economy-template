import type { GuestBumpkinEquipped, GuestBumpkinJoin } from "./types";

/** Default outfit strings match Sunflower Land starter bumpkin (server fills missing slots as ""). */
const GUEST_EQUIPPED: GuestBumpkinEquipped = {
  background: "Farm Background",
  body: "Beige Farmer Potion",
  hair: "Basic Hair",
  shoes: "Black Farmer Boots",
  pants: "Farmer Overalls",
  tool: "Farmer Pitchfork",
  shirt: "Red Farmer Shirt",
  coat: "",
  onesie: "",
  suit: "",
  dress: "",
  hat: "",
  necklace: "",
  secondaryTool: "",
  wings: "",
  beard: "",
  aura: "",
};

export function createDefaultGuestBumpkin(): GuestBumpkinJoin {
  return {
    equipped: { ...GUEST_EQUIPPED },
    experience: 0,
    id: 0,
    skills: {},
    tokenUri: "",
    achievements: {},
  };
}
