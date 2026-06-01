import React from "react";
import classNames from "classnames";
import { SUNNYSIDE } from "example-assets/sunnyside";
import { RoundButton } from "components/ui/RoundButton";
import { PIXEL_SCALE } from "lib/constants";
import { useSound } from "lib/utils/hooks/useSound";

export const PortalBasketButton: React.FC<{
  onClick: () => void;
  pulse?: boolean;
}> = ({ onClick, pulse }) => {
  const inventory = useSound("inventory");

  return (
    <RoundButton
      onClick={() => {
        inventory.play();
        onClick();
      }}
      className="mb-2"
    >
      <img
        alt="Inventory"
        src={SUNNYSIDE.icons.basket}
        className={classNames("absolute group-active:translate-y-[2px]", {
          "animate-pulsate": pulse,
        })}
        style={{
          top: `${PIXEL_SCALE * 5}px`,
          left: `${PIXEL_SCALE * 5}px`,
          width: `${PIXEL_SCALE * 12}px`,
        }}
      />
    </RoundButton>
  );
};
