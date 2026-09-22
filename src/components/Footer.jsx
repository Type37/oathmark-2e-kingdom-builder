import React from "react";
import { HStack, Text, Link } from "@astryxdesign/core";
import { GAP } from "../layout.mjs";

const SOURCE = "https://github.com/Type37/oathmark-2e-kingdom-builder";
const WARLORE = "https://linktr.ee/warlore";
const EMAIL = "warlore1@outlook.com";

export default function Footer() {
  return (
    <HStack className="om-footer" gap={GAP.group} align="center" justify="between" wrap="wrap">
      <Text type="supporting">
        <i>Oathmark: Second Edition</i> by{" "}
        <Link href="https://www.josephamccullough.com" isExternal>Joseph A. McCullough</Link>
      </Text>
      <HStack gap={GAP.item} align="center" wrap="wrap">
        <Text type="supporting">Builder by <Link href={WARLORE} isExternal>WarLore</Link></Text>
        <Text type="supporting" aria-hidden="true">&middot;</Text>
        <Link href="https://ospreypublishing.com/uk/oathmark-second-edition" isExternal>Game website</Link>
        <Text type="supporting" aria-hidden="true">&middot;</Text>
        <Link href={`mailto:${EMAIL}?subject=Oathmark builder`}>Send feedback</Link>
        <Text type="supporting" aria-hidden="true">&middot;</Text>
        <Link href={SOURCE} isExternal>Source on GitHub</Link>
      </HStack>
    </HStack>
  );
}
