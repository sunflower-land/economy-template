import React, { useEffect, useMemo, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

import { Preloader } from "features/world/scenes/Preloader";
import { NightshadeArcadeScene } from "./NightshadeArcadeScene";
import { createDefaultGuestBumpkin } from "lib/mmo/defaultGuestBumpkin";
import { useMinigameSession } from "lib/portal";
import type { GuestBumpkinJoin } from "lib/mmo/types";
import {
  interpretTokenUri,
  tokenUriBuilder,
  type BumpkinParts,
} from "lib/utils/tokenUriBuilder";
import {
  decodePortalToken,
  decodePortalTokenClaims,
} from "lib/portal/decodePortalToken";

type SessionBumpkin = {
  equipped?: Record<string, string>;
  experience?: number;
  id?: number;
  tokenUri?: string;
};

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function asJsonRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return asRecord(parsed);
    } catch {
      return undefined;
    }
  }
  return asRecord(value);
}

const EQUIPPED_KEYS = [
  "background",
  "body",
  "hair",
  "shirt",
  "pants",
  "shoes",
  "tool",
  "hat",
  "necklace",
  "secondaryTool",
  "coat",
  "onesie",
  "suit",
  "wings",
  "dress",
  "beard",
  "aura",
] as const;

function toEquippedRecord(value: unknown): Record<string, string> | undefined {
  const direct = asJsonRecord(value);
  if (!direct) return undefined;

  const equipped = asJsonRecord(direct.equipped);
  if (equipped) return equipped as Record<string, string>;

  const clothing = asJsonRecord(direct.clothing);
  if (clothing) return clothing as Record<string, string>;

  const flattened = EQUIPPED_KEYS.reduce<Record<string, string>>((acc, key) => {
    const v = direct[key];
    if (typeof v === "string") {
      acc[key] = v;
    }
    return acc;
  }, {});

  return Object.keys(flattened).length > 0 ? flattened : undefined;
}

function normalizeSessionBumpkin(value: unknown): SessionBumpkin | undefined {
  if (typeof value === "string") {
    const parsed = asJsonRecord(value);
    if (parsed) {
      return normalizeSessionBumpkin(parsed);
    }

    const tokenUri = value.trim();
    return tokenUri ? { tokenUri } : undefined;
  }

  const direct = asRecord(value);
  if (!direct) return undefined;

  const nestedBumpkin = asRecord(direct.bumpkin);
  const profile = asRecord(direct.profile);
  const profileBumpkin = asRecord(profile?.bumpkin);

  const equipped =
    toEquippedRecord(direct) ??
    toEquippedRecord(nestedBumpkin) ??
    toEquippedRecord(profile) ??
    toEquippedRecord(profileBumpkin);
  const tokenUri = firstString(
    direct.tokenUri,
    direct.tokenURI,
    direct.uri,
    nestedBumpkin?.tokenUri,
    nestedBumpkin?.tokenURI,
    nestedBumpkin?.uri,
    profile?.tokenUri,
    profile?.tokenURI,
    profile?.uri,
    profileBumpkin?.tokenUri,
    profileBumpkin?.tokenURI,
    profileBumpkin?.uri,
  );
  const experience = firstNumber(
    direct.experience,
    nestedBumpkin?.experience,
    profile?.experience,
    profileBumpkin?.experience,
  );
  const id = firstNumber(
    direct.id,
    direct.bumpkinId,
    nestedBumpkin?.id,
    nestedBumpkin?.bumpkinId,
    profile?.id,
    profile?.bumpkinId,
    profileBumpkin?.id,
    profileBumpkin?.bumpkinId,
  );

  if (!equipped && !tokenUri && experience === undefined && id === undefined) {
    return undefined;
  }

  return { equipped, experience, id, tokenUri };
}

function mergeSessionBumpkins(
  ...candidates: Array<SessionBumpkin | undefined>
): SessionBumpkin | undefined {
  const merged = candidates.reduce<SessionBumpkin>(
    (acc, candidate) => {
      if (!candidate) return acc;

      return {
        equipped: acc.equipped ?? candidate.equipped,
        experience: acc.experience ?? candidate.experience,
        id: acc.id ?? candidate.id,
        tokenUri: acc.tokenUri ?? candidate.tokenUri,
      };
    },
    {},
  );

  if (
    !merged.equipped &&
    !merged.tokenUri &&
    merged.experience === undefined &&
    merged.id === undefined
  ) {
    return undefined;
  }

  return merged;
}

function extractSessionBumpkinFromJwt(jwt: string): SessionBumpkin | undefined {
  const claims = decodePortalTokenClaims(jwt);
  if (!claims) return undefined;

  const candidates: unknown[] = [
    claims.bumpkin,
    claims.profile,
    asRecord(claims.profile)?.bumpkin,
    asRecord(claims.farm)?.bumpkin,
    asRecord(claims.state)?.bumpkin,
    asRecord(asRecord(claims.state)?.farm)?.bumpkin,
    asRecord(claims.game)?.bumpkin,
    asRecord(asRecord(claims.game)?.farm)?.bumpkin,
    asRecord(claims.user)?.bumpkin,
    asRecord(asRecord(claims.user)?.profile)?.bumpkin,
    asRecord(claims.properties)?.bumpkin,
    asRecord(claims.properties)?.profile,
    asRecord(asRecord(claims.properties)?.profile)?.bumpkin,
    asRecord(asRecord(claims.properties)?.state)?.bumpkin,
    asRecord(asRecord(asRecord(claims.properties)?.state)?.farm)?.bumpkin,
    claims.tokenUri,
    asRecord(claims.user)?.tokenUri,
    asRecord(claims.properties)?.tokenUri,
  ];

  return mergeSessionBumpkins(
    ...candidates.map((candidate) => normalizeSessionBumpkin(candidate)),
  );
}

