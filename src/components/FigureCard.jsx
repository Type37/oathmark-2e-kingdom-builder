import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, VStack, HStack, Text, Table, Popover, Button,
} from "@astryxdesign/core";
import { pixel } from "@astryxdesign/core/Table";
import { Attributes, StatBar } from "./StatLine.jsx";
import { figureById, stats, baseRule } from "../rules/kingdom.mjs";
import Defined from "./Defined.jsx";
import { Icon } from "@iconify/react";
import { D10 } from "../icons/game.mjs";
import { equipmentParts } from "../rules/equipment.mjs";
import { STAT_KEYS, statText, baseText, carriesRule, weaponsOf, rangeText } from "../rules/stats.mjs";
import { costLabel } from "../rules/upgrades.mjs";
import { GAP, statWidth } from "../layout.mjs";

const letter = (k) => (k === "pts" ? "Pts" : k);

// The book's stat block (p95): a grey bar of letters over one row per level.
function StatRow({ variants, extra = [] }) {
  const columns = [
    ...(variants.length > 1
      ? [{ key: "level", header: "Level", width: pixel(64), align: "center",
           renderCell: (r) => <Text type="label">{r.level}</Text> }]
      : []),
    ...STAT_KEYS.map((k) => ({
      key: k,
      header: (
        <Defined label={stats[k]?.name ?? letter(k)}
                 def={stats[k] && { title: stats[k].name, text: stats[k].text, note: stats[k].note, page: stats[k].page }}>
          <HStack gap={1} align="center">
            {k === "CD" && <Icon icon={D10} width={16} height={16} />}
            <Text type="label">{letter(k)}</Text>
          </HStack>
        </Defined>
      ),
      width: pixel(statWidth(k)),
      align: "center",
      renderCell: (r) => <Text type="large">{k === "CD" ? r[k] : statText(k, r[k])}</Text>,
    })),
    { key: "base", width: pixel(72), align: "center",
      header: (
        <Defined def={{ title: baseRule.name, text: baseRule.text, note: baseRule.note, page: baseRule.page }}>
          <Text type="label">Base</Text>
        </Defined>
      ),
      renderCell: (r) => <Text>{baseText(r.base)}</Text> },
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
  const parts = lines.flatMap((line) => equipmentParts(line)).filter(({ label }) => carriesRule(label));
  if (!parts.length) return null;
  return (
    <HStack gap={GAP.item} align="center" wrap="wrap">
      <Text type="label">Equipment</Text>
      {parts.map(({ part, label, entry }, i) => (
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
  const cost = costLabel(u);
  const changes = Object.entries(u.changes ?? {}).map(([k, v]) => `${letter(k)} ${statText(k, v)}`);
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
          {u.base && <Text>Base {baseText(u.base)}mm</Text>}
        </HStack>
      )}
      {u.adds?.length > 0 && <Attributes variant={{ attributes: u.adds }} />}
      {!u.name && <Text>{u.raw}</Text>}
    </VStack>
  );
}

// Missile weapons and artillery, with the ranges from p72.
function Ranged({ fig }) {
  const carried = weaponsOf(fig);
  const attrs = fig.variants[0]?.attributes ?? [];
  const artillery = attrs.some((a) => a.startsWith("Artillery")) ;
  const breath = attrs.filter((a) => a.startsWith("Fire Breath")).map(() => "Fire Breath");
  const named = [...new Set([...carried, ...breath, ...(artillery && !carried.length ? weaponsFromName(fig.name) : [])])];
  if (!named.length) return null;
  return (
    <HStack gap={GAP.item} align="center" wrap="wrap">
      <Text type="label">Ranged</Text>
      {named.map((w) => <Text key={w}>{w} {rangeText(w)}</Text>)}
    </HStack>
  );
}

// A catapult or ballista carries its weapon in its name, not its equipment line.
function weaponsFromName(name) {
  return Object.keys(RANGES).filter((w) => name.includes(w));
}

export default function FigureCard({ figureId, level, owns, isOpen, onOpenChange }) {
  const fig = figureById.get(figureId);
  if (!fig) return null;
  const variants = level ? fig.variants.filter((v) => v.level === level) : fig.variants;
  const shown = variants.length ? variants : fig.variants;

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={720}>
      <Layout
        header={<DialogHeader title={fig.name} subtitle={`Unlocked from ${fig.terrain}`} onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={GAP.group}>
              <VStack gap={GAP.item}>
                {shown.map((v, i) => (
                  <VStack key={i} gap={0}>
                    {shown.length > 1 && <Text type="label">Level {v.level}</Text>}
                    <StatBar variant={v} />
                  </VStack>
                ))}
              </VStack>
              <Ranged fig={fig} />
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
