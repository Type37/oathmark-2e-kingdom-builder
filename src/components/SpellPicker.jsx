import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, VStack, HStack, Text, Button, List, ListItem, Token,
} from "@astryxdesign/core";
import { spellsFor, spellsKnown } from "../rules/magic.mjs";
import { GAP } from "../layout.mjs";

// A spellcaster knows its level plus two (p83), chosen before the battle from
// its own race's list and the General list.
export default function SpellPicker({ isOpen, onOpenChange, race, level, chosen = [], onChange }) {
  const knows = spellsKnown(level);
  const full = chosen.length >= knows;

  const toggle = (name) => {
    if (chosen.includes(name)) onChange(chosen.filter((s) => s !== name));
    else if (!full) onChange([...chosen, name]);
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width="min(820px, 94vw)" maxHeight="88dvh">
      <Layout
        header={<DialogHeader title="Spells" subtitle={`${chosen.length} of ${knows} chosen`}
                              onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={GAP.item} style={{ blockSize: "70dvh", overflowY: "auto" }}>
              <List density="compact">
                {spellsFor(race).map((s) => {
                  const on = chosen.includes(s.name);
                  return (
                    <ListItem
                      key={`${s.group}-${s.name}`}
                      label={s.name}
                      isSelected={on}
                      isDisabled={!on && full}
                      description={<Text type="supporting">{s.text}</Text>}
                      startContent={<Token label={`CN${s.cn}`} size="sm" />}
                      endContent={<Text type="label">{s.group}</Text>}
                      onClick={() => toggle(s.name)}
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

// What the caster has memorised, and the way in.
export function SpellList({ spells = [], knows, onOpen }) {
  // A caster knows its spells or it is not finished, so the way in carries the
  // accent until the count is met, then steps back.
  const owed = spells.length < knows;
  return (
    <VStack gap={0} align="start">
      <HStack gap={GAP.item} align="baseline" wrap="wrap">
        <Button label={spells.length ? "Change spells" : "Add spells"} size="sm"
                variant={owed ? "primary" : "secondary"} onClick={onOpen} />
        <Text type="label">{spells.length} of {knows}</Text>
      </HStack>
      {spells.length > 0 && <Text type="supporting">{spells.join(", ")}</Text>}
    </VStack>
  );
}
