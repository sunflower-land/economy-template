import React, { type JSX } from "react";
import classNames from "classnames";
import { InnerPanel } from "components/ui/Panel";

interface Props {
  divRef?: React.RefObject<HTMLDivElement | null>;
  tallMobileContent?: boolean;
  tallDesktopContent?: boolean;
  wideModal?: boolean;
  showPanel?: boolean;
  contentScrollable?: boolean;
  panel: JSX.Element;
  content: JSX.Element;
  mobileReversePanelOrder?: boolean;
}

export const SplitScreenView: React.FC<Props> = ({
  divRef,
  tallMobileContent = false,
  wideModal = false,
  showPanel: showHeader = true,
  contentScrollable = true,
  mobileReversePanelOrder = false,
  panel: header,
  content,
  tallDesktopContent = false,
}) => {
  return (
    <div
      className={classNames("flex sm:flex-row", {
        "flex-col": mobileReversePanelOrder,
        "flex-col-reverse": !mobileReversePanelOrder,
      })}
    >
      <InnerPanel
        className={classNames("flex h-fit w-full p-1 sm:w-3/5", {
          "sm:max-h-96": !tallDesktopContent,
          "sm:max-h-[30rem]": tallDesktopContent,
          "max-h-80": tallMobileContent,
          "max-h-56": !tallMobileContent,
          "lg:w-3/4": wideModal,
          "flex-wrap overflow-y-auto scrollable overflow-x-hidden sm:mr-1":
            contentScrollable,
          "flex-col": !contentScrollable,
          "mt-1 sm:mt-0": !mobileReversePanelOrder,
        })}
        divRef={divRef}
      >
        {content}
      </InnerPanel>
      {showHeader && (
        <InnerPanel
          className={classNames("h-fit w-full sm:w-2/5", {
            "lg:w-1/4": wideModal,
            "mt-1 sm:mt-0": mobileReversePanelOrder,
          })}
        >
          {header}
        </InnerPanel>
      )}
    </div>
  );
};
