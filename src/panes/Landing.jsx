import React from "react";
import {
  Layout, LayoutContent, Grid, VStack, Card, Heading, Section, Text,
} from "@astryxdesign/core";
import { Icon } from "@iconify/react";
import Mark from "../components/Mark.jsx";
import { LAUREL, MUSTER, RULE_BOOK } from "../icons/game.mjs";
import { GAP } from "../layout.mjs";

const CARDS = [
  { id: "kingdoms", title: "Kingdom Builder", icon: LAUREL },
  { id: "musters", title: "Army Builder", icon: MUSTER },
  { id: "collection", title: "Unit Collection", mark: "skill" },
  { id: "reference", title: "Reference", icon: RULE_BOOK },
];

export default function Landing({ onOpen }) {
  return (
    <Layout
      height="auto"
      padding={8}
      contentWidth={1040}
      content={
        <LayoutContent>
          <VStack gap={8}>
            <VStack gap={GAP.group} style={{ maxInlineSize: "62ch" }}>
              <Heading level={1} type="display-1">Oathmark</Heading>
              <Text type="large">
                The old empires burned themselves out in the War of Lost Fathers. Now, in the
                Lost Age, new kingdoms grow like weeds among their ruins, and every one of
                them is bound by an oathmark raised in stone.
              </Text>
              <Text color="secondary">
                Kings fight the wars. Chroniclers keep them. Found your kingdom in the Marches,
                muster its armies, and write down what they did, so the age is not lost twice.
              </Text>
            </VStack>
            <Grid columns={{ minWidth: 220, max: 4, repeat: "fit" }} gap={6}>
              {CARDS.map((c) => (
                <Card key={c.id} padding={0} elevation="low">
                  <VStack gap={0} onClick={() => onOpen(c.id)} className="om-card">
                    <VStack gap={0} align="center" className="om-card-art">
                      {c.icon ? <Icon icon={c.icon} width={140} height={140} /> : <Mark name={c.mark} size={140} />}
                    </VStack>
                    <Section padding={6}>
                      <Heading level={2}>{c.title}</Heading>
                    </Section>
                  </VStack>
                </Card>
              ))}
            </Grid>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
