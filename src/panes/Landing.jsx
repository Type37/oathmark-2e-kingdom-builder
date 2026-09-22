import React from "react";
import {
  Layout, LayoutContent, LayoutHeader, HStack, Grid, VStack, Card, Heading, Section, Button,
} from "@astryxdesign/core";
import { Icon } from "@iconify/react";
import Mark from "../components/Mark.jsx";
import Ico from "../components/Ico.jsx";
import { LAUREL, MUSTER } from "../icons/game.mjs";
import { GAP } from "../layout.mjs";

const CARDS = [
  { id: "kingdom", title: "Found a Kingdom", icon: LAUREL },
  { id: "muster", title: "Muster an Army", icon: MUSTER },
  { id: "reference", title: "Unit Collections", mark: "skill" },
];

export default function Landing({ onOpen, onMenu }) {
  return (
    <Layout
      height="auto"
      padding={8}
      contentWidth={1040}
      header={
        onMenu && (
          <LayoutHeader>
            <HStack>
              <Button className="om-menu-btn" label="Menu" size="sm" variant="ghost" isIconOnly
                      icon={<Ico name="menu" size={20} />} onClick={onMenu} />
            </HStack>
          </LayoutHeader>
        )
      }
      content={
        <LayoutContent>
          <VStack gap={8}>
            <Heading level={1} type="display-1">Oathmark</Heading>
            <Grid columns={{ minWidth: 260, max: 3, repeat: "fit" }} gap={6}>
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
