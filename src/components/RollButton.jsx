import React from "react";
import { Button } from "@astryxdesign/core";
import { Icon } from "@iconify/react";
import { DICE } from "../icons/game.mjs";

// Every roll in the app: the dice tumble once, then land.
export default function RollButton({ label, onClick, variant = "secondary", size, isIconOnly }) {
  const [rolling, setRolling] = React.useState(0);

  const roll = () => {
    setRolling((n) => n + 1);
    onClick?.();
  };

  return (
    <Button label={label} variant={variant} size={size} isIconOnly={isIconOnly} onClick={roll}
            icon={
              <span key={rolling} className={rolling ? "om-roll" : undefined}>
                <Icon icon={DICE} width={18} height={18} />
              </span>
            } />
  );
}
