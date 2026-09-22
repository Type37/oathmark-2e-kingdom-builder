import React from "react";
import {
  Layout, LayoutHeader, LayoutContent, LayoutFooter,
  Section, List, ListItem, VStack, HStack, Text, Heading,
  NumberInput, TabList, Tab, TextInput,
} from "@astryxdesign/core";

import { figures } from "../rules/kingdom.mjs";
import { collectionTotals, unitsAffordable } from "../rules/collection.mjs";
import StatLine from "../components/StatLine.jsx";
import { FRAME, GAP, DENSITY } from "../layout.mjs";

const LIST_LABEL = {
  dwarf: "Dwarf", elf: "Elf", goblin: "Goblin", human: "Human",
  orc: "Orc", necropolis: "Necropolis", unaligned: "Unaligned",
};

export default function Collection({ value, onChange }) {
  const [list, setList] = React.useState("dwarf");
  const [query, setQuery] = React.useState("");

  const lists = Object.keys(LIST_LABEL);
  const totals = collectionTotals(value);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return figures
      .filter((f) => (q ? f.name.toLowerCase().includes(q) : f.list === list))
      .sort((a, b) => a.variants[0].pts - b.variants[0].pts);
  }, [list, query]);

  const set = (id, n) => {
    const next = { ...value };
    if (!n) delete next[id];
    else next[id] = n;
    onChange(next);
  };

  return (
    <Layout
      padding={FRAME.padding}
      defaultHasDividers
      height="auto"
      contentWidth={FRAME.contentWidth}
      header={
        <LayoutHeader>
          <HStack gap={4} align="center" justify="between" wrap="wrap">
            <Heading level={1}>Collection</Heading>
            <HStack gap={3} align="center">
              <TextInput
                label="Figure"
                isLabelHidden
                value={query}
                onChange={(e) => setQuery(e.target?.value ?? e)}
                size="sm"
              />
              <Text color="secondary">
                {totals.figures} figures in {totals.types} types, {totals.points}pts
              </Text>
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={0}>
            {!query && (
              <Section paddingBlockEnd={0}>
                <TabList value={list} onChange={setList} hasDivider isFullBleed>
                  {lists.map((l) => (
                    <Tab key={l} value={l} label={LIST_LABEL[l]} />
                  ))}
                </TabList>
              </Section>
            )}
            <Section padding={0}>
              <List hasDividers density={DENSITY.data}>
                {rows.map((f) => {
                  const have = value?.[f.id] ?? 0;
                  const units = unitsAffordable(value, f.id);
                  return (
                    <ListItem
                      key={f.id}
                      label={f.name}
                      description={<StatLine variant={f.variants[0]} interactive />}
                      endContent={
                        <HStack gap={3} align="center">
                          <VStack gap={0} align="end">
                            <Text type="label">
                              {have ? `${units} ${units === 1 ? "unit" : "units"}` : ""}
                            </Text>
                            <Text>{f.unitMax} per unit</Text>
                          </VStack>
                          <NumberInput
                            label={`${f.name} owned`}
                            isLabelHidden
                            value={have}
                            onChange={(n) => set(f.id, Math.max(0, n || 0))}
                            min={0}
                            size="sm"
                          />
                        </HStack>
                      }
                    />
                  );
                })}
              </List>
            </Section>
          </VStack>
        </LayoutContent>
      }
      footer={
        <LayoutFooter>
          <Text color="secondary">{rows.length} figures</Text>
        </LayoutFooter>
      }
    />
  );
}
