import { TileJumpApp } from "examples/tileJump/TileJumpApp";
import { HideAndSeekApp } from "examples/hideAndSeek/HideAndSeekApp";
import { ChickenRescueApp } from "examples/chickenRescue/ChickenRescue";
import { GoldenCropsApp } from "examples/goldenCrops/GoldenCropsApp";
import { PlazaPartyApp } from "examples/plazaParty/PlazaPartyApp";
import { UiResourcesApp } from "examples/ui-resources/UiResourcesApp";
import { BlackjackGame } from "./blackjack/BlackjackGame";
import { GoFishGame } from "./gofish/GoFishGame";
import { UnoGame } from "./uno/UnoGame";
import { SolitaireGame } from "./solitaire/SolitaireGame";
import { PokerGame } from "./poker/PokerGame";
import { BarleyBreakerGame } from "./barleybreaker/BarleyBreakerGame";
import { TetrisGame } from "./tetris/TetrisGame";
import { GoblinInvadersGame } from "./goblininvaders/GoblinInvadersGame";
import { PacManGame } from "./pacman/PacManGame";
import { FroggerGame } from "./frogger/FroggerGame";
import type { ArcadeGameEntry, ArcadeGameProps } from "../types";
import type { ComponentType } from "react";

/**
 * Demo example apps do not accept ArcadeGameProps (they have no onBack/onWin).
 * Wrap them so they conform to the registry interface; back is handled at the
 * hub level via the registry system.
 */
function wrapDemo(App: ComponentType): ComponentType<ArcadeGameProps> {
  const Wrapper: ComponentType<ArcadeGameProps> = () => <App />;
  Wrapper.displayName = `DemoWrapper(${App.displayName ?? App.name})`;
  return Wrapper;
}

/**
 * Central arcade game registry.
 *
 * ── Implementation status key ───────────────────────────────────────────────
 * backingType "local"      → fully playable React-native game component
 * backingType "scaffolded" → non-broken placeholder; full implementation pending
 * backingType "portal"     → reserved for future hosted-portal integration
 *
 * ── Checklist sync (from docs/arcade-migration-handoff.txt) ────────────────
 * [x] Poker              — local, available
 * [x] Blackjack          — local, available
 * [x] Go Fish            — local, available
 * [x] Uno                — local, available
 * [x] Solitaire          — local, available
 * [x] Goblin Invaders    — local, available  (target-native, source unverified)
 * [x] Tetris             — local, available  (target-native, source unverified)
 * [x] Barley Breaker     — local, available  (target-native, source unverified)
 * [ ] Pac-Man            — scaffolded        (source unverified; TODO implement)
 * [ ] Frogger            — scaffolded        (source unverified; TODO implement)
 * ── Demo entries (pre-existing, not part of the migration checklist) ─────────
 * [x] Tile Jump          — local demo
 * [x] Hide & Seek        — local demo
 * [x] Chicken Rescue     — local demo
 * [x] Golden Crops       — local demo
 * [x] Plaza Party        — local demo
 * [x] UI Resources       — local demo
 */
