import React from "react";
import classNames from "classnames";
import { PIXEL_SCALE } from "lib/constants";
import { SUNNYSIDE } from "example-assets/sunnyside";

interface RoundButtonProps {
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
  disabled?: boolean;
  className?: string;
  buttonSize?: number;
}

export const RoundButton: React.FC<React.PropsWithChildren<RoundButtonProps>> =
  ({ children, onClick, disabled, className, buttonSize = 22 }) => {
    return (
      <div
        onClick={onClick}
        className={classNames("relative flex", className, {
          "cursor-pointer hover:img-highlight group": !disabled,
        })}
        style={{
          width: `${PIXEL_SCALE * buttonSize}px`,
          height: `${PIXEL_SCALE * buttonSize}px`,
        }}
      >
        <img
          src={SUNNYSIDE.ui.round_button_pressed}
          className="absolute"
          alt=""
          style={{
            width: `${PIXEL_SCALE * buttonSize}px`,
          }}
        />
        <img
          src={SUNNYSIDE.ui.round_button}
          className="absolute group-active:hidden"
          alt=""
          style={{
            width: `${PIXEL_SCALE * buttonSize}px`,
          }}
        />
        {children}
      </div>
    );
  };
