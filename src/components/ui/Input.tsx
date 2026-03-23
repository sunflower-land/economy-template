import React, { ChangeEvent, useState } from "react";
import classNames from "classnames";

import bg from "assets/ui/input_box_border.png";
import activeBg from "assets/ui/active_input_box_border.png";

type Props = {
  value?: string;
  className?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
};

/** Pixel-styled text field (Sunflower Land input border). */
export const Input: React.FC<Props> = ({
  value,
  onValueChange,
  className,
  placeholder = "",
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={classNames("relative w-full")}>
      <input
        style={{
          borderStyle: "solid",
          background: "white",
          imageRendering: "pixelated",
          borderImageRepeat: "stretch",
          outline: "none",
          borderImage: `url(${isFocused ? activeBg : bg})`,
          borderWidth: `10px 10px 10px 10px`,
          borderImageSlice: isFocused ? "4 fill" : "4 4 4 4 fill",
        }}
        type="text"
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onValueChange(e.target.value);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={classNames(
          "!bg-transparent cursor-pointer w-full p-2 h-12 text-sm",
          className,
        )}
      />
    </div>
  );
};
