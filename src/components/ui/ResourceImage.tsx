import React from "react";
import classNames from "classnames";
import { RESOURCE_CONFIG, type ResourceName } from "config/resources.config";

type Props = {
  name: ResourceName;
  /** Display size in CSS pixels. */
  pixelSize?: number;
  className?: string;
};

/** In-world / inventory resource art from `config/resources.config.ts`. */
export const ResourceImage: React.FC<Props> = ({
  name,
  pixelSize = 24,
  className,
}) => {
  const { url, description } = RESOURCE_CONFIG[name];
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
