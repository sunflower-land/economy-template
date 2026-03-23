import React from "react";
import classNames from "classnames";
import { pixelDarkBorderStyle, pixelLightBorderStyle } from "lib/style";
import { PIXEL_SCALE } from "lib/constants";

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  hasTabs?: boolean;
  tabAlignment?: "top" | "left";
}

export const InnerPanel: React.FC<
  React.PropsWithChildren<
    React.HTMLAttributes<HTMLDivElement> & {
      divRef?: React.RefObject<HTMLDivElement | null>;
    }
  >
> = ({ children, ...divProps }) => {
  const { className, style, divRef, ...otherDivProps } = divProps;

  return (
    <div
      className={classNames(className)}
      style={{
        ...pixelLightBorderStyle,
        padding: `${PIXEL_SCALE * 1}px`,
        background: "#e4a672",
        ...style,
      }}
      ref={divRef}
      {...otherDivProps}
    >
      {children}
    </div>
  );
};

export const OuterPanel: React.FC<React.PropsWithChildren<PanelProps>> = ({
  children,
  hasTabs,
  tabAlignment = "top",
  ...divProps
}) => {
  const { className, style, ...otherDivProps } = divProps;

  return (
    <div
      className={classNames(className, "bg-[#c28569]")}
      style={{
        ...pixelDarkBorderStyle,
        padding: `${PIXEL_SCALE * 1}px`,
        ...(hasTabs
          ? {
              paddingTop:
                tabAlignment === "top" ? `${PIXEL_SCALE * 15}px` : undefined,
              paddingLeft:
                tabAlignment === "left" ? `${PIXEL_SCALE * 15}px` : undefined,
            }
          : {}),
        ...style,
      }}
      {...otherDivProps}
    >
      {children}
    </div>
  );
};

export const Panel: React.FC<React.PropsWithChildren<PanelProps>> = ({
  children,
  hasTabs,
  ...divProps
}) => {
  return (
    <OuterPanel hasTabs={hasTabs} {...divProps}>
      <InnerPanel>{children}</InnerPanel>
    </OuterPanel>
  );
};
