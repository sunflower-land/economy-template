import React from "react";
import classNames from "classnames";
import { PIXEL_SCALE } from "lib/constants";
import { Panel, type PanelProps } from "components/ui/Panel";
import { SUNNYSIDE } from "example-assets/sunnyside";
import { useSound } from "lib/utils/hooks/useSound";

type Props = {
  title?: React.ReactNode;
  onClose?: () => void;
  onBack?: () => void;
  className?: string;
  container?: React.FC<React.PropsWithChildren<PanelProps>>;
  children?: React.ReactNode;
};

/**
 * Modal shell used by the ui-resources dashboard (subset of main-game CloseButtonPanel).
 */
export const CloseButtonPanel: React.FC<Props> = ({
  title,
  onClose,
  onBack,
  className,
  container: Container = Panel,
  children,
}) => {
  const button = useSound("button");
  const showClose = !!onClose;
  const showBack = !!onBack;

  return (
    <Container
      className={classNames(
        "relative max-h-[90vh] overflow-y-auto overflow-x-hidden",
        className,
      )}
    >
      <div>
        {title != null && title !== "" && (
          <div className="flex text-center">
            {(showClose || showBack) && (
              <div
                className="flex-none"
                style={{ width: `${PIXEL_SCALE * 11}px` }}
              >
                {showBack && (
                  <img
                    src={SUNNYSIDE.icons.arrow_left}
                    alt=""
                    className="cursor-pointer"
                    onClick={() => {
                      button.play();
                      onBack?.();
                    }}
                    style={{ width: `${PIXEL_SCALE * 11}px` }}
                  />
                )}
              </div>
            )}
            <div className="mb-3 grow text-lg">{title}</div>
            {(showClose || showBack) && (
              <div className="flex-none">
                {showClose && (
                  <img
                    src={SUNNYSIDE.icons.close}
                    alt=""
                    className="cursor-pointer"
                    onClick={() => onClose?.()}
                    style={{ width: `${PIXEL_SCALE * 11}px` }}
                  />
                )}
              </div>
            )}
          </div>
        )}
        {showClose && (title == null || title === "") && (
          <img
            src={SUNNYSIDE.icons.close}
            alt=""
            className="absolute right-3 top-3 z-20 cursor-pointer"
            onClick={() => onClose?.()}
            style={{ width: `${PIXEL_SCALE * 11}px` }}
          />
        )}
        {children}
      </div>
    </Container>
  );
};
