import React from "react";
import classNames from "classnames";
import Decimal from "decimal.js-light";
import { pixelDarkBorderStyle } from "lib/style";
import { PIXEL_SCALE } from "lib/constants";
import { Label } from "./Label";

const INNER = 14;

/** Compact inventory-style tile used by Chicken Rescue HUD (subset of main-game Box). */
export const Box: React.FC<{
  image: string;
  count?: Decimal;
  showCountIfZero?: boolean;
  hideCount?: boolean;
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
  parentDivRef?: React.RefObject<HTMLDivElement | null>;
}> = ({
  image,
  count,
  showCountIfZero,
  hideCount,
  className,
  onClick,
  isSelected,
  parentDivRef,
}) => {
  const showLabel =
    !hideCount &&
    count !== undefined &&
    (showCountIfZero ? count.gte(0) : count.gt(0));

  return (
    <div ref={parentDivRef} className={classNames("relative", className)}>
      <div
        className={classNames(
          "relative flex items-center justify-center bg-brown-600",
          onClick && "cursor-pointer hover:brightness-95",
          isSelected && "ring-2 ring-[#ffb01e]",
        )}
        style={{
          width: `${PIXEL_SCALE * (INNER + 4)}px`,
          height: `${PIXEL_SCALE * (INNER + 4)}px`,
          marginTop: `${PIXEL_SCALE * 3}px`,
          marginBottom: `${PIXEL_SCALE * 2}px`,
          marginLeft: `${PIXEL_SCALE * 2}px`,
          marginRight: `${PIXEL_SCALE * 3}px`,
          ...pixelDarkBorderStyle,
        }}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <img
          src={image}
          alt=""
          className="max-w-[85%] max-h-[85%] object-contain"
          draggable={false}
          style={{ imageRendering: "pixelated" }}
        />
        {showLabel && (
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              right: `${PIXEL_SCALE * -5}px`,
              top: `${PIXEL_SCALE * -5}px`,
            }}
          >
            <Label
              type="default"
              style={{
                paddingLeft: "2.5px",
                paddingRight: "1.5px",
                height: "24px",
              }}
            >
              {count.toString()}
            </Label>
          </div>
        )}
      </div>
    </div>
  );
};
