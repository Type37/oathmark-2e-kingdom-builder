import React from "react";
import {
  StackItem, Token, Icon, VStack, HStack, Text, Button, Selector, Card, NumberInput, Layout, LayoutContent, Field,
} from "@astryxdesign/core";
import { UpgradesDialog } from "./Upgrades.jsx";
import { StatBar } from "./StatLine.jsx";
import { AttributeTerms } from "./Defined.jsx";
import InlineName from "./InlineName.jsx";
import { Toolbar } from "@astryxdesign/core/Toolbar";
import { FormLayout } from "@astryxdesign/core/FormLayout";
import { MoreMenu } from "@astryxdesign/core/MoreMenu";
import { figureById } from "../rules/kingdom.mjs";
import { unitCost } from "../rules/muster.mjs";
import { upgradeCost, applyUpgrades, upgradesFor } from "../rules/upgrades.mjs";
import { unitProfile, canJoin, isCharacter, crewOf, isArtillery, joinRule, withGuest } from "../rules/army.mjs";
import { spellsKnown, applyItem } from "../rules/magic.mjs";
import MagicItems from "./MagicItems.jsx";
import SpellPicker from "./SpellPicker.jsx";
import { attrLevel, weaponsOf, rangeText } from "../rules/stats.mjs";


// One entry on the Army Roster, laid out like the book's unit block (p218):
// name and cost, then type and quantity, then the stat bar, then every choice
// made for the unit as one labelled list. Picking happens in dialogs, so a
// card's height is set by what the unit has, never by what it could have.
export default function UnitCard({
  kingdom, unit, pool, units, onChange, onJoin, onRemove, onOpenFigure, onMove, onDuplicate, isFirst, isLast,
}) {
  const entry = pool.get(unit.figureId);
  const p = unitProfile(unit, units, entry);
  const [picking, setPicking] = React.useState(null);
  if (!p) return null;

  const { fig, variant, charFig } = p;
  const crew = crewOf(fig);
  const upgraded = applyUpgrades(variant, unit.upgrades ?? []);
  const variantAfter = withGuest(applyItem(upgraded, unit.magicItem), p);
  const caster = attrLevel(variantAfter, "Spellcaster");
  const knows = caster ? spellsKnown(unit.level ?? caster, unit.magicItem) : 0;
  const chosenSpells = unit.spells ?? [];
  const levels = entry?.levels ?? null;
  const hasOptions = upgradesFor(kingdom, unit.figureId).length > 0;
  const counts = !isArtillery(fig) && p.max > 1;
  // A unit with nothing to choose draws no empty list, so its card ends at its abilities.
  const hasChoices = levels?.length > 1 || isCharacter(fig) || hasOptions || caster > 0;

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
    crew ? `crew of ${crew}` : null,
    p.formation,
  ].filter(Boolean);

  const host = unit.joinedTo ? units.find((u) => u.uid === unit.joinedTo) : null;
  // States, not descriptions: they ride beside the name as tokens.
  const states = [
    p.unitOfOne ? "Unit-of-one" : null,
    charFig ? `Led by ${charFig.name}` : null,
    host ? `Joined to: ${host.name || figureById.get(host.figureId)?.name || "a unit"}` : null,
  ].filter(Boolean);

  const shownName = unit.name || fig.name;
  const name = (
    <InlineName label={`${fig.name} name`} value={unit.name} placeholder={fig.name} heading={3}
                onChange={(v) => patch({ name: v })} />
  );

  return (
    // Astryx's card-with-inner-layout: a Toolbar header carrying the unit's
    // name and its actions, the body underneath. Moving and removing live in
    // the arrows and the ⋯ menu.
    <Card padding={0} variant={charFig ? "pink" : undefined}>
      <Layout height="auto" padding={4} defaultHasDividers
        header={(
          <Toolbar label={`${shownName} actions`} size="md" dividers={["bottom"]}
                   startContent={(
                     <HStack gap={2} vAlign="center" wrap="wrap">
                       {name}
                       {states.map((t) => <Token key={t} label={t} size="sm" />)}
                     </HStack>
                   )}
                   endContent={(
                     <HStack gap={2} vAlign="center">
                       <Text type="large" weight="bold">{unitCost(unit)}pts</Text>
                       <Button label="Move up" variant="ghost" size="sm" isIconOnly isDisabled={isFirst}
                               icon={<Icon icon="arrowUp" />} onClick={() => onMove(-1)} />
                       <Button label="Move down" variant="ghost" size="sm" isIconOnly isDisabled={isLast}
                               icon={<Icon icon="arrowDown" />} onClick={() => onMove(1)} />
                       <MoreMenu label={`${shownName} actions`} alignment="end" items={[
                         { label: "Move to top", isDisabled: isFirst, onClick: () => onMove("top") },
                         { label: "Move to bottom", isDisabled: isLast, onClick: () => onMove("bottom") },
                         { type: "divider" },
                         { label: "Duplicate unit", onClick: onDuplicate },
                         { label: "Remove", variant: "destructive", onClick: onRemove },
                       ]} />
                     </HStack>
                   )} />
        )}
        content={(
      <LayoutContent>
      <VStack gap={3}>
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

        <StatBar variant={variantAfter} />

        <AttributeTerms attributes={variantAfter.attributes ?? []} />

        {/* Labels beside their controls, Astryx's settings-form layout, so each
            button sits next to the thing it changes. */}
        {hasChoices && (
          <FormLayout direction="horizontal-labels">
            {levels?.length > 1 && (
              <Selector label="Level" width={140} value={String(unit.level ?? levels[0])}
                        onChange={(v) => patch({ level: Number(v), spells: [] })}
                        options={levels.map((l) => ({ value: String(l), label: `Level ${l}` }))} />
            )}
            {isCharacter(fig) && (
              <Selector label="Joins" width={240} value={unit.joinedTo ?? ""}
                        isDisabled={hosts.length === 0} disabledMessage={joinRule(fig, unit)}
                        onChange={(v) => onJoin(v || null)}
                        options={[{ value: "", label: "Fights alone" },
                                  ...hosts.map((u) => ({
                                    value: u.uid,
                                    label: u.name || figureById.get(u.figureId)?.name || "Unit",
                                  }))]} />
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
          </FormLayout>
        )}
      </VStack>
      </LayoutContent>
        )} />

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

// One of the unit's choices: the button to change it beside its label, then
// what is chosen.
function Choice({ label, values, detail, isOwed, onOpen, onClear }) {
  const id = React.useId();
  return (
    <Field label={label} inputID={id}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button id={id} label={values.length ? "Change" : "Choose"} size="sm"
                  variant={isOwed ? "primary" : "secondary"} onClick={onOpen} />
          {values.length > 0 && <Text>{values.join(", ")}</Text>}
          {onClear && <Button label="Remove" size="sm" variant="ghost" onClick={onClear} />}
        </HStack>
        {detail && <Text color="secondary">{detail}</Text>}
      </VStack>
    </Field>
  );
}
