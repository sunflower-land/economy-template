import React from "react";
import { PIXEL_SCALE } from "lib/constants";

export type ProgressType =
  | "progress"
  | "health"
  | "error"
  | "buff"
  | "quantity";

const PROGRESS_COLORS: Record<
  ProgressType,
  { color: string; backgroundColor: string }
> = {
  progress: { color: "#63c74d", backgroundColor: "#193c3e" },
  health: { color: "#0099db", backgroundColor: "#0d2f6d" },
  error: { color: "#e43b44", backgroundColor: "#3e2731" },
  buff: { color: "#b65389", backgroundColor: "#193c3e" },
  quantity: { color: "#ffb01e", backgroundColor: "#543a2b" },
};

/** Pixel-style fill bar (template subset; no react-spring). */
export const ResizableBar: React.FC<{
  percentage: number;
  type: ProgressType;
  outerDimensions?: { width: number; height: number };
}> = ({ percentage, type, outerDimensions = { width: 15, height: 7 } }) => {
  const innerWidth = outerDimensions.width - 4;
  const clampedProgress = Math.max(0, Math.min(percentage, 100)) / 100;
  const progressFillPercentage =
    (Math.floor(clampedProgress * innerWidth) / innerWidth) * 100;
  const { color, backgroundColor } = PROGRESS_COLORS[type];

  return (
    <div
      className="relative rounded-sm border-2 border-[#181425]"
      style={{
        width: `${PIXEL_SCALE * outerDimensions.width}px`,
        height: `${PIXEL_SCALE * outerDimensions.height}px`,
        backgroundColor,
      }}
    >
      <div
        className="relative h-full"
        style={{
          transition: "width 0.5s",
          backgroundColor: color,
          width: `${progressFillPercentage}%`,
        }}
      />
    </div>
  );
};
