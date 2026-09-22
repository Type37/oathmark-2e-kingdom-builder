import React from "react";
import { HStack, Button, NumberInput } from "@astryxdesign/core";
import Ico from "./Ico.jsx";

// How many of a figure you own: step it, or type it. Every change saves.
export default function Counter({ label, value = 0, min = 0, max, onChange, size = "sm" }) {
  const set = (n) => onChange(Math.max(min, max != null ? Math.min(max, n) : n));
  return (
    <HStack gap={1} align="center">
      <Button label={`Fewer ${label}`} size={size} variant="secondary" isIconOnly
              isDisabled={value <= min} icon={<Ico name="minus" />}
              onClick={() => set(value - 1)} />
      <NumberInput label={label} isLabelHidden size={size} width={72}
                   value={value} min={min} max={max}
                   onChange={(n) => set(Number(n) || 0)} />
      <Button label={`More ${label}`} size={size} variant="secondary" isIconOnly
              icon={<Ico name="plus" />} onClick={() => set(value + 1)} />
    </HStack>
  );
}