export const GAME_REGISTRY: ArcadeGameEntry[] = [
  // ── Migration checklist: completed ─────────────────────────────────────────
  {
    id: "poker",
    name: "Poker",
    description: "Texas Hold'em against the house.",
    tokenReward: 100,
    status: "available",
    backingType: "local",
    component: PokerGame,
  },
  {
    id: "blackjack",
    name: "Blackjack",
    description: "Beat the dealer without busting.",
    tokenReward: 100,
    status: "available",
    backingType: "local",
    component: BlackjackGame,
  },
  {
    id: "gofish",
    name: "Go Fish",
    description: "Collect matching sets before your opponent.",
    tokenReward: 75,
    status: "available",
    backingType: "local",
    component: GoFishGame,
  },
  {
    id: "uno",
    name: "Uno",
    description: "Play special cards to empty your hand first.",
    tokenReward: 90,
    status: "available",
    backingType: "local",
    component: UnoGame,
  },
  {
    id: "solitaire",
    name: "Solitaire",
    description: "Classic card-stacking challenge.",
    tokenReward: 70,
    status: "available",
    backingType: "local",
    component: SolitaireGame,
  },
  // ── Migration checklist: newly implemented (target-native) ──────────────────
  {
    id: "goblin-invaders",
    name: "Goblin Invaders",
    description: "Arcade survival shooter.",
    tokenReward: 120,
    status: "available",
    backingType: "local",
    component: GoblinInvadersGame,
    devNote:
      "Target-native Space Invaders variant. Source minigame id `goblin-invaders` is known; local source file in Sunflower-Land was not verified during the research handoff.",
  },
  {
    id: "tetris",
    name: "Tetris",
    description: "Clear lines with falling blocks.",
    tokenReward: 110,
    status: "available",
    backingType: "local",
    component: TetrisGame,
    devNote:
      "Target-native Tetris implementation. Source minigame id `tetris` is known; local source file in Sunflower-Land was not verified during the research handoff.",
  },
  {
    id: "barley-breaker",
    name: "Barley Breaker",
    description: "Classic 15-puzzle tile challenge.",
    tokenReward: 80,
    status: "available",
    backingType: "local",
    component: BarleyBreakerGame,
    devNote:
      "Target-native 15-puzzle implementation. Source minigame id `barley-breaker` is known; local source file in Sunflower-Land was not verified during the research handoff.",
  },
  // ── Migration checklist: scaffolded (pending implementation) ───────────────
  {
    id: "pac-man",
    name: "Pac-Man",
    description: "Navigate mazes and avoid enemies.",
    tokenReward: 95,
    status: "scaffolded",
    backingType: "scaffolded",
    component: PacManGame,
    portalId: "pac-man",
    devNote:
      "Scaffolded. Source minigame id `pac-man` is known; local source file in Sunflower-Land was not verified. Implement as target-native maze game (Path A) or confirm portal hosting (Path B).",
  },
  {
    id: "frogger",
    name: "Frogger",
    description: "Cross lanes and rivers safely.",
    tokenReward: 85,
    status: "scaffolded",
    backingType: "scaffolded",
    component: FroggerGame,
    portalId: "frogger",
    devNote:
      "Scaffolded. Source minigame id `frogger` is known; local source file in Sunflower-Land was not verified. Implement as target-native lane-crossing game (Path A) or confirm portal hosting (Path B).",
  },
  // ── Pre-existing demo examples (not migration checklist items) ─────────────
  {
    id: "tile-jump",
    name: "Tile Jump (Playable Demo)",
    description: "Playable minigame already wired in this repo.",
    tokenReward: 50,
    status: "available",
    backingType: "local",
    component: wrapDemo(TileJumpApp),
  },
  {
    id: "hide-and-seek",
    name: "Hide & Seek (Playable Demo)",
    description: "Playable MMO-style minigame demo.",
    tokenReward: 50,
    status: "available",
    backingType: "local",
    component: wrapDemo(HideAndSeekApp),
  },
  {
    id: "chicken-rescue",
    name: "Chicken Rescue (Playable Demo)",
    description: "Playable economy minigame from repository examples.",
    tokenReward: 60,
    status: "available",
    backingType: "local",
    component: wrapDemo(ChickenRescueApp),
  },
  {
    id: "golden-crops",
    name: "Golden Crops (Playable Demo)",
    description: "Playable farming minigame from repository examples.",
    tokenReward: 60,
    status: "available",
    backingType: "local",
    component: wrapDemo(GoldenCropsApp),
  },
  {
    id: "plaza-party",
    name: "Plaza Party (Playable Demo)",
    description: "Playable plaza exploration minigame from repository examples.",
    tokenReward: 60,
    status: "available",
    backingType: "local",
    component: wrapDemo(PlazaPartyApp),
  },
  {
    id: "ui-resources",
    name: "UI Resources (Playable Demo)",
    description: "Playable economy dashboard demo from repository examples.",
    tokenReward: 40,
    status: "available",
    backingType: "local",
    component: wrapDemo(UiResourcesApp),
  },
];

/** Look up a registry entry by id. */
export function getGameEntry(id: string): ArcadeGameEntry | undefined {
  return GAME_REGISTRY.find((g) => g.id === id);
}
