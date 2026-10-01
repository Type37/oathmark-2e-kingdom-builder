import React from "react";
import {
  Icon, VStack, HStack, StackItem, Text, Button, Selector, Card, List, ListItem,
  useMediaQuery, NumberInput,
} from "@astryxdesign/core";
import { UpgradesDialog } from "./Upgrades.jsx";
import { StatBar } from "./StatLine.jsx";
import { AttributeTerms } from "./Defined.jsx";
import InlineName from "./InlineName.jsx";
import { figureById } from "../rules/kingdom.mjs";
import { unitCost } from "../rules/muster.mjs";
import { upgradeCost, applyUpgrades, upgradesFor } from "../rules/upgrades.mjs";
import { unitProfile, canJoin, isCharacter, crewOf, isArtillery, joinRule } from "../rules/army.mjs";
import { spellsKnown, applyItem } from "../rules/magic.mjs";
import MagicItems from "./MagicItems.jsx";
import SpellPicker from "./SpellPicker.jsx";
import { attrLevel, weaponsOf, rangeText, STAT_KEYS } from "../rules/stats.mjs";
import { BREAK } from "../layout.mjs";

// The cost sits beside the name, so the card's stat bar leaves it out.
const CARD_STATS = STAT_KEYS.filter((k) => k !== "pts");

