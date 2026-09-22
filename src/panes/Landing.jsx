import React from "react";
import {
  Layout, LayoutContent, Grid, VStack, Card, Heading, Section,
} from "@astryxdesign/core";
import Mark from "../components/Mark.jsx";
import { GAP } from "../layout.mjs";

// Titles are the book's own chapter names. No descriptions, no counts.
const CARDS = [
  { id: "kingdom", title: "Creating a Kingdom", mark: "siege" },
  { id: "muster", title: "Muster an Army", mark: "melee" },
  { id: "reference", title: "Figure Lists", mark: "skill" },
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
            <Heading level={1}>Oathmark</Heading>
            <Grid columns={{ minWidth: 260, max: 3, repeat: "fit" }} gap={6}>
              {CARDS.map((c) => (
                <Card key={c.id} padding={0} elevation="low">
                  <VStack gap={0} onClick={() => onOpen(c.id)} className="om-card">
                    <VStack gap={0} align="center" className="om-card-art">
                      <Mark name={c.mark} size={80} />
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
