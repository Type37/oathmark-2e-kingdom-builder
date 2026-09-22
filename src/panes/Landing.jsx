import React from "react";
import {
  Layout, LayoutContent, Grid, VStack, Card, Heading, Section,
} from "@astryxdesign/core";
import { Icon } from "@iconify/react";
import Mark from "../components/Mark.jsx";
import { LAUREL, MUSTER } from "../icons/game.mjs";
import { GAP } from "../layout.mjs";

const CARDS = [
  { id: "kingdom", title: "Found a Kingdom", icon: LAUREL },
  { id: "muster", title: "Muster an Army", icon: MUSTER },
  { id: "reference", title: "Unit Collections", mark: "skill" },
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
            <Heading level={1} type="display-1">Oathmark</Heading>
            <Grid columns={{ minWidth: 260, max: 3, repeat: "fit" }} gap={6}>
              {CARDS.map((c) => (
                <Card key={c.id} padding={0} elevation="low">
                  <VStack gap={0} onClick={() => onOpen(c.id)} className="om-card">
                    <VStack gap={0} align="center" className="om-card-art">
                      {c.icon ? <Icon icon={c.icon} width={80} height={80} /> : <Mark name={c.mark} size={80} />}
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
