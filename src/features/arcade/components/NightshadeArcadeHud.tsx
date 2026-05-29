import React from "react";
import { HudContainer } from "components/ui/HudContainer";
import { requestClosePortal } from "lib/portal/closePortal";
import { useMinigameSession } from "lib/portal";
import { RoundButton } from "components/ui/RoundButton";
import ravenCoinIcon from "../assets/RavenCoin.webp";
import worldIcon from "example-assets/icons/world.png";

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
      <div className="absolute right-2 top-2 z-20 flex flex-col items-end space-y-1 text-white">
        <div className="relative flex items-center gap-3 px-3 py-1.5 text-sm">
          <div className="absolute inset-0 -z-10 bg-black/35" />
          <span>{formatter.format(coins)} Coins</span>
          <span>{formatter.format(gems)} Gems</span>
        </div>
        <div className="relative flex items-center gap-3 px-3 py-1.5 text-sm text-[#ffd9ea]">
          <div className="absolute inset-0 -z-10 bg-black/30" />
          <span>{formatter.format(flowers)} SFL</span>
          <span className="flex items-center gap-1">
            <img alt="" className="h-4 w-4" src={ravenCoinIcon} />
            {formatter.format(totalRavenCoins)}
          </span>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 z-20">
        <RoundButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            requestClosePortal();
          }}
        >
          <img
            alt=""
            className="absolute left-[13px] top-[10px]"
            src={worldIcon}
            style={{ width: "30px" }}
          />
        </RoundButton>
      </div>

      <div className="absolute left-2 top-2 z-20 rounded bg-black/45 px-3 py-2 text-xs text-white">
        <div className="font-semibold">{farm.username ?? `Farmer #${farmId}`}</div>
        <div className="text-[11px] text-[#f5b4d5]">Nightshade Arcade</div>
      </div>
    </HudContainer>
  );
};
