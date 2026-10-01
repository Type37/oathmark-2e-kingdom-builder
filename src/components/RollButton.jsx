import React from "react";
import { Icon } from "@astryxdesign/core";
import { Button } from "@astryxdesign/core";

// Every roll in the app: the dice tumble once, then land.
export default function RollButton({ label, onClick, variant = "secondary", size, isIconOnly }) {
  const [rolling, setRolling] = React.useState(0);

  const roll = () => {
    setRolling((n) => n + 1);
    onClick?.();
  };

  return (
    <Button label={label} variant={variant} size={size} isIconOnly={isIconOnly} onClick={roll}
            icon={<Icon key={rolling} icon="app:dice" className={rolling ? "om-roll" : undefined} />} />
  );
}
