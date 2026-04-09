import type { PlayerEconomyBalanceItem } from "./playerEconomyTypes";

/** True when the balance item is marked as a generator building in the published economy. */
export function isGeneratorBalanceItem(
  item: PlayerEconomyBalanceItem | undefined,
): boolean {
  return item?.generator === true;
}
