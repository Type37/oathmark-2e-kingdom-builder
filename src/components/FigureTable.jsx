import React from "react";
import {
  Table, HStack, VStack, Text, Button, Badge, Popover, Link, useMediaQuery,
} from "@astryxdesign/core";
import { pixel } from "@astryxdesign/core/Table";
import { stats, baseRule } from "../rules/kingdom.mjs";
import Defined from "./Defined.jsx";
import Ico from "./Ico.jsx";
import { Icon } from "@iconify/react";
import { D10 } from "../icons/game.mjs";
import { COL, BREAK, statWidth } from "../layout.mjs";
import { STAT_KEYS, statText, baseText } from "../rules/stats.mjs";

// The stat letters belong in one header row, as the book prints them.
function Head({ statKey }) {
  const def = stats[statKey];
  const letter = statKey === "pts" ? "Pts" : statKey;
  return (
    <Popover
      width={340}
      label={def?.name ?? letter}
      placement="below"
      content={
        def && (
          <VStack gap={2}>
            <Text type="large">{def.name}</Text>
            <Text>{def.text}</Text>
            {def.note && <Text type="label">{def.note}</Text>}
          </VStack>
        )
      }
    >
      <Button variant="ghost" size="sm" label={def?.name ?? letter}>
        <HStack gap={1} align="center">
          {statKey === "CD" && <Icon icon={D10} width={16} height={16} />}
          <Text type="label">{letter}</Text>
        </HStack>
      </Button>
    </Popover>
  );
}

export default function FigureTable({ rows, onAdd, onOpen, onOpenAttribute, actionColumn, sort, onSort }) {
  // The letter keeps its definition; a caret beside it sorts the table.
  const sortable = (key, node) => {
    if (!onSort) return node;
    const active = sort?.key === key;
    return (
      <HStack gap={0} align="center" justify="center">
        {node}
        <Button variant="ghost" size="sm" isIconOnly label={`Sort by ${key}`}
                onClick={() => onSort(key)}
                icon={<Ico name={active && sort.dir === "asc" ? "arrow-up" : "arrow-down"} size={14} />} />
      </HStack>
    );
  };
  // Below 768 the stat grid cannot fit, so it drops to name, points and action.
  const isNarrow = useMediaQuery(BREAK.narrow);
  const statKeys = isNarrow ? ["pts"] : STAT_KEYS;

  const columns = [
    {
      key: "name",
      header: sortable("name", <Text type="label">Figure</Text>),
      width: pixel(COL.name),
      renderCell: (r) => (
        <VStack gap={0}>
          <Link isStandalone onClick={() => onOpen?.(r.figureId)}>{r.name}</Link>
          {r.cap && (
            <HStack gap={2} align="center">
              {r.taken ? <Badge label={String(r.taken)} /> : null}
              <Text type="supporting" color="secondary">{r.cap}</Text>
            </HStack>
          )}
        </VStack>
      ),
    },
    ...statKeys.map((k) => ({
      key: k,
      header: sortable(k, <Head statKey={k} />),
      width: pixel(statWidth(k)),
      align: "center",
      renderCell: (r) => <Text type="large">{k === "CD" ? r[k] : statText(k, r[k])}</Text>,
    })),
    ...(isNarrow ? [] : [
      { key: "special", header: "Special", width: pixel(COL.special),
        renderCell: (r) => {
          const attrs = r.fig?.variants?.[0]?.attributes ?? [];
          if (!attrs.length) return null;
          return onOpenAttribute
            ? (
              <Text>
                {attrs.map((a, i) => (
                  <React.Fragment key={a}>
                    {i > 0 && ", "}
                    <Link onClick={() => onOpenAttribute(a)}>{a}</Link>
                  </React.Fragment>
                ))}
              </Text>
            )
            : <Text>{attrs.join(", ")}</Text>;
        } },
      { key: "base", header: (
          <Defined def={{ title: baseRule.name, text: baseRule.text, note: baseRule.note, page: baseRule.page }}>
            <Text type="label">Base</Text>
          </Defined>
        ), width: pixel(COL.base), align: "center",
        renderCell: (r) => <Text>{baseText(r.fig?.variants?.[0]?.base)}mm</Text> },
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
