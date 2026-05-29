import React, { useMemo, useState } from "react";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { useMinigameSession } from "lib/portal";

type EconomyAction = {
  type?: string;
  name?: string;
  description?: string;
  mint?: Record<string, { amount?: number } | number>;
  burn?: Record<string, { amount?: number; min?: number; max?: number } | number>;
};

type NightshadeArcadeShopProps = {
  onClose: () => void;
};

function toAmount(rule: unknown): number | null {
  if (typeof rule === "number") return rule;
  if (rule && typeof rule === "object" && "amount" in rule) {
    const amount = (rule as { amount?: number }).amount;
    return typeof amount === "number" ? amount : null;
  }
  return null;
}

export const NightshadeArcadeShop: React.FC<NightshadeArcadeShopProps> = ({
  onClose,
}) => {
  const { actions, dispatchAction, apiError } = useMinigameSession();
  const [localError, setLocalError] = useState<string | null>(null);

  const shopItems = useMemo(
    () =>
      Object.entries(actions as Record<string, EconomyAction>).filter(
        ([, action]) => action?.type === "shop",
      ),
    [actions],
  );

  return (
    <div className="w-full max-w-md rounded bg-[#1f1529] p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Raven Coin Shop</h2>
        <Button onClick={onClose}>Close</Button>
      </div>

      {shopItems.length === 0 ? (
        <Label type="danger">No shop items are available right now.</Label>
      ) : (
        <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {shopItems.map(([id, action]) => {
            const burn = Object.entries(action.burn ?? {});
            const mint = Object.entries(action.mint ?? {});
            const hasRangedCost = burn.some(([, value]) => toAmount(value) == null);

            return (
              <div key={id} className="rounded border border-white/15 bg-black/30 p-3">
                <div className="text-xs font-semibold">{action.name ?? id}</div>
                {action.description ? (
                  <div className="mt-1 text-[11px] text-[#dfc7f1]">{action.description}</div>
                ) : null}
                {burn.length > 0 ? (
                  <div className="mt-2 text-[11px] text-[#f7d2dd]">
                    Cost:{" "}
                    {burn
                      .map(([token, value]) =>
                        toAmount(value) == null ? `${token} (variable)` : `${toAmount(value)} ${token}`,
                      )
                      .join(" + ")}
                  </div>
                ) : null}
                {mint.length > 0 ? (
                  <div className="mt-1 text-[11px] text-[#c9e5ff]">
                    Reward:{" "}
                    {mint
                      .map(([token, value]) =>
                        toAmount(value) == null ? token : `${toAmount(value)} ${token}`,
                      )
                      .join(", ")}
                  </div>
                ) : null}
                <div className="mt-2">
                  <Button
                    disabled={hasRangedCost}
                    onClick={() => {
                      setLocalError(null);
                      const result = dispatchAction({ action: id });
                      if (!result.ok) {
                        setLocalError(result.error);
                      }
                    }}
                  >
                    {hasRangedCost ? "Unavailable" : "Buy"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {localError ? <div className="mt-3 text-xs text-red-300">{localError}</div> : null}
      {apiError ? <div className="mt-2 text-xs text-red-300">{apiError}</div> : null}
    </div>
  );
};
