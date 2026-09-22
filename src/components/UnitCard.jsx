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
import { unitProfile, canJoin, isCharacter, crewOf, isArtillery } from "../rules/army.mjs";
import { spellsKnown } from "../rules/magic.mjs";
import MagicItems, { CarriedItem } from "./MagicItems.jsx";
import SpellPicker, { SpellList } from "./SpellPicker.jsx";
import { attrLevel } from "../rules/stats.mjs";
import { GAP } from "../layout.mjs";

// One entry on the Army Roster: who they are, how many, and what they carry.
export default function UnitCard({ kingdom, unit, pool, units, onChange, onJoin, onRemove, onOpenFigure }) {
  const p = unitProfile(unit, units);
  if (!p) return null;
  const { fig, variant, charFig, guest } = p;
  const crew = crewOf(fig);
  const variantAfter = applyUpgrades(variant, unit.upgrades ?? []);
  const caster = attrLevel(variantAfter, "Spellcaster");
  const knows = caster ? spellsKnown(unit.level ?? caster) : 0;
  const chosenSpells = unit.spells ?? [];
  const levels = pool.get(unit.figureId)?.levels ?? null;

  // A character already in the army may lead a unit instead of standing alone.
  const hosts = isCharacter(fig)
    ? units.filter((u) => u.uid !== unit.uid && canJoin(figureById.get(u.figureId), fig).ok
                          && !units.some((x) => x.joinedTo === u.uid && x.uid !== unit.uid))
    : [];

  const [picking, setPicking] = React.useState(false);
  const [spelling, setSpelling] = React.useState(false);
  const [attr, setAttr] = React.useState(null);
  const patch = (next) => onChange({ ...unit, ...next });

  return (
    <Card padding={4} variant={charFig ? "pink" : undefined}>
      <VStack gap={GAP.item}>
        <HStack gap={GAP.item} align="baseline" justify="between" wrap="wrap">
          <VStack gap={0} align="start">
            <HStack gap={GAP.item} align="baseline" wrap="wrap">
              <Button variant="ghost" size="sm" label={fig.name} onClick={() => onOpenFigure(fig.id)}>
                <Text type="large">{fig.name}</Text>
              </Button>
              <Text type="large">{unitCost(unit)}pts</Text>
            </HStack>
            <Text type="supporting">
              {[
                p.formation,
                p.unitOfOne ? "unit-of-one" : null,
                crew ? `crew of ${crew}` : null,
                charFig ? `led by ${charFig.name}` : null,
                unit.joinedTo ? "fighting inside a unit" : null,
              ].filter(Boolean).join(" · ")}
            </Text>
          </VStack>
          <HStack gap={GAP.item} align="center">
            {!isArtillery(fig) && p.max > 1 && (
              <Counter label={`${fig.name} figures`} value={unit.count ?? 1} min={1}
                       max={p.max - (charFig ? 1 : 0)} onChange={(n) => patch({ count: n })} />
            )}
            <Button label="Remove unit" size="sm" variant="ghost" isIconOnly className="om-remove"
                    icon={<Ico name="times" />} onClick={onRemove} />
          </HStack>
        </HStack>

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
          {isCharacter(fig) && hosts.length > 0 && (
            <Selector label="Joins" width={240} value={unit.joinedTo ?? ""}
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
                         onClear={() => patch({ magicItem: null })} />
            <MagicItems isOpen={picking} onOpenChange={setPicking}
                        chosen={unit.magicItem?.name}
                        taken={units.map((u) => u.magicItem?.name).filter(Boolean)}
                        onChoose={(item) => patch({ magicItem: item })} />
          </>
        )}
        <HStack gap={GAP.group} align="end" wrap="wrap">
        </HStack>

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
                         race={fig.list} level={unit.level ?? caster} chosen={chosenSpells}
                         onChange={(spells) => patch({ spells })} />
          </>
        )}
      </VStack>
    </Card>
  );
}
