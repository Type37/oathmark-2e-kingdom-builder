import React from "react";
import { HStack, Text } from "@astryxdesign/core";
import { Icon } from "@iconify/react";
import { RANK } from "../icons/game.mjs";

export const LEVEL_LABEL = { beginner: "Beginner", moderate: "Moderate", expert: "Expert" };

// Oathmark Experience (p17), with one to three rank chevrons.
export default function Level({ level, size = 18 }) {
  const key = LEVEL_LABEL[level] ? level : "moderate";
  return (
    <HStack gap={1} align="center">
      <Icon icon={RANK[key]} width={size} height={size} />
      <Text type="label">{LEVEL_LABEL[key]}</Text>
    </HStack>
  );
}

export function LevelIcon({ level, size = 20 }) {
  return <Icon icon={RANK[LEVEL_LABEL[level] ? level : "moderate"]} width={size} height={size} />;
}
