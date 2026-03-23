import React from "react";
import classNames from "classnames";
import { ICON_CONFIG, type IconName } from "config/icons.config";

type Props = {
  name: IconName;
  /** Display size in CSS pixels (art is authored ~16×16). */
  pixelSize?: number;
  className?: string;
};

/** Pixel-art icon from `config/icons.config.ts` (bundled from sibling `images` repo). */
export const Icon: React.FC<Props> = ({
  name,
  pixelSize = 16,
  className,
}) => {
  const { url, description } = ICON_CONFIG[name];
  return (
    <img
      src={url}
      alt={description}
      width={pixelSize}
      height={pixelSize}
      className={classNames(
        "inline-block shrink-0 [image-rendering:pixelated]",
        className,
      )}
      loading="lazy"
    />
  );
};
