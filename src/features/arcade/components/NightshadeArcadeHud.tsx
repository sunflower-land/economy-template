import React, { useMemo, useState } from "react";
import { HudContainer } from "components/ui/HudContainer";
import { requestClosePortal } from "lib/portal/closePortal";
import { useMinigameSession } from "lib/portal";
import { RoundButton } from "components/ui/RoundButton";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import ravenCoinIcon from "../assets/RavenCoin.webp";
import coinsIcon from "../assets/coins.webp";
import gemsIcon from "../assets/gem.webp";
import flowerIcon from "../assets/flower_token.webp";
import { PIXEL_SCALE } from "lib/constants";
import { SUNNYSIDE } from "example-assets/sunnyside";
import worldIcon from "example-assets/icons/world.png";

type NightshadeArcadeHudProps = {
  extraRavenCoins: number;
};

const formatter = new Intl.NumberFormat();

export const NightshadeArcadeHud: React.FC<NightshadeArcadeHudProps> = ({
  extraRavenCoins,
}) => {
  const { playerEconomy, farm } = useMinigameSession();
  const baseRavenCoins = Number(playerEconomy.balances?.RavenCoin ?? 0);
  const totalRavenCoins = Math.max(0, baseRavenCoins + extraRavenCoins);
  const flowers = Number(farm.balance ?? 0);
  const coins = Number(playerEconomy.balances?.Coin ?? 0);
  const gems = Number(playerEconomy.balances?.Gem ?? 0);
  const [showFullBalance, setShowFullBalance] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const nonZeroBalances = useMemo(
    () =>
      Object.entries(playerEconomy.balances ?? {})
        .filter(([, amount]) => Number(amount ?? 0) > 0)
        .sort((a, b) => Number(b[1] ?? 0) - Number(a[1] ?? 0)),
    [playerEconomy.balances],
  );

  return (
    <>
      <HudContainer>
        <div className="absolute right-0 top-0 z-20 p-2.5">
          <div className="flex flex-col space-y-1 items-end !text-[28px] text-stroke">
            <div className="flex cursor-pointer items-center space-x-3 relative">
              <div className="h-9 w-full bg-black opacity-30 absolute coins-bb-hud-backdrop" />
              <div className="flex items-center space-x-2">
                <span className="balance-text mt-0.5">{formatter.format(coins)}</span>
                <img alt="Coins" className="h-[25px] w-[25px]" src={coinsIcon} />
              </div>
              <div className="flex items-center space-x-2">
                <span className="balance-text mt-0.5">{formatter.format(gems)}</span>
                <img alt="Gems" className="h-7 w-7" src={gemsIcon} />
              </div>
            </div>
            <div
              className="flex items-center space-x-2 relative cursor-pointer"
              onClick={() => setShowFullBalance((s) => !s)}
            >
              <div className="h-9 w-full bg-black opacity-25 absolute sfl-hud-backdrop -z-10" />
              <span className="balance-text">
                {showFullBalance
                  ? flowers.toLocaleString(undefined, { maximumFractionDigits: 8 })
                  : flowers.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </span>
              <img alt="SFL" className="h-[26px] w-[26px]" src={flowerIcon} />
              <div className="flex items-center space-x-2">
                <span className="balance-text mt-0.5">
                  {formatter.format(totalRavenCoins)}
                </span>
                <img alt="RavenCoin" className="h-[25px] w-[25px]" src={ravenCoinIcon} />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 p-2.5 z-20">
          <RoundButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              requestClosePortal();
            }}
          >
            <img
              alt=""
              className="absolute group-active:translate-y-[2px]"
              src={worldIcon}
              style={{
                width: `${PIXEL_SCALE * 12}px`,
                left: `${PIXEL_SCALE * 5}px`,
                top: `${PIXEL_SCALE * 4}px`,
              }}
            />
          </RoundButton>
        </div>

        <div className="absolute right-0 top-24 p-2.5 z-20 flex flex-col space-y-2.5">
          <RoundButton onClick={() => setShowInventory(true)}>
            <img
              alt="Inventory"
              src={SUNNYSIDE.icons.basket}
              className="absolute group-active:translate-y-[2px]"
              style={{
                top: `${PIXEL_SCALE * 5}px`,
                left: `${PIXEL_SCALE * 5}px`,
                width: `${PIXEL_SCALE * 12}px`,
              }}
            />
          </RoundButton>
        </div>
      </HudContainer>

      <Modal show={showInventory} onHide={() => setShowInventory(false)}>
        <Panel className="w-full max-w-sm">
          <div className="p-2 text-[#3e2731]">
            <div className="mb-2 text-sm font-bold">Inventory</div>
            {nonZeroBalances.length ? (
              <div className="max-h-72 overflow-y-auto space-y-1 text-xs">
                {nonZeroBalances.map(([token, amount]) => (
                  <div className="flex items-center justify-between" key={token}>
                    <span>{token}</span>
                    <span>{formatter.format(Number(amount))}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs">No items yet.</div>
            )}
          </div>
        </Panel>
      </Modal>
    </>
  );
};
