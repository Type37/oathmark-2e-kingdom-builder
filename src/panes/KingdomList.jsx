import React from "react";
import {
  Layout, LayoutContent, LayoutHeader, VStack, HStack, Card, Text, Heading,
  Section, Button,
} from "@astryxdesign/core";
import Ico from "../components/Ico.jsx";
import { LEVELS, REGION_SIZES, validateKingdom } from "../rules/kingdom.mjs";
import { list as listOf } from "../rules/store.mjs";
import { GAP } from "../layout.mjs";

function slots(level) {
  return (LEVELS[level] ?? LEVELS.moderate).reduce((n, r) => n + REGION_SIZES[r], 0);
}

export default function KingdomList({ store, onOpen, onNew }) {
  const rows = listOf(store, "kingdoms");

  return (
    <Layout
      height="auto"
      padding={8}
      contentWidth={1040}
      header={
        <LayoutHeader>
          <Heading level={1}>Kingdoms</Heading>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={GAP.group}>
            {rows.map((k) => {
              const total = slots(k.level);
              const placed = (k.territories ?? []).length;
              const ok = validateKingdom(k).ok;
              return (
                <Card key={k.id} padding={0} elevation="low">
                  <Section padding={5}>
                    <VStack gap={GAP.tight} onClick={() => onOpen(k.id)} className="om-card">
                      <Heading level={2}>{k.name}</Heading>
                      <HStack gap={GAP.item} align="baseline">
                        {!ok && <Text color="error">{placed} of {total}</Text>}
                        {ok && <Text type="label">{placed} of {total}</Text>}
                        {k.ruler && <Text type="supporting">{k.ruler}</Text>}
                      </HStack>
                    </VStack>
                  </Section>
                </Card>
              );
            })}
            <Button label="Create Kingdom" size="lg" variant="primary" width="100%"
                    icon={<Ico name="plus" size={22} />} onClick={onNew} />
          </VStack>
        </LayoutContent>
      }
    />
  );
}
