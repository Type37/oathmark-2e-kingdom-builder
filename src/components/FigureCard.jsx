import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, VStack, HStack, Text, Table,
} from "@astryxdesign/core";
import { pixel, proportional } from "@astryxdesign/core/Table";
import { Attributes } from "./StatLine.jsx";
import Mark from "./Mark.jsx";
import { figureById } from "../rules/kingdom.mjs";
import { unitStats, STAT_KEYS } from "../rules/stats.mjs";
import { GAP } from "../layout.mjs";

const MARK_FOR = {
  A: "skill", M: "march", F: "melee", S: "ranged",
  D: "defend", CD: "hit", H: "mortal-strike", pts: null,
};

// A table, so eight stats cannot reflow and orphan Pts on its own line.
function StatRow({ variants }) {
  const columns = [
    ...(variants.length > 1
      ? [{ key: "level", header: "Lvl", width: pixel(48), align: "center",
           renderCell: (r) => <Text type="label">{r.level}</Text> }]
      : []),
    ...STAT_KEYS.map((k) => ({
      key: k,
      header: (
        <VStack gap={0} align="center">
          {MARK_FOR[k] ? <Mark name={MARK_FOR[k]} size={14} /> : null}
          <Text type="label">{k === "pts" ? "Pts" : k}</Text>
        </VStack>
      ),
      width: pixel(52),
      align: "center",
      renderCell: (r) => <Text type="large">{r[k]}</Text>,
    })),
  ];
  return (
    <Table
      data={variants.map((v, i) => ({ id: i, level: v.level, ...v }))}
      columns={columns}
      idKey="id"
      density="compact"
      dividers="rows"
    />
  );
}

export default function FigureCard({ figureId, level, isOpen, onOpenChange }) {
  const fig = figureById.get(figureId);
  if (!fig) return null;
  const variants = level ? fig.variants.filter((v) => v.level === level) : fig.variants;
  const shown = variants.length ? variants : fig.variants;
  const full = unitStats({ figureId, count: fig.unitMax, level: shown[0]?.level });

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={680}>
      <Layout
        header={<DialogHeader title={fig.name} onOpenChange={onOpenChange} />}
        content={
      <LayoutContent>
      <VStack gap={GAP.group}>
        <StatRow variants={shown} />
        <Attributes variant={shown[0]} />
        {fig.equipment.length > 0 && (
          <Text>{fig.equipment.join(", ")}</Text>
        )}


        <VStack gap={GAP.tight}>
          <Text type="label">At full strength, {fig.unitMax} figures</Text>
          <HStack gap={GAP.group} wrap="wrap">
            <Text>Base {shown[0].base}mm</Text>
            <Text>Ranks of {fig.rankWidth}</Text>
            {full && <Text>{full.combatDice} Combat Dice</Text>}
            {full && <Text>Target Number {full.targetNumber} vs Defence 10</Text>}
          </HStack>
        </VStack>

        {fig.upgrades?.length > 0 && (
          <>
            <VStack gap={GAP.item}>
              <Text type="label">Options</Text>
              {fig.upgrades.map((u) => (
                <VStack key={u.name} gap={0}>
                  <HStack gap={GAP.item} align="baseline" justify="between">
                    <Text type="label">{u.name}</Text>
                    <Text type="label">
                      {u.pts != null
                        ? `+${u.pts}pts`
                        : u.costs.map((c) => `Level ${c.levels} +${c.pts}`).join(", ")}
                    </Text>
                  </HStack>
                  <Text>{u.raw}</Text>
                </VStack>
              ))}
            </VStack>
          </>
        )}
      </VStack>
      </LayoutContent>
        }
      />
    </Dialog>
  );
}