export const NightshadeArcadePhaser: React.FC = () => {
  const { farm, farmId, jwt } = useMinigameSession();
  const game = useRef<Game>(undefined);
  const tokenMeta = useMemo(() => decodePortalToken(jwt), [jwt]);

  const scene = "nightshade-arcade";
  const scenes: any[] = [Preloader, NightshadeArcadeScene];
  const bumpkin = useMemo<GuestBumpkinJoin>(() => {
    const sessionBumpkin = mergeSessionBumpkins(
      normalizeSessionBumpkin(farm.bumpkin),
      extractSessionBumpkinFromJwt(jwt),
    );
    const equipped = toEquippedRecord(sessionBumpkin);

    let interpreted: Record<string, string> | undefined;
    if (!equipped && sessionBumpkin?.tokenUri) {
      try {
        interpreted = interpretTokenUri(sessionBumpkin.tokenUri)
          .equipped as Record<string, string>;
      } catch {
        interpreted = undefined;
      }
    }

    const resolvedEquipped = equipped ?? interpreted;

    if (!resolvedEquipped) {
      return createDefaultGuestBumpkin();
    }

    const parts: BumpkinParts = {
      background: (resolvedEquipped.background || undefined) as BumpkinParts["background"],
      body: (resolvedEquipped.body || undefined) as BumpkinParts["body"],
      hair: (resolvedEquipped.hair || undefined) as BumpkinParts["hair"],
      shirt: (resolvedEquipped.shirt || undefined) as BumpkinParts["shirt"],
      pants: (resolvedEquipped.pants || undefined) as BumpkinParts["pants"],
      shoes: (resolvedEquipped.shoes || undefined) as BumpkinParts["shoes"],
      tool: (resolvedEquipped.tool || undefined) as BumpkinParts["tool"],
      hat: (resolvedEquipped.hat || undefined) as BumpkinParts["hat"],
      necklace: (resolvedEquipped.necklace || undefined) as BumpkinParts["necklace"],
      secondaryTool: (resolvedEquipped.secondaryTool || undefined) as BumpkinParts["secondaryTool"],
      coat: (resolvedEquipped.coat || undefined) as BumpkinParts["coat"],
      onesie: (resolvedEquipped.onesie || undefined) as BumpkinParts["onesie"],
      suit: (resolvedEquipped.suit || undefined) as BumpkinParts["suit"],
      wings: (resolvedEquipped.wings || undefined) as BumpkinParts["wings"],
      dress: (resolvedEquipped.dress || undefined) as BumpkinParts["dress"],
      beard: (resolvedEquipped.beard || undefined) as BumpkinParts["beard"],
      aura: (resolvedEquipped.aura || undefined) as BumpkinParts["aura"],
    };

    return {
      equipped: {
        background: resolvedEquipped.background ?? "",
        body: resolvedEquipped.body ?? "",
        hair: resolvedEquipped.hair ?? "",
        shoes: resolvedEquipped.shoes ?? "",
        pants: resolvedEquipped.pants ?? "",
        tool: resolvedEquipped.tool ?? "",
        shirt: resolvedEquipped.shirt ?? "",
        coat: resolvedEquipped.coat ?? "",
        onesie: resolvedEquipped.onesie ?? "",
        suit: resolvedEquipped.suit ?? "",
        dress: resolvedEquipped.dress ?? "",
        hat: resolvedEquipped.hat ?? "",
        wings: resolvedEquipped.wings ?? "",
        beard: resolvedEquipped.beard ?? "",
        aura: resolvedEquipped.aura ?? "",
      },
      experience: sessionBumpkin?.experience ?? 0,
      id: sessionBumpkin?.id ?? 0,
      skills: {},
      tokenUri: tokenUriBuilder(parts),
      achievements: {},
    };
  }, [farm.bumpkin, jwt]);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: AUTO,
      fps: {
        target: 30,
        smoothStep: true,
      },
      backgroundColor: "#000000",
      parent: "game-content",
      autoRound: true,
      pixelArt: true,
      plugins: {
        global: [
          {
            key: "rexNinePatchPlugin",
            plugin: NinePatchPlugin,
            start: true,
          },
          {
            key: "rexVirtualJoystick",
            plugin: VirtualJoystickPlugin,
            start: true,
          },
        ],
      },
      width: window.innerWidth,
      height: window.innerHeight,
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
          gravity: { x: 0, y: 0 },
        },
      },
      scene: scenes,
      loader: {
        crossOrigin: "anonymous",
      },
    };

    game.current = new Game(config);

    game.current.registry.set("initialScene", scene);
    game.current.registry.set("gameState", {
      bumpkin,
      username: farm.username ?? tokenMeta.username,
      balance: farm.balance,
    });
    game.current.registry.set("id", farmId);

    return () => {
      game.current?.destroy(true);
    };
  }, [bumpkin, farm.balance, farm.username, farmId, tokenMeta.username]);

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 10,
      }}
    >
      <div
        id="game-content"
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
};
