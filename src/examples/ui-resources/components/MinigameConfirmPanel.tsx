import React from "react";
import { createPortal } from "react-dom";
import { CloseButtonPanel } from "./CloseButtonPanel";
import { Button } from "components/ui/Button";

type Props = {
  show: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmDisabled?: boolean;
};

export const MinigameConfirmPanel: React.FC<Props> = ({
  show,
  title,
  children,
  confirmLabel,
  onConfirm,
  onClose,
  confirmDisabled = false,
}) => {
  if (!show) return null;

  return createPortal(
    <div
      data-html2canvas-ignore="true"
      className="fixed inset-0 z-[200] flex items-center justify-center p-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      style={{ background: "rgb(0 0 0 / 56%)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-full max-w-full"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <CloseButtonPanel className="w-[min(92vw,420px)]" onClose={onClose}>
          <div className="p-1">
            <h2 className="text-sm mb-2">{title}</h2>
            {children}
          </div>
          <Button disabled={confirmDisabled} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </CloseButtonPanel>
      </div>
    </div>,
    document.body,
  );
};
