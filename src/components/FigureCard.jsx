import React from "react";
import { sizeRule, crewOf } from "../rules/army.mjs";
import {
  Icon, Heading, Dialog, DialogHeader, Layout, LayoutContent, VStack, HStack, Text, Table, Popover,
  Button, StackItem,
} from "@astryxdesign/core";
import { pixel } from "@astryxdesign/core/Table";
import { Attributes, StatBar } from "./StatLine.jsx";
import { figureById, stats, baseRule } from "../rules/kingdom.mjs";
import Defined from "./Defined.jsx";
import { equipmentParts } from "../rules/equipment.mjs";
import { STAT_KEYS, statText, baseText, carriesRule, weaponsOf, rangeText } from "../rules/stats.mjs";
import { costLabel } from "../rules/upgrades.mjs";
import { statWidth } from "../layout.mjs";

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
        <Defined
                 def={stats[k] && { title: stats[k].name, text: stats[k].text, note: stats[k].note, page: stats[k].page }}>
          <HStack gap={1} align="center">
            {k === "CD" && <Icon icon="app:d10" size="sm" />}
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
    <HStack gap={2} vAlign="center" wrap="wrap">
      <Text type="label">Equipment</Text>
      {parts.map(({ part, label, entry }, i) => (
        entry ? (
          <Defined key={`${label}-${i}`} def={{
            title: entry.name, text: entry.text, page: entry.page,
            note: [entry.range && `Range ${entry.range.min} to ${entry.range.max} (p72)`,
                   entry.attribute && `See ${entry.attribute}`].filter(Boolean).join(". ") || undefined,
          }}>{part}</Defined>
        ) : <Text key={`${label}-${i}`}>{part}</Text>
      ))}
    </HStack>
  );
}

function Option({ u, owns }) {
  const cost = costLabel(u);
  const changes = Object.entries(u.changes ?? {}).map(([k, v]) => `${letter(k)} ${statText(k, v)}`);
  return (
    <VStack gap={1}>
      <HStack gap={2} align="baseline" justify="between" wrap="wrap"
              style={u.requires && owns && !owns(u.requires) ? { opacity: 0.72 } : undefined}>
        <HStack gap={1} align="baseline" wrap="wrap">
          <Text weight="semibold">{u.name}</Text>
          {u.requires && <Text color="secondary">(with {u.requires})</Text>}
        </HStack>
        <Text type="label">{cost}</Text>
      </HStack>
      {(changes.length > 0 || u.base) && (
        <HStack gap={4} wrap="wrap">
          {changes.map((c) => <Text key={c}>{c}</Text>)}
          {u.base && <Text>Base {baseText(u.base)}</Text>}
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
    <HStack gap={2} align="center" wrap="wrap">
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
            {/* The same block as a unit on the roster: cost top right, the
                stat bar, then the abilities. */}
            <VStack gap={6}>
              <VStack gap={3}>
                {/* Kept flat: an Astryx Table bleeds to its container's edge when
                    it is the first or last child, so it must sit mid-stack. */}
                {shown.map((v, i) => (
                  <React.Fragment key={i}>
                    <HStack gap={2} vAlign="center">
                      <StackItem size="fill">
                        {shown.length > 1 && <Text weight="semibold">Level {v.level}</Text>}
                      </StackItem>
                      <Text type="large" weight="bold">
                        {v.pts}pts{sizeRule(fig).max > 1 && !crewOf(fig) ? " a figure" : ""}
                      </Text>
                    </HStack>
                    <StatBar variant={v} />
                  </React.Fragment>
                ))}
                <Attributes variant={shown[0]} />
                <Ranged fig={fig} />
              </VStack>
              {fig.equipment.length > 0 && <Equipment lines={fig.equipment} />}
              {fig.upgrades?.length > 0 && (
                <VStack gap={2}>
                  <Heading level={3}>Options</Heading>
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
