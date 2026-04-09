import { getAnimationApiBase } from "lib/portal/url";

/** Spritesheet URL for bumpkin idle/walk (same path as `BumpkinContainer`). */
export function bumpkinSpritesheetUrl(tokenParts: string): string {
  return `${getAnimationApiBase()}/animate/0_v1_${tokenParts}/idle_walking_dig_drilling`;
}
