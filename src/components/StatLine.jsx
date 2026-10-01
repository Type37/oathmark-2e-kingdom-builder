import React from "react";
import { Table } from "@astryxdesign/core";
import { proportional } from "@astryxdesign/core/Table";
import { STAT_KEYS, statText, baseText } from "../rules/stats.mjs";
import { stats, baseRule } from "../rules/kingdom.mjs";
import Defined, { AttributeTerms } from "./Defined.jsx";

const ruleFor = (k) => {
  const def = k === "base" ? baseRule : stats[k];
  return def && { title: def.name, text: def.text, note: def.note, page: def.page };
};

// A figure's abilities, kept under its old name for the reference views.
export function Attributes({ variant }) {
  return <AttributeTerms attributes={variant.attributes ?? []} />;
}

// The book's stat block in miniature (p218): one row of letters, values beneath,
// in fixed columns. Every letter opens its rule.
export function StatBar({ variant, keys = STAT_KEYS }) {
  const cols = [...keys, "base"];
  const columns = cols.map((k) => ({
    key: k,
    align: "center",
    resizable: false,
    width: proportional(1, { minWidth: 40 }),
    header: (
      <Defined def={ruleFor(k)}>{k === "pts" ? "Pts" : k === "base" ? "Base" : k}</Defined>
    ),
  }));
  const row = Object.fromEntries(cols.map((k) => [
    k, k === "base" ? baseText(variant.base) : k === "CD" ? String(variant[k]) : statText(k, variant[k]),
  ]));
  return (
    <Table data={[{ id: "stats", ...row }]} idKey="id" columns={columns} density="compact" dividers="columns" />
  );
}
