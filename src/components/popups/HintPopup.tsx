import React from "react";
import { Panel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { Button } from "components/ui/Button";
import type { PopupRenderProps } from "lib/popups";

export const HintPopup: React.FC<PopupRenderProps> = ({ onClose, payload }) => {
  const message =
    typeof payload?.message === "string"
      ? payload.message
      : "No message provided.";

  return (
    <Panel className="w-full">
      <div className="flex flex-col gap-3 p-1">
        <Label type="info">Hint</Label>
        <p className="text-xs text-[#3e2731] leading-relaxed">{message}</p>
        <Button type="button" onClick={onClose}>
          Close
        </Button>
      </div>
    </Panel>
  );
};
