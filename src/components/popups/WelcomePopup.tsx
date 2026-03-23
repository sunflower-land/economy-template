import React from "react";
import { Panel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { Button } from "components/ui/Button";
import type { PopupRenderProps } from "lib/popups";

export const WelcomePopup: React.FC<PopupRenderProps> = ({ onClose }) => {
  return (
    <Panel className="w-full">
      <div className="flex flex-col gap-3 p-1">
        <Label type="chill">Welcome</Label>
        <p className="text-xs text-[#3e2731] leading-relaxed">
          This is a Sunflower Land mini-game template. Use the docs in{" "}
          <code className="text-[10px] bg-black/10 px-1">docs/</code> and
          replace stubs in <code className="text-[10px] bg-black/10 px-1">src/lib/api.ts</code>.
        </p>
        <Button type="button" onClick={onClose}>
          Got it
        </Button>
      </div>
    </Panel>
  );
};
