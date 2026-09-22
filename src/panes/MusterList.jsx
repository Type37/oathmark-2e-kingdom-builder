import React from "react";
import {
  Layout, LayoutContent, LayoutHeader, VStack, HStack, Grid, Text, Heading, Button,
} from "@astryxdesign/core";
import { MoreMenu } from "@astryxdesign/core/MoreMenu";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Icon } from "@iconify/react";
import Ico from "../components/Ico.jsx";
import Emblem from "../components/Emblem.jsx";
import { MUSTER } from "../icons/game.mjs";
import { list as listOf, get } from "../rules/store.mjs";
import { armyPoints } from "../rules/muster.mjs";
import { GAP } from "../layout.mjs";
import { hueOf } from "../race.mjs";

export default function MusterList({ store, onOpen, onNew, onBack, onMenu, fileActions, recordActions }) {
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
                  <ClickableCard key={m.id} label={m.name || "Untitled"} padding={5}
                                 variant={hueOf(k?.capitalList)} onClick={() => onOpen(m.id)}>
                    <VStack gap={GAP.item}>
                      <HStack gap={GAP.item} align="center" justify="between">
                        <HStack gap={GAP.item} align="center">
                          <span className="om-card-emblem">
                            <Emblem emblemKey={k?.emblem} name={k?.name} size="lg" />
                          </span>
                          <Heading level={2}>{m.name || "Untitled"}</Heading>
                        </HStack>
                        {recordActions && <MoreMenu items={recordActions("musters", m)} alignment="end" />}
                      </HStack>
                      <VStack gap={0}>
                        {k && <Text>Kingdom: {k.name || "Untitled"}</Text>}
                        {m.commander && <Text>Commander: {m.commander}</Text>}
                        <Text>{armyPoints(m)} of {m.points}pts</Text>
                      </VStack>
                    </VStack>
                  </ClickableCard>
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
