import React, { useMemo, useState } from "react";
import { HudContainer } from "components/ui/HudContainer";
import { useMinigameSession } from "lib/portal";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import ravenCoinIcon from "../assets/RavenCoin.webp";
import coinsIcon from "../assets/coins.webp";
import gemsIcon from "../assets/gem.webp";
import flowerIcon from "../assets/flower_token.webp";
import { PortalBasketButton } from "./PortalBasketButton";

type NightshadeArcadeHudProps = {
  extraRavenCoins: number;
};

const formatter = new Intl.NumberFormat();

const NightshadeArcadeBalances: React.FC<{
  coins: number;
  flowers: number;
  gems: number;
  ravenCoins: number;
}> = ({ coins, flowers, gems, ravenCoins }) => {
  const [showFullBalance, setShowFullBalance] = useState(false);

  return (
    <div className="flex flex-col space-y-1 items-end !text-[28px] text-stroke">
      <div className="flex cursor-pointer items-center space-x-3 relative">
        <div className="h-9 w-full bg-black opacity-30 absolute coins-bb-hud-backdrop" />
        <div className="flex items-center space-x-2">
          <span className="balance-text mt-0.5">{formatter.format(coins)}</span>
          <img alt="Coins" src={coinsIcon} style={{ width: 25 }} />
        </div>
        <div className="flex items-center space-x-2">
          <span className="balance-text mt-0.5">{formatter.format(gems)}</span>
          <img alt="Gems" src={gemsIcon} style={{ marginTop: 2, width: 28 }} />
        </div>
      </div>
      <div
        className="flex items-center space-x-2 relative cursor-pointer"
        onClick={() => setShowFullBalance((value) => !value)}
      >
        <div className="h-9 w-full bg-black opacity-25 absolute sfl-hud-backdrop -z-10" />
        <span className="balance-text">
          {flowers.toLocaleString(undefined, {
            maximumFractionDigits: showFullBalance ? 8 : 4,
          })}
        </span>
        <img alt="FLOWER" src={flowerIcon} style={{ width: 26 }} />
        <div className="flex items-center space-x-2">
          <span className="balance-text mt-0.5">{formatter.format(ravenCoins)}</span>
          <img
            alt="RavenCoins"
            src={ravenCoinIcon}
            style={{ width: 25, height: 25 }}
          />
        </div>
      </div>
    </div>
  );
};

export const NightshadeArcadeHud: React.FC<NightshadeArcadeHudProps> = ({
  extraRavenCoins,
}) => {
  const { farmId, playerEconomy, farm, playerData } = useMinigameSession();
  const profileInventory = playerData.resolvedProfile.inventory;
  const readAmount = (value: unknown) => {
    const amount = Number(value ?? 0);
    return Number.isFinite(amount) ? amount : 0;
  };
  const readInventoryAmount = (token: string) =>
    readAmount(profileInventory?.[token]);

  const baseRavenCoins = readAmount(
    playerEconomy.balances?.RavenCoin ?? readInventoryAmount("RavenCoin"),
  );
  const totalRavenCoins = Math.max(0, baseRavenCoins + extraRavenCoins);
  const flowers = readAmount(playerData.resolvedProfile.balance ?? farm.balance);
  const coins = readAmount(
    playerData.resolvedProfile.coins ??
      playerEconomy.balances?.Coin ??
      readInventoryAmount("Coin"),
  );
  const gems = readAmount(
    playerEconomy.balances?.Gem ?? readInventoryAmount("Gem"),
  );
  const [showInventory, setShowInventory] = useState(false);
  const visibleInventoryEntries = useMemo(() => {
    const merged = new Map<string, number>();

    const appendEntries = (entries: Record<string, unknown> | undefined) => {
      Object.entries(entries ?? {}).forEach(([token, amount]) => {
        const numericAmount = Number(amount ?? 0);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;
        merged.set(token, Math.max(numericAmount, merged.get(token) ?? 0));
      });
    };

    appendEntries(playerData.resolvedProfile.inventory);
    appendEntries(playerEconomy.balances);

    return Array.from(merged.entries()).sort((a, b) => b[1] - a[1]);
  }, [playerData.resolvedProfile.inventory, playerEconomy.balances]);

  return (
    <>
      <HudContainer>
        <div className="absolute left-3 top-3 rounded bg-black/55 px-3 py-2 text-xs text-white">
          <div className="font-semibold">
            {playerData.resolvedProfile.username ?? `Farmer #${farmId}`}
          </div>
          <div className="text-[11px] text-[#e6bfd4]">Nightshade Arcade</div>
        </div>

        <div className="absolute right-0 top-0 p-2.5">
          <NightshadeArcadeBalances
            flowers={flowers}
            coins={coins}
            gems={gems}
            ravenCoins={totalRavenCoins}
          />
        </div>

        <div className="absolute right-0 top-24 p-2.5 flex flex-col space-y-2.5">
          <PortalBasketButton onClick={() => setShowInventory(true)} />
        </div>
      </HudContainer>

      <Modal show={showInventory} onHide={() => setShowInventory(false)}>
        <Panel className="w-full max-w-sm">
          <div className="p-2 text-[#3e2731]">
            <div className="mb-2 text-sm font-bold">Inventory</div>
            {visibleInventoryEntries.length ? (
              <div className="max-h-72 overflow-y-auto space-y-1 text-xs">
                {visibleInventoryEntries.map(([token, amount]) => (
                  <div className="flex items-center justify-between" key={token}>
                    <span>{token}</span>
                    <span>{formatter.format(amount)}</span>
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
