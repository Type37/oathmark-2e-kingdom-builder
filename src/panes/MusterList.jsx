import React from "react";
import {
  VStack, HStack, Grid, Text, Heading, Button,
} from "@astryxdesign/core";
import { MoreMenu } from "@astryxdesign/core/MoreMenu";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Icon } from "@iconify/react";
import Emblem from "../components/Emblem.jsx";
import { MUSTER } from "../icons/game.mjs";
import { list as listOf, get } from "../rules/store.mjs";
import { armyPoints } from "../rules/muster.mjs";
import Shell from "../Shell.jsx";
import { GAP } from "../layout.mjs";
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
                icon={<Icon icon={MUSTER} width={20} height={20} />} onClick={onNew} />
      )}
      content={
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
          </VStack>
      }
    />
  );
}
