import React from "react";
import {
  Layout, LayoutContent, Grid, VStack, HStack, Card, Heading, Section, Text, Button,
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
              <Text type="large" style={{ fontStyle: "italic" }}>
                Empires have fallen, and the land is broken. The great oathmarks that once stood
                as testaments to the allegiances and might of nations have crumbled into ruin. In
                this lost age, fealty and loyalty are as valuable as gold and as deadly as cold
                iron, and war is ever-present
              </Text>
              <Text>
                Oathmark: Second Edition is a revised and expanded version of the popular
                mass-battle fantasy wargame, Oathmark. Featuring new and expanded rules, units
                types, and a whole host of other revisions from years of player feedback. Command
                the fantasy army you've always wanted in Oathmark: Second Edition, whether a
                company of stalwart dwarves or a mixed force with proud elves, noble men, and wild
                goblins standing shoulder-to-shoulder in the battle-line.
              </Text>
              <HStack>
                <Button label="Buy the book!" variant="primary" target="_blank" rel="noopener"
                        href="https://www.ospreypublishing.com/us/oathmark-second-edition-9781472864628/" />
              </HStack>
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
