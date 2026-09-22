import React from "react";
import {
  Layout, LayoutContent, LayoutHeader, VStack, HStack, Grid, Text, Heading, Button,
} from "@astryxdesign/core";
import { MoreMenu } from "@astryxdesign/core/MoreMenu";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Icon } from "@iconify/react";
import Ico from "../components/Ico.jsx";
import { LAUREL } from "../icons/game.mjs";
import { LEVELS, REGION_SIZES, validateKingdom } from "../rules/kingdom.mjs";
import { list as listOf } from "../rules/store.mjs";
import { GAP } from "../layout.mjs";
import { hueOf } from "../race.mjs";
import Emblem from "../components/Emblem.jsx";
const capitalOf = (k) => k?.territories?.find((t) => t.region === 1)?.name ?? null;

function slots(level) {
  return (LEVELS[level] ?? LEVELS.moderate).reduce((n, r) => n + REGION_SIZES[r], 0);
}


export default function KingdomList({ store, onOpen, onNew, onBack, onMenu, fileActions, recordActions }) {
  const rows = listOf(store, "kingdoms");

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
              <Heading level={1}>Kingdom Builder</Heading>
            </HStack>
            <HStack gap={GAP.item} align="center">
              <Button label="New Kingdom" variant="primary"
                      icon={<Icon icon={LAUREL} width={20} height={20} />} onClick={onNew} />
              <MoreMenu items={fileActions} alignment="end" />
            </HStack>
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
                <ClickableCard key={k.id} label={k.name || "Untitled"} padding={5}
                               variant={hueOf(k.capitalList)} onClick={() => onOpen(k.id)}>
                  <VStack gap={GAP.item}>
                    <HStack gap={GAP.item} align="center" justify="between">
                      <HStack gap={GAP.item} align="center">
                        <span className="om-card-emblem"><Emblem emblemKey={k.emblem} name={k.name} size="lg" /></span>
                        <Heading level={2}>{k.name || "Untitled"}</Heading>
                      </HStack>
                      {recordActions && <MoreMenu items={recordActions("kingdoms", k)} alignment="end" />}
                    </HStack>
                    <VStack gap={0}>
                      {k.ruler && <Text>Ruler: {k.ruler}</Text>}
                      {capitalOf(k) && <Text>Capital: {capitalOf(k)}</Text>}
                      {!ok && (
                        <Text color="error">
                          {total - placed === 1 ? "1 territory to place" : `${total - placed} territories to place`}
                        </Text>
                      )}
                    </VStack>
                  </VStack>
                </ClickableCard>
              );
            })}
            </Grid>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
