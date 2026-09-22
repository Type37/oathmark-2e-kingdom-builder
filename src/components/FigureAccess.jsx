import React from "react";
import { VStack, List, ListItem, Text, Token } from "@astryxdesign/core";
import { figurePool, figureById, grantLabel } from "../rules/kingdom.mjs";
import { hueOf, HUE } from "../race.mjs";
import { GAP } from "../layout.mjs";

const RACE = {
  dwarf: "Dwarf", elf: "Elf", goblin: "Goblin", human: "Human",
  orc: "Orc", necropolis: "Necropolis", unaligned: "Unaligned",
};

// Everything the kingdom can muster, grouped by race. New rows rise in as territories land.
export default function FigureAccess({ kingdom, onOpen }) {
  const pool = React.useMemo(() => [...figurePool(kingdom).values()], [kingdom]);
  if (!pool.length) return null;

  const byRace = {};
  for (const e of pool) {
    const race = figureById.get(e.figureId)?.list ?? "unaligned";
    (byRace[race] ??= []).push(e);
  }

  return (
    <VStack gap={GAP.group}>
      {Object.keys(HUE).filter((r) => byRace[r]).map((race) => (
        <VStack key={race} gap={GAP.tight}>
          <Text type="label">{RACE[race]}</Text>
          <List density="compact">
            {byRace[race].map((e) => (
              <ListItem
                key={e.figureId}
                className="om-rise"
                label={e.unlimited ? e.figure : grantLabel(e)}
                endContent={e.unlimited
                  ? <Token label={`${e.maxUnits} units`} size="sm" color={hueOf(race)} />
                  : undefined}
                onClick={() => onOpen(e.figureId)}
              />
            ))}
          </List>
        </VStack>
      ))}
    </VStack>
  );
}
