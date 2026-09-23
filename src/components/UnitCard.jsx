import React from "react";
import {
  VStack, HStack, Text, Button, Selector, Card, Link,
} from "@astryxdesign/core";
import Counter from "./Counter.jsx";
import Ico from "./Ico.jsx";
import Upgrades from "./Upgrades.jsx";
import Defined from "./Defined.jsx";
import { AttributeCard } from "./StatLine.jsx";
import { StatBar } from "./StatLine.jsx";
import { figureById } from "../rules/kingdom.mjs";
import { unitCost } from "../rules/muster.mjs";
import { upgradeCost, applyUpgrades } from "../rules/upgrades.mjs";
import { unitProfile, canJoin, isCharacter, crewOf, isArtillery, joinRule } from "../rules/army.mjs";
import { spellsKnown } from "../rules/magic.mjs";
import MagicItems, { CarriedItem } from "./MagicItems.jsx";
import { applyItem } from "../rules/magic.mjs";
import SpellPicker, { SpellList } from "./SpellPicker.jsx";
import { attrLevel, weaponsOf, rangeText } from "../rules/stats.mjs";
import { GAP } from "../layout.mjs";

// One entry on the Army Roster: who they are, how many, and what they carry.
export default function UnitCard({ kingdom, unit, pool, units, onChange, onJoin, onRemove, onOpenFigure }) {
  const entry = pool.get(unit.figureId);
  const p = unitProfile(unit, units, entry);
  if (!p) return null;
  const { fig, variant, charFig, guest } = p;
  const crew = crewOf(fig);
  const variantAfter = applyItem(applyUpgrades(variant, unit.upgrades ?? []), unit.magicItem);
  const caster = attrLevel(variantAfter, "Spellcaster");
  const knows = caster ? spellsKnown(unit.level ?? caster, unit.magicItem) : 0;
  const chosenSpells = unit.spells ?? [];
  const levels = entry?.levels ?? null;

  // A character already in the army may lead a unit instead of standing alone.
  const hosts = isCharacter(fig)
    ? units.filter((u) => u.uid !== unit.uid && canJoin(figureById.get(u.figureId), fig, u, unit).ok
                          && !units.some((x) => x.joinedTo === u.uid && x.uid !== unit.uid))
    : [];

  const [picking, setPicking] = React.useState(false);
  const [spelling, setSpelling] = React.useState(false);
  const [attr, setAttr] = React.useState(null);
  const patch = (next) => onChange({ ...unit, ...next });
  const notes = [
    ...weaponsOf(fig).map((w) => `${w} ${rangeText(w)}`),
    p.penalty?.occupied ? "from occupied ground, activates one worse" : null,
    p.penalty?.unreliable ? "from the borderlands, Unreliable" : null,
    p.unitOfOne ? "unit-of-one" : null,
    crew ? `crew of ${crew}` : null,
    charFig ? `led by ${charFig.name}` : null,
    unit.joinedTo ? "fighting inside a unit" : null,
  ].filter(Boolean).join(" · ");
  // Taking the ring off can leave one spell too many; the last one chosen goes.
  const carry = (magicItem) => patch({
    magicItem,
    spells: caster ? chosenSpells.slice(0, spellsKnown(unit.level ?? caster, magicItem)) : unit.spells,
  });

  return (
    <Card padding={4} variant={charFig ? "pink" : undefined}>
      <VStack gap={GAP.item}>
        {/* Name and cost on the left, the count and removal always on the right;
            what the unit is and where it came from reads underneath. */}
        <HStack gap={GAP.item} align="center" justify="between" wrap="wrap">
          <HStack gap={GAP.item} align="baseline" wrap="wrap">
            <Button variant="ghost" size="sm" label={fig.name} onClick={() => onOpenFigure(fig.id)}>
              <Text type="large">{fig.name}</Text>
            </Button>
            <Text type="large">{unitCost(unit)}pts</Text>
          </HStack>
          {/* On a phone the controls take the next row, still at the right edge. */}
          <HStack gap={GAP.item} align="center" className="om-card-controls">
            {!isArtillery(fig) && p.max > 1 && (
              <>
                {p.formation && <Text type="supporting" className="om-attr">{p.formation}</Text>}
                <Counter label={`${fig.name} figures`} value={unit.count ?? 1} min={1}
                         max={p.max - (charFig ? 1 : 0)} onChange={(n) => patch({ count: n })} />
              </>
            )}
            <Button className="om-remove" label="Remove unit" size="sm" variant="destructive" isIconOnly
                    icon={<Ico name="times" />} onClick={onRemove} />
          </HStack>
        </HStack>
        {notes && <Text type="supporting">{notes}</Text>}

        <StatBar variant={variantAfter} />
        <Text type="supporting">
          {(variantAfter.attributes ?? []).map((a, i) => (
            <React.Fragment key={a}>
              {i > 0 && ", "}
              <Link className="om-attr-link" onClick={() => setAttr(a)}>{a}</Link>
            </React.Fragment>
          ))}
        </Text>
        <AttributeCard name={attr} isOpen={Boolean(attr)} onOpenChange={(o) => !o && setAttr(null)} />

        <HStack gap={GAP.group} align="end" wrap="wrap">
          {levels?.length > 1 && (
            <Selector label="Level" width={120} value={String(unit.level ?? levels[0])}
                      onChange={(v) => patch({ level: Number(v), spells: [] })}
                      options={levels.map((l) => ({ value: String(l), label: `Level ${l}` }))} />
          )}
          {isCharacter(fig) && (
            <Selector label="Joins" width={320} value={unit.joinedTo ?? ""}
                      description={joinRule(fig, unit)} isDisabled={hosts.length === 0}
                      onChange={(v) => onJoin(v || null)}
                      options={[{ value: "", label: "Fights alone" },
                                ...hosts.map((u) => ({
                                  value: u.uid,
                                  label: figureById.get(u.figureId)?.name ?? "Unit",
                                }))]} />
          )}
        </HStack>

        {isCharacter(fig) && (
          <>
            <CarriedItem item={unit.magicItem} onOpen={() => setPicking(true)}
                         onClear={() => carry(null)} />
            <MagicItems isOpen={picking} onOpenChange={setPicking}
                        chosen={unit.magicItem?.name}
                        variant={applyUpgrades(variant, unit.upgrades ?? [])}
                        taken={units.map((u) => u.magicItem?.name).filter(Boolean)}
                        onChoose={carry} />
          </>
        )}

        <Upgrades kingdom={kingdom} figureId={unit.figureId} level={unit.level}
                  chosen={unit.upgrades ?? []}
                  onChange={(ups) => patch({
                    upgrades: ups.map((g) => ({
                      name: g.name, pts: upgradeCost(g, unit.level),
                      changes: g.changes, base: g.base, adds: g.adds,
                    })),
                  })} />

        {caster > 0 && (
          <>
            <SpellList spells={chosenSpells} knows={knows} onOpen={() => setSpelling(true)} />
            <SpellPicker isOpen={spelling} onOpenChange={setSpelling}
                         race={fig.list} level={unit.level ?? caster} magicItem={unit.magicItem} chosen={chosenSpells}
                         onChange={(spells) => patch({ spells })} />
          </>
        )}
      </VStack>
    </Card>
  );
}
