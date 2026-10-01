import React from "react";
import { HStack, StackItem, Text, Link } from "@astryxdesign/core";
import { GAP } from "../layout.mjs";

const SOURCE = "https://github.com/Type37/oathmark-2e-kingdom-builder";
const WARLORE = "https://linktr.ee/warlore";
const EMAIL = "warlore1@outlook.com";

export default function Footer() {
  return (
    <HStack gap={GAP.group} vAlign="center" wrap="wrap" paddingInline={6} paddingBlock={2}>
      <StackItem size="fill"><Text type="supporting">
        <i>Oathmark: Second Edition</i> by{" "}
        <Link href="https://www.josephamccullough.com" target="_blank">Joseph A. McCullough</Link>
      </Text></StackItem>
      <HStack gap={GAP.group} vAlign="center" wrap="wrap">
        <Text type="supporting">Builder by <Link href={WARLORE} target="_blank">WarLore</Link></Text>
        <Link href="https://ospreypublishing.com/uk/oathmark-second-edition" target="_blank">Game website</Link>
        <Link href={`mailto:${EMAIL}?subject=Oathmark builder`}>Send feedback</Link>
        <Link href={SOURCE} target="_blank">Source on GitHub</Link>
      </HStack>
    </HStack>
  );
}
