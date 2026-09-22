import React from "react";
import { VStack, HStack, Text, CheckboxList, CheckboxListItem } from "@astryxdesign/core";
import { upgradesFor, upgradeCost } from "../rules/upgrades.mjs";

// Old World Builder's shape: one row per option, cost right-aligned, and the
// prerequisite stated where it blocks you.
export default function Upgrades({ kingdom, figureId, level, chosen = [], onChange }) {
  const ups = upgradesFor(kingdom, figureId);
  if (!ups.length) return null;

  const names = chosen.map((u) => u.name);
  // A mount and a chariot both set the base size, so only one may apply.
  const takenBase = chosen.find((u) => u.base)?.name;

  return (
    <CheckboxList
      label="Options"
      value={names}
      hasDividers
      density="compact"
      onChange={(next) => onChange(ups.filter((u) => next.includes(u.name)))}
    >
      {ups.map((u) => {
        const cost = upgradeCost(u, level);
        const blockedByBase = Boolean(u.base && takenBase && takenBase !== u.name);
        const why = !u.available
          ? `needs ${u.requires}`
          : blockedByBase
            ? `not with ${takenBase}`
            : null;
        return (
          <CheckboxListItem
            key={u.name}
            value={u.name}
            label={u.name}
            isDisabled={!u.available || blockedByBase}
            description={
              <VStack gap={0}>
                {u.changes && (
                  <Text>
                    {Object.entries(u.changes).map(([k, v]) => `${k} ${v}`).join(", ")}
                    {u.base ? `, base ${u.base}` : ""}
                  </Text>
                )}
                {u.adds && <Text>{u.adds.join(", ")}</Text>}
                {why && <Text type="supporting">{why}</Text>}
              </VStack>
            }
            endContent={<Text type="label">+{cost}pts</Text>}
          />
        );
      })}
    </CheckboxList>
  );
}
