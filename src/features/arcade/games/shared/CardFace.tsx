import React from "react";
import { isRed } from "./deck";
import type { Card } from "./deck";

interface Props {
  card: Card;
  small?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export const CardFace: React.FC<Props> = ({
  card,
  small,
  selected,
  onClick,
}) => {
  const base = small
    ? "w-9 h-14 rounded text-xs"
    : "w-12 h-18 rounded text-sm";
  const border = selected
    ? "border-2 border-yellow-400"
    : "border border-[#3e2731]";
  const cursor = onClick ? "cursor-pointer hover:brightness-90" : "";

  if (!card.faceUp) {
    return (
      <div
        className={`${base} ${border} ${cursor} bg-[#b65389] flex items-center justify-center text-white font-bold select-none`}
        onClick={onClick}
        role={onClick ? "button" : undefined}
      >
        🂠
      </div>
    );
  }

  const red = isRed(card.suit);
  return (
    <div
      className={`${base} ${border} ${cursor} bg-white flex flex-col items-center justify-center gap-0 select-none`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <span
        className={`font-bold leading-none ${red ? "text-red-600" : "text-[#1a1a1a]"}`}
      >
        {card.rank}
      </span>
      <span className={`leading-none ${red ? "text-red-600" : "text-[#1a1a1a]"}`}>
        {card.suit}
      </span>
    </div>
  );
};
