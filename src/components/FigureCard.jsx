import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, VStack, HStack, Text, Table, Popover, Button,
} from "@astryxdesign/core";
import { pixel } from "@astryxdesign/core/Table";
import { Attributes } from "./StatLine.jsx";
import { figureById, stats } from "../rules/kingdom.mjs";
import Defined from "./Defined.jsx";
import { equipmentParts } from "../rules/equipment.mjs";
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
      header: (
        <Defined label={stats[k]?.name ?? letter(k)}
                 def={stats[k] && { title: stats[k].name, text: stats[k].text, note: stats[k].note, page: stats[k].page }}>
          <Text type="label">{letter(k)}</Text>
        </Defined>
      ),
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

// Every weapon, shield and piece of armour opens its rule, like the stats do.
function Equipment({ lines }) {
  return (
    <HStack gap={GAP.item} align="center" wrap="wrap">
      <Text type="label">Equipment</Text>
      {lines.flatMap((line) => equipmentParts(line)).map(({ part, label, entry }, i) => (
        entry ? (
          <Popover key={`${label}-${i}`} width={340} label={entry.name} placement="below"
                   content={
                     <VStack gap={2}>
                       <HStack gap={2} align="baseline" justify="between">
                         <Text type="large">{entry.name}</Text>
                         <Text color="secondary">p{entry.page}</Text>
                       </HStack>
                       <Text>{entry.text}</Text>
                       {entry.range && (
                         <Text type="label">Range {entry.range.min} to {entry.range.max} (p72)</Text>
                       )}
                       {entry.attribute && <Text type="label">See {entry.attribute}</Text>}
                     </VStack>
                   }>
            <Button label={part} size="sm" variant="secondary" />
          </Popover>
        ) : <Text key={`${label}-${i}`}>{part}</Text>
      ))}
    </HStack>
  );
}

function Option({ u, owns }) {
  const cost = u.pts != null
    ? `+${u.pts}pts`
    : u.costs?.map((c) => `Level ${c.levels} +${c.pts}pts`).join(", ");
  const changes = Object.entries(u.changes ?? {}).map(([k, v]) => `${letter(k)}${v}`);
  return (
    <VStack gap={GAP.tight}>
      <HStack gap={GAP.item} align="baseline" justify="between" wrap="wrap"
              style={u.requires && owns && !owns(u.requires) ? { opacity: 0.72 } : undefined}>
        <HStack gap={GAP.tight} align="baseline" wrap="wrap">
          <Text weight="semibold">{u.name}</Text>
          {u.requires && <Text color="secondary">(with {u.requires})</Text>}
        </HStack>
        <Text type="label">{cost}</Text>
      </HStack>
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

export default function FigureCard({ figureId, level, owns, isOpen, onOpenChange }) {
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
              <Text><i>Unlocked from: {fig.terrain}</i></Text>
              <StatRow variants={shown} />
              <Attributes variant={shown[0]} />
              {fig.equipment.length > 0 && <Equipment lines={fig.equipment} />}
              {fig.upgrades?.length > 0 && (
                <VStack gap={GAP.item}>
                  <HStack className="om-plate" justify="center"><Text type="label">Options</Text></HStack>
                  {fig.upgrades.map((u) => <Option key={u.index ?? u.name} u={u} owns={owns} />)}
                </VStack>
              )}
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}
