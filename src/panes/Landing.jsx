import React from "react";
import {
  Layout, LayoutContent, Grid, VStack, HStack, ClickableCard, Center, Heading, Text, Button, Blockquote,
} from "@astryxdesign/core";
import Mark from "../components/Mark.jsx";
import laurel from "../icons/laurel-crown.svg?url";
import muster from "../icons/muster.svg?url";
import ruleBook from "../icons/rule-book.svg?url";
import { GAP } from "../layout.mjs";

const CARDS = [
  { id: "kingdoms", title: "Kingdom Builder", art: laurel },
  { id: "musters", title: "Army Builder", art: muster },
  { id: "collection", title: "Unit Collection", mark: "skill" },
  { id: "reference", title: "Reference", art: ruleBook },
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
            <VStack gap={GAP.group} maxWidth="62ch">
              <Heading level={1} type="display-1">Oathmark</Heading>
              <Blockquote>
                Empires have fallen, and the land is broken. The great oathmarks that once stood
                as testaments to the allegiances and might of nations have crumbled into ruin. In
                this lost age, fealty and loyalty are as valuable as gold and as deadly as cold
                iron, and war is ever-present
              </Blockquote>
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
                <ClickableCard key={c.id} label={c.title} elevation="low" padding={6} onClick={() => onOpen(c.id)}>
                  <VStack gap={6}>
                    <Center>
                      {c.art ? <img src={c.art} alt="" width={140} height={140} /> : <Mark name={c.mark} size={140} />}
                    </Center>
                    <Heading level={2}>{c.title}</Heading>
                  </VStack>
                </ClickableCard>
              ))}
            </Grid>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
