import React from "react";
import { HStack, StackItem, Text, Link } from "@astryxdesign/core";

const SOURCE = "https://github.com/Type37/oathmark-2e-kingdom-builder";
const WARLORE = "https://linktr.ee/warlore";
const EMAIL = "warlore1@outlook.com";
const KOFI = "https://ko-fi.com/jetwong";

export default function Footer() {
  return (
    <HStack gap={4} vAlign="center" wrap="wrap">
      <StackItem size="fill"><Text type="supporting">
        <i>Oathmark: Second Edition</i> by{" "}
        <Link href="https://www.josephamccullough.com" target="_blank">Joseph A. McCullough</Link>
      </Text></StackItem>
      <HStack gap={4} vAlign="center" wrap="wrap">
        <Text type="supporting">Builder by <Link href={WARLORE} target="_blank">WarLore</Link></Text>
        <Link href="https://ospreypublishing.com/uk/oathmark-second-edition" target="_blank">Game website</Link>
        <Link href={`mailto:${EMAIL}?subject=Oathmark builder`}>Send feedback</Link>
        <Link href={SOURCE} target="_blank">Source on GitHub</Link>
        <Link href={KOFI} target="_blank">Ko-fi</Link>
      </HStack>
    </HStack>
  );
}
