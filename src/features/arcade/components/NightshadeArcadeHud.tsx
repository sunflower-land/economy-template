import React from "react";
import { HudContainer } from "components/ui/HudContainer";
import { requestClosePortal } from "lib/portal/closePortal";
import { useMinigameSession } from "lib/portal";
import { RoundButton } from "components/ui/RoundButton";
import ravenCoinIcon from "../assets/RavenCoin.webp";

type NightshadeArcadeHudProps = {
  extraRavenCoins: number;
};

const formatter = new Intl.NumberFormat();

export const NightshadeArcadeHud: React.FC<NightshadeArcadeHudProps> = ({
  extraRavenCoins,
}) => {
  const { farmId, farm, playerEconomy } = useMinigameSession();
  const baseRavenCoins = Number(playerEconomy.balances?.RavenCoin ?? 0);
  const totalRavenCoins = Math.max(0, baseRavenCoins + extraRavenCoins);
  const flowers = Number(farm.balance ?? 0);
  const coins = Number(playerEconomy.balances?.Coin ?? 0);
  const gems = Number(playerEconomy.balances?.Gem ?? 0);

  return (
    <HudContainer>
      <div className="absolute left-3 top-3 rounded bg-black/45 px-3 py-2 text-xs text-white">
        <div className="font-semibold">{farm.username ?? `Farmer #${farmId}`}</div>
        <div className="text-[11px] text-[#f5b4d5]">Nightshade Arcade</div>
      </div>

      <div className="absolute right-3 top-3 rounded bg-black/40 px-3 py-2 text-xs text-white">
        <div className="flex items-center justify-end gap-3">
          <span>{formatter.format(coins)} Coins</span>
          <span>{formatter.format(gems)} Gems</span>
        </div>
        <div className="mt-1 flex items-center justify-end gap-3 text-[#ffd9ea]">
          <span>{formatter.format(flowers)} SFL</span>
          <span className="flex items-center gap-1">
            <img alt="" className="h-3 w-3" src={ravenCoinIcon} />
            {formatter.format(totalRavenCoins)}
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 left-4">
        <RoundButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            requestClosePortal();
          }}
        >
          <span className="absolute left-[13px] top-[10px] text-[11px] text-white">↩</span>
        </RoundButton>
      </div>
    </HudContainer>
  );
};
