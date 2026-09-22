import React from "react";
import { HStack, Text } from "@astryxdesign/core";
import { Icon } from "@iconify/react";
import { D10 } from "../icons/game.mjs";

// Combat Dice are ten-siders, so the sheet shows that many of them (p14).
export default function Dice({ count, size = 26 }) {
  const n = Number(count) || 0;
  if (!n) return <Text type="large">0</Text>;
  return (
    <HStack gap={0} align="center" justify="center" wrap="wrap" aria-label={`${n}d10`}>
      {Array.from({ length: n }, (_, i) => (
        <Icon key={i} icon={D10} width={size} height={size} aria-hidden="true" />
      ))}
    </HStack>
  );
}
