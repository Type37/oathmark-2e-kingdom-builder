import React from "react";
import {
  VStack, HStack, Text, Button, Token, Selector, Card, CheckboxList, CheckboxListItem,
} from "@astryxdesign/core";
import Counter from "./Counter.jsx";
import Ico from "./Ico.jsx";
import Upgrades from "./Upgrades.jsx";
import Defined from "./Defined.jsx";
import { Attributes } from "./StatLine.jsx";
import StatLine from "./StatLine.jsx";
import { figureById } from "../rules/kingdom.mjs";
import { unitCost } from "../rules/muster.mjs";
import { upgradeCost, applyUpgrades } from "../rules/upgrades.mjs";
import { unitProfile, canJoin, isCharacter, crewOf, isArtillery } from "../rules/army.mjs";
import { spellsFor, spellsKnown, itemsFor } from "../rules/magic.mjs";
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

  const patch = (next) => onChange({ ...unit, ...next });

  return (
    <Card padding={4} variant={charFig ? "pink" : undefined}>
      <VStack gap={GAP.item}>
        <HStack gap={GAP.item} align="baseline" justify="between" wrap="wrap">
          <HStack gap={GAP.item} align="baseline" wrap="wrap">
            <Button variant="ghost" size="sm" label={fig.name} onClick={() => onOpenFigure(fig.id)}>
              <Text type="large">{fig.name}</Text>
            </Button>
            <Token label={`${unitCost(unit)}pts`} />
            {p.formation && <Token label={p.formation} size="sm" />}
            {p.unitOfOne && <Token label="Unit-of-one" size="sm" color="gray" />}
            {crew && <Token label={`Crew ${crew}`} size="sm" />}
            {charFig && <Token label={`Led by ${charFig.name}`} size="sm" color="pink" />}
            {unit.joinedTo && <Token label="In a unit" size="sm" color="pink" />}
          </HStack>
          <HStack gap={GAP.item} align="center">
            {!isArtillery(fig) && p.max > 1 && (
              <Counter label={`${fig.name} figures`} value={unit.count ?? 1} min={1}
                       max={p.max - (charFig ? 1 : 0)} onChange={(n) => patch({ count: n })} />
            )}
            <Button label="Remove unit" size="sm" variant="ghost" isIconOnly className="om-remove"
                    icon={<Ico name="times" />} onClick={onRemove} />
          </HStack>
        </HStack>

        <StatLine variant={variantAfter} interactive />
        <Attributes variant={variantAfter} />

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
          {isCharacter(fig) && (
            <Selector label="Magic Item" width={230}
                      value={unit.magicItem?.name ?? ""}
                      onChange={(v) => patch({ magicItem: v ? itemsFor().find((i) => i.name === v) : null })}
                      options={[{ value: "", label: "None" },
                                ...itemsFor().map((i) => ({ value: i.name, label: `${i.name} ${i.pts}pts` }))]} />
          )}
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
          <VStack gap={GAP.tight}>
            <HStack gap={GAP.item} align="baseline">
              <Text type="label">Spells</Text>
              <Token label={`${chosenSpells.length} of ${knows}`}
                     color={chosenSpells.length === knows ? "green" : undefined} size="sm" />
            </HStack>
            <CheckboxList label="Spells" isLabelHidden density="compact" value={chosenSpells}
                          onChange={(next) => patch({ spells: next.slice(0, knows) })}>
              {spellsFor(fig.list).map((s) => (
                <CheckboxListItem key={s.name} value={s.name} label={`${s.name} (CN${s.cn})`}
                                  isDisabled={!chosenSpells.includes(s.name) && chosenSpells.length >= knows}
                                  description={<Text type="supporting">{s.text}</Text>} />
              ))}
            </CheckboxList>
          </VStack>
        )}
      </VStack>
    </Card>
  );
}
