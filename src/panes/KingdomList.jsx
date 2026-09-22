import React from "react";
import {
  Layout, LayoutContent, LayoutHeader, VStack, HStack, Grid, Card, Text, Heading,
  Button,
} from "@astryxdesign/core";
import { Icon } from "@iconify/react";
import Ico from "../components/Ico.jsx";
import { LAUREL } from "../icons/game.mjs";
import { LEVELS, REGION_SIZES, validateKingdom } from "../rules/kingdom.mjs";
import { list as listOf } from "../rules/store.mjs";
import { GAP } from "../layout.mjs";
import { hueOf } from "../race.mjs";
import Emblem from "../components/Emblem.jsx";

function slots(level) {
  return (LEVELS[level] ?? LEVELS.moderate).reduce((n, r) => n + REGION_SIZES[r], 0);
}

const LEVEL_LABEL = { beginner: "Beginner", moderate: "Moderate", expert: "Expert" };

export default function KingdomList({ store, onOpen, onNew, onBack, onMenu }) {
  const rows = listOf(store, "kingdoms");

  return (
    <Layout
      height="auto"
      padding={8}
      contentWidth={1040}
      header={
        <LayoutHeader>
          <HStack gap={GAP.item} align="center">
            {onMenu && (
              <Button className="om-menu-btn" label="Menu" size="sm" variant="ghost" isIconOnly
                      icon={<Ico name="menu" size={20} />} onClick={onMenu} />
            )}
            {onBack && (
              <Button label="Back" size="sm" variant="ghost" isIconOnly
                      icon={<Ico name="arrow-left" size={20} />} onClick={onBack} />
            )}
            <Heading level={1}>Kingdoms</Heading>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={GAP.section} className="om-page">
            <Grid columns={{ minWidth: 260, max: 3, repeat: "fill" }} gap={GAP.group}>
            {rows.map((k) => {
              const total = slots(k.level);
              const placed = (k.territories ?? []).length;
              const ok = validateKingdom(k).ok;
              return (
                <Card key={k.id} padding={5} variant={hueOf(k.capitalList)}>
                    <VStack gap={GAP.tight} onClick={() => onOpen(k.id)} className="om-card">
                      <HStack gap={GAP.item} align="center">
                        <Emblem emblemKey={k.emblem} name={k.name} />
                        <Heading level={2}>{k.name || "Untitled"}</Heading>
                      </HStack>
                      <HStack gap={GAP.item} align="baseline">
                        <Text type="label">{LEVEL_LABEL[k.level] ?? "Moderate"}</Text>
                        {k.ruler && <Text type="supporting">{k.ruler}</Text>}
                      </HStack>
                      {!ok && <Text color="error">{total - placed} territories to place</Text>}
                    </VStack>
                </Card>
              );
            })}
            </Grid>
            <HStack className="om-cta-dock">
              <Button label="Found a Kingdom" size="lg" variant="primary"
                      icon={<Icon icon={LAUREL} width={24} height={24} />} onClick={onNew} />
            </HStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
