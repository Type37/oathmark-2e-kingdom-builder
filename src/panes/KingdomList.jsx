import React from "react";
import {
  VStack, HStack, Grid, Text, Heading, Button,
} from "@astryxdesign/core";
import { MoreMenu } from "@astryxdesign/core/MoreMenu";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Icon } from "@iconify/react";
import { LAUREL } from "../icons/game.mjs";
import { LEVELS, REGION_SIZES, validateKingdom } from "../rules/kingdom.mjs";
import { list as listOf } from "../rules/store.mjs";
import Shell from "../Shell.jsx";
import { GAP } from "../layout.mjs";
import { hueOf } from "../race.mjs";
import Emblem from "../components/Emblem.jsx";
const capitalOf = (k) => k?.territories?.find((t) => t.region === 1)?.name ?? null;

function slots(level) {
  return (LEVELS[level] ?? LEVELS.moderate).reduce((n, r) => n + REGION_SIZES[r], 0);
}


export default function KingdomList({ store, onOpen, onNew, recordActions, shell }) {
  const rows = listOf(store, "kingdoms");

  return (
    <Shell
      {...shell}
      width={1040}
      title="Kingdom Builder"
      meta={(
        <Button label="New Kingdom" variant="primary"
                icon={<Icon icon={LAUREL} width={20} height={20} />} onClick={onNew} />
      )}
      content={
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
      }
    />
  );
}
