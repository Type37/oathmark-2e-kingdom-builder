import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, VStack, HStack, Text, Button, List, ListItem,
} from "@astryxdesign/core";
import { itemsFor } from "../rules/magic.mjs";
import { GAP } from "../layout.mjs";

// Appendix C, p204: only characters carry items, one each, one of a kind per
// army. You pick by reading what the item does, not by its name.
export default function MagicItems({ isOpen, onOpenChange, taken = [], chosen, onChoose }) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width="min(760px, 94vw)" maxHeight="88dvh">
      <Layout
        header={<DialogHeader title="Magic Items" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={GAP.item} style={{ blockSize: "70dvh", overflowY: "auto" }}>
              <List density="compact">
                <ListItem label="No item" isSelected={!chosen}
                          onClick={() => { onChoose(null); onOpenChange(false); }} />
                {itemsFor().map((item) => {
                  const used = taken.includes(item.name) && chosen !== item.name;
                  return (
                    <ListItem
                      key={item.name}
                      label={item.name}
                      isSelected={chosen === item.name}
                      isDisabled={used}
                      description={
                        <Text type="supporting">
                          {item.text}{used ? " Already carried by another character." : ""}
                        </Text>
                      }
                      endContent={<Text type="label">{item.pts}pts</Text>}
                      onClick={() => { if (!used) { onChoose(item); onOpenChange(false); } }}
                    />
                  );
                })}
              </List>
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}

// What the character is carrying, in the book's words, with a way out.
export function CarriedItem({ item, onOpen, onClear }) {
  // Nothing in the rules says a character carries one (p94), so the way in is
  // quiet: spells are a count you owe, a magic item is not.
  if (!item) return <Button label="Add a magic item" size="sm" variant="ghost" onClick={onOpen} />;
  return (
    <VStack gap={0} align="start">
      <HStack gap={GAP.item} align="baseline" wrap="wrap">
        <Text weight="semibold">{item.name}</Text>
        <Text type="label">{item.pts}pts</Text>
        <Button label="Change" size="sm" variant="ghost" onClick={onOpen} />
        <Button label="Remove" size="sm" variant="ghost" onClick={onClear} />
      </HStack>
      <Text type="supporting">{item.text}</Text>
    </VStack>
  );
}
