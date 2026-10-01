import React from "react";
import {
  Icon, VStack, HStack, Grid, Text, Heading, Button,
} from "@astryxdesign/core";
import { MoreMenu } from "@astryxdesign/core/MoreMenu";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import Emblem from "../components/Emblem.jsx";
import { list as listOf, get } from "../rules/store.mjs";
import { armyPoints } from "../rules/muster.mjs";
import Shell from "../Shell.jsx";
import { hueOf } from "../race.mjs";

export default function MusterList({ store, onOpen, onNew, recordActions, shell }) {
  const rows = listOf(store, "musters");

  return (
    <Shell
      {...shell}
      width={1040}
      title="Army Builder"
      meta={(
        <Button label="Muster a New Army" variant="primary"
                icon={<Icon icon="app:muster" />} onClick={onNew} />
      )}
      content={
          <VStack gap={6}>
            <Grid columns={{ minWidth: 260, max: 3, repeat: "fill" }} gap={4}>
              {rows.map((m) => {
                const k = get(store, "kingdoms", m.kingdomId);
                return (
                  <ClickableCard key={m.id} label={m.name || "Untitled"}
                                 variant={hueOf(k?.capitalList)} onClick={() => onOpen(m.id)}>
                    <VStack gap={2}>
                      <HStack gap={2} align="center" justify="between">
                        <HStack gap={2} align="center">
                          <Emblem emblemKey={k?.emblem} name={k?.name} size="lg" />
                          <Heading level={2}>{m.name || "Untitled"}</Heading>
                        </HStack>
                        {recordActions && <MoreMenu items={recordActions("musters", m)} alignment="end" />}
                      </HStack>
                      <VStack gap={1}>
                        {k && <Text>Kingdom: {k.name || "Untitled"}</Text>}
                        {m.commander && <Text>Commander: {m.commander}</Text>}
                        <Text>{armyPoints(m)} of {m.points}pts</Text>
                      </VStack>
                    </VStack>
                  </ClickableCard>
                );
              })}
            </Grid>
          </VStack>
      }
    />
  );
}
