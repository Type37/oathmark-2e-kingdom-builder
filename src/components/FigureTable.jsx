import React from "react";
import {
  Table, HStack, VStack, Text, Button, Badge, Popover, useMediaQuery,
} from "@astryxdesign/core";
import { pixel, proportional } from "@astryxdesign/core/Table";
import Mark from "./Mark.jsx";
import { stats } from "../rules/kingdom.mjs";
import { COL, BREAK } from "../layout.mjs";
import { STAT_KEYS } from "../rules/stats.mjs";

const MARK_FOR = {
  A: "skill", M: "march", F: "melee", S: "ranged",
  D: "defend", CD: "hit", H: "mortal-strike", pts: null,
};

// The stat letters belong in one header row, as the book prints them.
function Head({ statKey }) {
  const def = stats[statKey];
  const letter = statKey === "pts" ? "Pts" : statKey;
  const mark = MARK_FOR[statKey];
  return (
    <Popover
      width={340}
      label={def?.name ?? letter}
      placement="below"
      content={
        def && (
          <VStack gap={2}>
            <Text type="large">{def.name}</Text>
            <Text className="om-prose">{def.text}</Text>
            {def.note && <Text type="label">{def.note}</Text>}
          </VStack>
        )
      }
    >
      <Button variant="ghost" size="sm" label={def?.name ?? letter}>
        <VStack gap={0} align="center">
          {mark ? <Mark name={mark} size={15} /> : null}
          <Text type="label">{letter}</Text>
        </VStack>
      </Button>
    </Popover>
  );
}

export default function FigureTable({ rows, onAdd, onOpen, actionColumn }) {
  // Below 768 the stat grid cannot fit, so it drops to name, points and action.
  const isNarrow = useMediaQuery(BREAK.narrow);
  const statKeys = isNarrow ? ["pts"] : STAT_KEYS;

  const columns = [
    {
      key: "name",
      header: "Figure",
      width: proportional(COL.name),
      renderCell: (r) => (
        <Button
          variant="ghost"
          size="sm"
          label={r.name}
          onClick={() => onOpen?.(r.figureId)}
        />
      ),
    },
    ...statKeys.map((k) => ({
      key: k,
      header: <Head statKey={k} />,
      width: pixel(COL.stat),
      align: "center",
      renderCell: (r) => <Text type="large">{r[k]}</Text>,
    })),
    {
      key: "cap",
      header: "Limit",
      isHidden: isNarrow,
      width: pixel(COL.limit),
      align: "end",
      renderCell: (r) => (
        <HStack gap={2} align="center" justify="end">
          {r.taken ? <Badge label={String(r.taken)} /> : null}
          <Text type="supporting">{r.cap}</Text>
        </HStack>
      ),
    },
    actionColumn
      ? {
          key: "action",
          header: actionColumn.header ?? "",
          width: pixel(150),
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
      density="balanced"
      dividers="rows"
      hasHover
      textOverflow="wrap"
    />
  );
}
