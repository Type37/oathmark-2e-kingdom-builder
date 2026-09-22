import React from "react";
import { HStack, VStack, Text, Section, Divider, Popover, Button } from "@astryxdesign/core";
import { STAT_KEYS } from "../rules/stats.mjs";
import { stats, lookupAttribute } from "../rules/kingdom.mjs";
import Mark from "./Mark.jsx";

// Stat column: mark and letter on top, value beneath, as on the Army Roster.
const MARK_FOR = {
  A: "skill", M: "march", F: "melee", S: "ranged",
  D: "defend", CD: "hit", H: "mortal-strike", pts: null,
};

function Definition({ title, text, note, page }) {
  return (
    <VStack gap={2}>
      <HStack gap={2} align="baseline" justify="between">
        <Text type="large">{title}</Text>
        <Text color="secondary">p{page}</Text>
      </HStack>
      <Text className="om-prose">{text}</Text>
      {note && <Text type="label">{note}</Text>}
    </VStack>
  );
}

function Column({ mark, letter, value, size = 16 }) {
  return (
    <VStack gap={0} align="center">
      <HStack gap={1} align="center">
        {mark && <Mark name={mark} size={size} />}
        <Text type="label">{letter}</Text>
      </HStack>
      <Text type="large">{value}</Text>
    </VStack>
  );
}

function StatColumn({ statKey, value, interactive }) {
  const def = stats[statKey];
  const letter = statKey === "pts" ? "Pts" : statKey;
  // A row that is itself a button cannot hold another one.
  if (!interactive) return <Column mark={MARK_FOR[statKey]} letter={letter} value={value} />;
  return (
    <Popover
      width={340}
      label={def?.name ?? letter}
      placement="below"
      content={def && <Definition title={def.name} text={def.text} note={def.note} page={def.page} />}
    >
      <Button variant="ghost" size="sm" label={`${def?.name ?? letter} ${value}`}>
        <Column mark={MARK_FOR[statKey]} letter={letter} value={value} />
      </Button>
    </Popover>
  );
}

export default function StatLine({ variant, keys = STAT_KEYS, interactive = false }) {
  return (
    <HStack gap={3} wrap="wrap">
      {keys.map((k) => (
        <StatColumn key={k} statKey={k} value={variant[k]} interactive={interactive} />
      ))}
    </HStack>
  );
}

// Derived numbers use the same column shape so the two read as one table.
const DERIVED_MARK = {
  CD: "hit", Flank: "turn", TN: "accuracy", Shoot: "ranged",
  Ranks: "reform", Morale: "morale", H: "mortal-strike",
};

export function Derived({ s }) {
  const cols = [
    ["CD", s.combatDice],
    ["Flank", s.flankDice],
    ["TN", s.targetNumber],
    s.shootTN != null ? ["Shoot", s.shootTN] : null,
    ["Ranks", s.partial ? `${s.fullRanks}+` : s.fullRanks],
    ["Morale", s.morale > 0 ? `+${s.morale}` : s.morale],
    ["H", s.health],
  ].filter(Boolean);

  return (
    <HStack gap={3} wrap="wrap">
      {cols.map(([k, v]) => (
        <Column key={k} mark={DERIVED_MARK[k]} letter={k} value={v} size={14} />
      ))}
    </HStack>
  );
}

export function Attributes({ variant }) {
  if (!variant.attributes.length) return null;
  return (
    <HStack gap={2} wrap="wrap">
      {variant.attributes.map((a) => {
        const def = lookupAttribute(a);
        return (
          <Popover
            key={a}
            width={340}
            label={def?.name ?? a}
            placement="below"
            content={def && <Definition title={a} text={def.text} page={def.page} />}
          >
            <Button label={a} size="sm" variant="secondary" />
          </Popover>
        );
      })}
    </HStack>
  );
}

export function RosterRow({ name, pts, level, s, controls, attributes, upgrades }) {
  return (
    <Section padding={0} paddingBlock={3}>
      <VStack gap={2}>
        <HStack gap={3} align="center" justify="between" wrap="wrap">
          <Text type="large">{name}</Text>
          {controls}
        </HStack>
        <HStack gap={3} wrap="wrap">
          <Text type="label">{pts}pts</Text>
          {level && <Text type="label">Level {level}</Text>}
        </HStack>
        <Derived s={s} />
        {attributes}
        {upgrades}
      </VStack>
    </Section>
  );
}

export function ArmySummary({ a }) {
  if (!a.units) return null;
  const acts = Object.entries(a.activation).sort((x, y) => Number(x[0]) - Number(y[0]));
  const rows = [
    ["Activation", acts.map(([n, c]) => `${c} on ${n}`).join(", ")],
    a.command ? ["Command", `${a.command}, giving ${a.extraActivations} extra activations`] : null,
    a.champions ? ["Champion Dice", a.champions] : null,
    a.shootingDice ? ["Shooting", `${a.shootingDice} dice to ${a.ranges.join("/")}″`] : null,
    a.casters.length
      ? ["Spellcasters", `Level ${a.casters.map((c) => c.level).join(", ")}, ${a.spellsKnown} spells`]
      : null,
    ["Health", a.health],
  ].filter(Boolean);

  return (
    <VStack gap={2}>
      {rows.map(([k, v]) => (
        <HStack key={k} gap={4} justify="between" align="baseline">
          <Text type="label">{k}</Text>
          <Text type="large">{v}</Text>
        </HStack>
      ))}
    </VStack>
  );
}
