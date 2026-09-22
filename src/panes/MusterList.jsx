import React from "react";
import {
  Layout, LayoutContent, LayoutHeader, VStack, HStack, Grid, Card, Text, Heading, Button,
} from "@astryxdesign/core";
import { MoreMenu } from "@astryxdesign/core/MoreMenu";
import { Icon } from "@iconify/react";
import Ico from "../components/Ico.jsx";
import Emblem from "../components/Emblem.jsx";
import { MUSTER } from "../icons/game.mjs";
import { list as listOf, get } from "../rules/store.mjs";
import { armyPoints } from "../rules/muster.mjs";
import { GAP } from "../layout.mjs";
import { hueOf } from "../race.mjs";

export default function MusterList({ store, onOpen, onNew, onBack, onMenu, fileActions }) {
  const rows = listOf(store, "musters");

  return (
    <Layout
      height="auto"
      padding={8}
      contentWidth={1040}
      header={
        <LayoutHeader>
          <HStack gap={GAP.item} align="center" justify="between">
            <HStack gap={GAP.item} align="center">
              <Button className="om-menu-btn" label="Menu" size="sm" variant="ghost" isIconOnly
                      icon={<Ico name="menu" size={20} />} onClick={onMenu} />
              <Button label="Back" size="sm" variant="ghost" isIconOnly
                      icon={<Ico name="arrow-left" size={20} />} onClick={onBack} />
              <Heading level={1}>Army Builder</Heading>
            </HStack>
            <MoreMenu items={fileActions} alignment="end" />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={GAP.section} className="om-page">
            <Grid columns={{ minWidth: 260, max: 3, repeat: "fill" }} gap={GAP.group}>
              {rows.map((m) => {
                const k = get(store, "kingdoms", m.kingdomId);
                return (
                  <Card key={m.id} padding={5} variant={hueOf(k?.capitalList)}>
                    <VStack gap={GAP.tight} onClick={() => onOpen(m.id)} className="om-card">
                      <HStack gap={GAP.item} align="center">
                        <Emblem emblemKey={k?.emblem} name={k?.name} />
                        <Heading level={2}>{m.name || "Untitled"}</Heading>
                      </HStack>
                      <HStack gap={GAP.item} align="baseline" wrap="wrap">
                        <Text type="label">{armyPoints(m)}/{m.points}pts</Text>
                        {k && <Text type="supporting">{k.name}</Text>}
                        {m.commander && <Text type="supporting">{m.commander}</Text>}
                      </HStack>
                    </VStack>
                  </Card>
                );
              })}
            </Grid>
            <HStack className="om-cta-dock">
              <Button label="Muster a New Army" size="lg" variant="primary"
                      icon={<Icon icon={MUSTER} width={24} height={24} />} onClick={onNew} />
            </HStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
