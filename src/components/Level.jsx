import React from "react";
import {
  Icon, HStack, Text,
} from "@astryxdesign/core";

export const LEVEL_LABEL = { beginner: "Beginner", moderate: "Moderate", expert: "Expert" };

// Oathmark Experience (p17), with one to three rank chevrons.
export default function Level({ level, size = "sm" }) {
  const key = LEVEL_LABEL[level] ? level : "moderate";
  return (
    <HStack gap={1} align="center">
      <Icon icon={`app:rank-${key}`} size={size} />
      <Text type="supporting" color="secondary">{LEVEL_LABEL[key]}</Text>
    </HStack>
  );
}

// The chevrons alone, named for screen readers.
export function LevelIcon({ level, size = "md" }) {
  const key = LEVEL_LABEL[level] ? level : "moderate";
  return <Icon icon={`app:rank-${key}`} size={size} label={LEVEL_LABEL[key]} />;
}
