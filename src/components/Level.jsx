import React from "react";
import { HStack, Text } from "@astryxdesign/core";
import { Icon } from "@iconify/react";
import { RANK } from "../icons/game.mjs";

export const LEVEL_LABEL = { beginner: "Beginner", moderate: "Moderate", expert: "Expert" };

// Oathmark Experience (p17), with one to three rank chevrons.
export default function Level({ level, size = 16 }) {
  const key = LEVEL_LABEL[level] ? level : "moderate";
  return (
    <HStack gap={1} align="center">
      <Icon icon={RANK[key]} width={size} height={size} />
      <Text type="supporting" color="secondary">{LEVEL_LABEL[key]}</Text>
    </HStack>
  );
}

// The chevrons alone, named for screen readers.
export function LevelIcon({ level, size = 20 }) {
  const key = LEVEL_LABEL[level] ? level : "moderate";
  return <Icon icon={RANK[key]} width={size} height={size} role="img" aria-label={LEVEL_LABEL[key]} />;
}
