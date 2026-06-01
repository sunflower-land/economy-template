export interface PortalPortTarget {
  id: string;
  sourcePath: string;
  targetModule: string;
  status: "planned" | "in-progress" | "ported";
}

/**
 * Placeholder registry for games/components to migrate from
 * ispunkzombiez/Sunflower-Land (portal branch).
 */
export const portalPortTargets: PortalPortTarget[] = [
  {
    id: "portal-game-shell",
    sourcePath: "src/features/minigames",
    targetModule: "src/features/arcade/games",
    status: "planned",
  },
  {
    id: "portal-api-hooks",
    sourcePath: "src/lib/minigames",
    targetModule: "src/features/arcade/portal",
    status: "planned",
  },
  {
    id: "portal-ui-panels",
    sourcePath: "src/components/ui",
    targetModule: "src/features/arcade/components",
    status: "planned",
  },
];
