/**
 * HUD / UI icons — bundled from the private `images` repo (sibling folder `../images`).
 * Clone https://github.com/sunflower-land/images next to this template, or change the
 * Vite alias in `vite.config.ts`.
 *
 * All entries: `assets/icons/*.png` unless noted.
 */
import basket from "@sl-assets/icons/basket.png";
import chop from "@sl-assets/icons/chop_icon.png";
import confirm from "@sl-assets/icons/confirm.png";
import dig from "@sl-assets/icons/dig_icon.png";
import disc from "@sl-assets/icons/disc.png";
import expressionChat from "@sl-assets/icons/expression_chat.png";
import fish from "@sl-assets/icons/fish_icon.png";
import flower from "@sl-assets/icons/flower_32.png";
import hammer from "@sl-assets/icons/hammer.png";
import heart from "@sl-assets/icons/heart.png";

export const ICON_CONFIG = {
  /** Chopping / wood gathering action */
  chop: { url: chop, description: "Chop action icon (~32px source)" },
  /** Digging / shovel affordance */
  dig: { url: dig, description: "Dig action icon (~32px source)" },
  /** Fishing / water activity */
  fish: { url: fish, description: "Fish activity icon (~32px source)" },
  /** Build / craft / repair */
  hammer: { url: hammer, description: "Hammer / build icon (~32px source)" },
  /** Lives / favourites / social */
  heart: { url: heart, description: "Heart icon (~32px source)" },
  /** Inventory / harvest basket */
  basket: { url: basket, description: "Basket / inventory icon (~32px source)" },
  /** Primary OK / confirm */
  confirm: { url: confirm, description: "Confirm / tick icon (~32px source)" },
  /** Flower / grow / season flavour */
  flower: { url: flower, description: "Flower icon 32px variant" },
  /** NPC chat / dialogue affordance */
  chat: { url: expressionChat, description: "Chat / speech bubble expression" },
  /** Token / disc / currency-style marker (use in HUD for soft currency) */
  disc: { url: disc, description: "Disc / token marker (~32px source)" },
} as const;

export type IconName = keyof typeof ICON_CONFIG;
