import React from "react";
import {
  Icon, Table, HStack, VStack, Text, Button, Popover, Link, useMediaQuery,
} from "@astryxdesign/core";
import { pixel, proportional } from "@astryxdesign/core/Table";
import { stats, baseRule } from "../rules/kingdom.mjs";
import Defined, { AttributeTerms } from "./Defined.jsx";
import { COL, BREAK, statWidth } from "../layout.mjs";
import { STAT_KEYS, statText, baseText } from "../rules/stats.mjs";

// The stat letters belong in one header row, as the book prints them.
function Head({ statKey }) {
  const def = stats[statKey];
  const letter = statKey === "pts" ? "Pts" : statKey;
  return (
    <Defined def={def && { title: def.name, text: def.text, note: def.note, page: def.page }}>
      <HStack gap={1} vAlign="center">
        {statKey === "CD" && <Icon icon="app:d10" size="sm" />}
        <Text type="label" color="inherit">{letter}</Text>
      </HStack>
    </Defined>
  );
}

export default function FigureTable({ rows, onAdd, onOpen, actionColumn, sort, onSort }) {
  // The letter keeps its definition; a caret beside it sorts the table.
  const sortable = (key, node) => {
    if (!onSort) return node;
    const active = sort?.key === key;
    return (
      <HStack gap={0} align="center" justify="center">
        {node}
        <Button variant="ghost" size="sm" isIconOnly label={`Sort by ${key}`}
                onClick={() => onSort(key)}
                icon={<Icon icon={active && sort.dir === "asc" ? "arrowUp" : "arrowDown"} />} />
      </HStack>
    );
  };
  // Below 768 the stat grid cannot fit, so it drops to name, points and action.
  const isNarrow = useMediaQuery(BREAK.narrow);
  const statKeys = isNarrow ? ["pts"] : STAT_KEYS;

  const columns = [
    {
      key: "name",
      header: sortable("name", <Text type="label" color="inherit">Figure</Text>),
      width: proportional(1),
      align: "start",
      renderCell: (r) => {
        const attrs = r.fig?.variants?.[0]?.attributes ?? [];
        return (
          <VStack gap={0}>
            <Link isStandalone onClick={() => onOpen?.(r.figureId)}>{r.name}</Link>
            {r.cap && (
              <HStack gap={2} align="center">
                <Text type="supporting" color="secondary">{r.cap}</Text>
              </HStack>
            )}
            {/* The abilities read under the name, as on a unit card: a column of
                their own was squeezed to a word per line. Each comma stays with
                the ability before it. */}
            <AttributeTerms attributes={attrs} />
          </VStack>
        );
      },
    },
    ...statKeys.map((k) => ({
      key: k,
      header: sortable(k, <Head statKey={k} />),
      width: pixel(statWidth(k)),
      align: "center",
      renderCell: (r) => <Text type="large">{k === "CD" ? r[k] : statText(k, r[k])}</Text>,
    })),
    ...(isNarrow ? [] : [
      { key: "base", header: (
          <Defined def={{ title: baseRule.name, text: baseRule.text, note: baseRule.note, page: baseRule.page }}>
            <Text type="label" color="inherit">Base</Text>
          </Defined>
        ), width: pixel(COL.base), align: "center",
        renderCell: (r) => <Text>{baseText(r.fig?.variants?.[0]?.base)}</Text> },
    ]),
    actionColumn
      ? {
          key: "action",
          header: actionColumn.header ?? "",
          width: pixel(actionColumn.width ?? 150),
          align: "end",
          renderCell: actionColumn.render,
        }
      : {
          key: "add",
          header: "",
          width: pixel(COL.action),
          align: "end",
          renderCell: (r) =>
            r.atCap ? null : (
              <Button size="sm" variant="primary" label="Add" onClick={() => onAdd?.(r)} />
            ),
        },
  ];

  return (
    <Table
      data={rows}
      columns={columns.filter((c) => !c.isHidden)}
      idKey="figureId"
      density="compact"
      dividers="rows"
      hasHover
      textOverflow="wrap"
    />
  );
}