// One entry on the Army Roster, laid out like the book's unit block (p218):
// name and cost, then type and quantity, then the stat bar, then every choice
// made for the unit as one labelled list. Picking happens in dialogs, so a
// card's height is set by what the unit has, never by what it could have.
export default function UnitCard({
  kingdom, unit, pool, units, onChange, onJoin, onRemove, onOpenFigure, onMove, isFirst, isLast,
}) {
  const entry = pool.get(unit.figureId);
  const p = unitProfile(unit, units, entry);
  const [picking, setPicking] = React.useState(null);
  const narrow = useMediaQuery(BREAK.narrow);
  if (!p) return null;

  const { fig, variant, charFig } = p;
  const crew = crewOf(fig);
  const upgraded = applyUpgrades(variant, unit.upgrades ?? []);
  const variantAfter = applyItem(upgraded, unit.magicItem);
  const caster = attrLevel(variantAfter, "Spellcaster");
  const knows = caster ? spellsKnown(unit.level ?? caster, unit.magicItem) : 0;
  const chosenSpells = unit.spells ?? [];
  const levels = entry?.levels ?? null;
  const hasOptions = upgradesFor(kingdom, unit.figureId).length > 0;
  const counts = !isArtillery(fig) && p.max > 1;

  // A character already in the army may lead a unit instead of standing alone.
  const hosts = isCharacter(fig)
    ? units.filter((u) => u.uid !== unit.uid && canJoin(figureById.get(u.figureId), fig, u, unit).ok
                          && !units.some((x) => x.joinedTo === u.uid && x.uid !== unit.uid))
    : [];

  const patch = (next) => onChange({ ...unit, ...next });
  // Taking the ring off can leave one spell too many; the last one chosen goes.
  const carry = (magicItem) => patch({
    magicItem,
    spells: caster ? chosenSpells.slice(0, spellsKnown(unit.level ?? caster, magicItem)) : unit.spells,
  });
  const close = (o) => !o && setPicking(null);

  const notes = [
    ...weaponsOf(fig).map((w) => `${w} ${rangeText(w)}`),
    p.penalty?.occupied ? "from occupied ground, activates one worse" : null,
    p.penalty?.unreliable ? "from the borderlands, Unreliable" : null,
    p.unitOfOne ? "unit-of-one" : null,
    crew ? `crew of ${crew}` : null,
    charFig ? `led by ${charFig.name}` : null,
    unit.joinedTo ? "fighting inside a unit" : null,
    p.formation,
  ].filter(Boolean);

  const name = (
    <InlineName label={`${fig.name} name`} value={unit.name} placeholder={fig.name}
                onChange={(v) => patch({ name: v })} />
  );

  return (
    <Card variant={charFig ? "pink" : undefined}>
      <VStack gap={3}>
        {/* On a phone the name takes the whole row, so it is never cut short. */}
        {narrow && name}
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">{!narrow && name}</StackItem>
          <Text type="large" weight="bold">{unitCost(unit)}pts</Text>
          <Button label="Move up" variant="ghost" isIconOnly isDisabled={isFirst}
                  icon={<Icon icon="arrowUp" />} onClick={() => onMove(-1)} />
          <Button label="Move down" variant="ghost" isIconOnly isDisabled={isLast}
                  icon={<Icon icon="arrowDown" />} onClick={() => onMove(1)} />
          <Button label="Remove unit" variant="ghost" isIconOnly
                  icon={<Icon icon="close" />} onClick={onRemove} />
        </HStack>

        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <HStack gap={3} vAlign="center" wrap="wrap">
              {unit.name && <Text type="supporting">{fig.name}</Text>}
              {notes.map((n) => <Text key={n} type="supporting">{n}</Text>)}
            </HStack>
          </StackItem>
          {counts && (
            <NumberInput label={`${fig.name} figures`} isLabelHidden hasNumberSteppers isIntegerOnly width={170}
                         units="figures"
                         value={unit.count ?? 1} min={1} max={p.max - (charFig ? 1 : 0)}
                         onChange={(n) => patch({ count: n })} />
          )}
        </HStack>

        <StatBar variant={variantAfter} keys={CARD_STATS} />

        <AttributeTerms attributes={variantAfter.attributes ?? []} />

        <List density="compact">
          {levels?.length > 1 && (
            <ListItem label="Level" endContent={(
              <Selector label="Level" isLabelHidden width={140} value={String(unit.level ?? levels[0])}
                        onChange={(v) => patch({ level: Number(v), spells: [] })}
                        options={levels.map((l) => ({ value: String(l), label: `Level ${l}` }))} />
            )} />
          )}
          {isCharacter(fig) && (
            <ListItem label="Joins" endContent={(
              <Selector label="Joins" isLabelHidden width={240} value={unit.joinedTo ?? ""}
                        isDisabled={hosts.length === 0} disabledMessage={joinRule(fig, unit)}
                        onChange={(v) => onJoin(v || null)}
                        options={[{ value: "", label: "Fights alone" },
                                  ...hosts.map((u) => ({
                                    value: u.uid,
                                    label: u.name || figureById.get(u.figureId)?.name || "Unit",
                                  }))]} />
            )} />
          )}
          {hasOptions && (
            <Choice label="Options" values={(unit.upgrades ?? []).map((u) => `${u.name} +${u.pts}pts`)}
                    onOpen={() => setPicking("options")} />
          )}
          {isCharacter(fig) && (
            <Choice label="Magic item"
                    values={unit.magicItem ? [`${unit.magicItem.name} ${unit.magicItem.pts}pts`] : []}
                    detail={unit.magicItem?.text}
                    onOpen={() => setPicking("item")}
                    onClear={unit.magicItem ? () => carry(null) : undefined} />
          )}
          {caster > 0 && (
            <Choice label={`Spells ${chosenSpells.length}/${knows}`} values={chosenSpells}
                    isOwed={chosenSpells.length < knows} onOpen={() => setPicking("spells")} />
          )}
        </List>
      </VStack>

      {hasOptions && (
        <UpgradesDialog isOpen={picking === "options"} onOpenChange={close}
                        kingdom={kingdom} figureId={unit.figureId} level={unit.level}
                        chosen={unit.upgrades ?? []}
                        onChange={(ups) => patch({
                          upgrades: ups.map((g) => ({
                            name: g.name, pts: upgradeCost(g, unit.level),
                            changes: g.changes, base: g.base, adds: g.adds,
                          })),
                        })} />
      )}
      {isCharacter(fig) && (
        <MagicItems isOpen={picking === "item"} onOpenChange={close}
                    chosen={unit.magicItem?.name} variant={upgraded}
                    taken={units.map((u) => u.magicItem?.name).filter(Boolean)}
                    onChoose={carry} />
      )}
      {caster > 0 && (
        <SpellPicker isOpen={picking === "spells"} onOpenChange={close}
                     race={fig.list} level={unit.level ?? caster} magicItem={unit.magicItem}
                     chosen={chosenSpells} onChange={(spells) => patch({ spells })} />
      )}
    </Card>
  );
}

// One row of the unit's choices: what is chosen beneath the label, and the
// way to change it at the row's end, so every row's button sits in one place.
function Choice({ label, values, detail, isOwed, onOpen, onClear }) {
  const chosen = values.length > 0 || detail;
  return (
    <ListItem
      label={label}
      description={chosen ? (
        <VStack gap={0}>
          {values.length > 0 && <Text>{values.join(", ")}</Text>}
          {detail && <Text type="supporting">{detail}</Text>}
        </VStack>
      ) : undefined}
      endContent={(
        <HStack gap={2} vAlign="center">
          {onClear && <Button label="Remove" size="sm" variant="ghost" onClick={onClear} />}
          <Button label={values.length ? "Change" : "Choose"} size="sm"
                  variant={isOwed ? "primary" : "secondary"} onClick={onOpen} />
        </HStack>
      )}
    />
  );
}
