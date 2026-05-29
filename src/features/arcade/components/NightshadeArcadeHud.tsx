import React from "react";
import { HudContainer } from "components/ui/HudContainer";
import { requestClosePortal } from "lib/portal/closePortal";
import { useMinigameSession } from "lib/portal";
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
  const coins = Number(playerEconomy.balances?.Coin ?? 0);
  const gems = Number(playerEconomy.balances?.Gem ?? 0);

  return (
    <HudContainer>
      <div className="absolute left-3 top-3 rounded bg-black/55 px-3 py-2 text-xs text-white">
        <div className="font-semibold">{farm.username ?? `Farmer #${farmId}`}</div>
        <div className="text-[11px] text-[#e6bfd4]">Nightshade Arcade</div>
      </div>

      <div className="absolute right-3 top-3 rounded bg-black/55 px-3 py-2 text-xs text-white">
        <div className="flex items-center justify-end gap-2">
          <span>{formatter.format(coins)} Coins</span>
          <span>{formatter.format(gems)} Gems</span>
        </div>
        <div className="mt-1 flex items-center justify-end gap-1 text-[#ffd9ea]">
          <img alt="" className="h-3 w-3" src={ravenCoinIcon} />
          <span>{formatter.format(totalRavenCoins)} Raven Coins</span>
        </div>
      </div>

      <button
        className="absolute bottom-4 left-4 rounded bg-[#3e2731] px-3 py-2 text-xs text-white"
        onClick={() => requestClosePortal()}
        type="button"
      >
        Leave Arcade
      </button>
    </HudContainer>
  );
};
