import React from "react";
import { VStack, HStack, Text, Heading, Button, MetadataList, MetadataListItem } from "@astryxdesign/core";
import { Icon } from "@iconify/react";
import { DICE } from "../icons/game.mjs";
import { rollLore } from "../lore.mjs";
import { GAP } from "../layout.mjs";

// What kind of realm this is, and how it came to be: one roll across the tables.
export default function KingdomLore({ value, onChange }) {
  const lore = value.lore;
  return (
    <VStack gap={GAP.item}>
      <HStack justify="center" className="om-plate"><Text type="label">The Realm</Text></HStack>
      {lore && (
        <VStack gap={GAP.item}>
          <VStack gap={0}>
            <Heading level={4}>{lore.theme.name}</Heading>
            <Text type="supporting">{lore.theme.text}</Text>
          </VStack>
          <MetadataList>
            <MetadataListItem label="Values">{lore.values.map((v) => v.name).join(" and ")}</MetadataListItem>
            <MetadataListItem label="Neighbour">{lore.dispute}</MetadataListItem>
            <MetadataListItem label="Ties">{lore.tie}</MetadataListItem>
            <MetadataListItem label="Origin">{lore.history.origin.name}</MetadataListItem>
            <MetadataListItem label="Rise">{lore.history.rise.name}</MetadataListItem>
            <MetadataListItem label="Peak">{lore.history.peak.name}</MetadataListItem>
            <MetadataListItem label="Fall">{lore.history.fall.name}</MetadataListItem>
          </MetadataList>
        </VStack>
      )}
      <HStack justify="end">
        <Button label={lore ? "Reroll the Realm" : "Roll the Realm"} size="sm" variant="secondary"
                icon={<Icon icon={DICE} width={18} height={18} />}
                onClick={() => onChange({ ...value, lore: rollLore() })} />
      </HStack>
    </VStack>
  );
}
