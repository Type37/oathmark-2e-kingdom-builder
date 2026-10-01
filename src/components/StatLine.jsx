import React from "react";
import {
  HStack, VStack, Text, Popover, Button, Link, Table,
  Dialog, DialogHeader, Layout, LayoutContent,
} from "@astryxdesign/core";
import { proportional } from "@astryxdesign/core/Table";
import { STAT_KEYS, statText, baseText } from "../rules/stats.mjs";
import { stats, baseRule, lookupAttribute } from "../rules/kingdom.mjs";

function Definition({ title, text, note, page }) {
  return (
    <VStack gap={2}>
      <HStack gap={2} align="baseline" justify="between">
        <Text type="large">{title}</Text>
        <Text color="secondary">p{page}</Text>
      </HStack>
      <Text>{text}</Text>
      {note && <Text type="label">{note}</Text>}
    </VStack>
  );
}

export function Attributes({ variant, onOpen }) {
  if (!variant.attributes.length) return null;
  return (
    <HStack gap={2} wrap="wrap">
      {variant.attributes.map((a) => (
        onOpen
          ? <Button key={a} label={a} size="sm" variant="secondary" onClick={() => onOpen(a)} />
          : (
            <Popover key={a} width={340} placement="below"
                     label={lookupAttribute(a)?.name ?? a}
                     content={lookupAttribute(a) && (
                       <Definition title={a} text={lookupAttribute(a).text} page={lookupAttribute(a).page} />
                     )}>
              <Button label={a} size="sm" variant="secondary" />
            </Popover>
          )
      ))}
    </HStack>
  );
}

// The one dialog those chips open.
export function AttributeCard({ name, isOpen, onOpenChange }) {
  const def = name ? lookupAttribute(name) : null;
  if (!def) return null;
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={520}>
      <Layout
        header={<DialogHeader title={name} onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={2}>
              <Text>{def.text}</Text>
              <Text color="secondary">p{def.page}</Text>
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}

// The same rule the table's header letters open, for the bar's letters.
export function StatCard({ statKey, isOpen, onOpenChange }) {
  const def = statKey === "base" ? baseRule : stats[statKey];
  if (!def) return null;
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={520}>
      <Layout
        header={<DialogHeader title={def.name} onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={2}>
              <Text>{def.text}</Text>
              {def.note && <Text type="label">{def.note}</Text>}
              <Text color="secondary">p{def.page}</Text>
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}

// The book's stat block in miniature (p218): one row of letters, values beneath,
// in fixed columns. Every letter opens its rule.
export function StatBar({ variant, keys = STAT_KEYS }) {
  const [open, setOpen] = React.useState(null);
  const cols = [...keys, "base"];
  const columns = cols.map((k) => ({
    key: k,
    align: "center",
    resizable: false,
    width: proportional(1, { minWidth: 40 }),
    header: (
      <Link color="inherit" onClick={() => setOpen(k)} label={(k === "base" ? baseRule : stats[k])?.name ?? k}>
        {k === "pts" ? "Pts" : k === "base" ? "Base" : k}
      </Link>
    ),
  }));
  const row = Object.fromEntries(cols.map((k) => [
    k, k === "base" ? baseText(variant.base) : k === "CD" ? String(variant[k]) : statText(k, variant[k]),
  ]));
  return (
    <>
      <Table data={[{ id: "stats", ...row }]} idKey="id" columns={columns} density="compact" dividers="columns" />
      <StatCard statKey={open} isOpen={Boolean(open)} onOpenChange={(o) => !o && setOpen(null)} />
    </>
  );
}
