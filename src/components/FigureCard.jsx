import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, VStack, HStack, Text, Table,
} from "@astryxdesign/core";
import { pixel } from "@astryxdesign/core/Table";
import { Attributes } from "./StatLine.jsx";
import { figureById } from "../rules/kingdom.mjs";
import { STAT_KEYS } from "../rules/stats.mjs";
import { GAP } from "../layout.mjs";

const letter = (k) => (k === "pts" ? "Pts" : k);

// The book's stat block (p95): a grey bar of letters over one row per level.
function StatRow({ variants, extra = [] }) {
  const columns = [
    ...(variants.length > 1
      ? [{ key: "level", header: "Lvl", width: pixel(44), align: "center",
           renderCell: (r) => <Text type="label">{r.level}</Text> }]
      : []),
    ...STAT_KEYS.map((k) => ({
      key: k,
      header: letter(k),
      width: pixel(52),
      align: "center",
      renderCell: (r) => <Text type="large">{r[k]}</Text>,
    })),
    { key: "base", header: "Base", width: pixel(88), align: "center",
      renderCell: (r) => <Text>{r.base}</Text> },
    ...extra,
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

function Option({ u }) {
  const cost = u.pts != null
    ? `+${u.pts}pts`
    : u.costs?.map((c) => `Level ${c.levels} +${c.pts}pts`).join(", ");
  const changes = Object.entries(u.changes ?? {}).map(([k, v]) => `${letter(k)}${v}`);
  return (
    <VStack gap={GAP.tight}>
      <HStack gap={GAP.item} align="baseline" justify="between" wrap="wrap">
        <Text weight="semibold">{u.name}</Text>
        <Text type="label">{cost}</Text>
      </HStack>
      {u.requires && <Text color="secondary">With {u.requires}</Text>}
      {(changes.length > 0 || u.base) && (
        <HStack gap={GAP.group} wrap="wrap">
          {changes.map((c) => <Text key={c}>{c}</Text>)}
          {u.base && <Text>Base {u.base}</Text>}
        </HStack>
      )}
      {u.adds?.length > 0 && <Attributes variant={{ attributes: u.adds }} />}
      {!u.name && <Text>{u.raw}</Text>}
    </VStack>
  );
}

export default function FigureCard({ figureId, level, isOpen, onOpenChange }) {
  const fig = figureById.get(figureId);
  if (!fig) return null;
  const variants = level ? fig.variants.filter((v) => v.level === level) : fig.variants;
  const shown = variants.length ? variants : fig.variants;

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={720}>
      <Layout
        header={<DialogHeader title={fig.name} onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={GAP.group}>
              <Text><i>Terrain: {fig.terrain}</i></Text>
              <StatRow variants={shown} />
              <Attributes variant={shown[0]} />
              {fig.equipment.length > 0 && <Text>Equipment: {fig.equipment.join(", ")}</Text>}
              {fig.upgrades?.length > 0 && (
                <VStack gap={GAP.item}>
                  <HStack className="om-plate" justify="center"><Text type="label">Options</Text></HStack>
                  {fig.upgrades.map((u) => <Option key={u.index ?? u.name} u={u} />)}
                </VStack>
              )}
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}
