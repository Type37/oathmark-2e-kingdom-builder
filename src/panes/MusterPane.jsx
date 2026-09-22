import React from "react";
import {
  VStack, HStack, Text, Section, NumberInput, ProgressBar, Button, Token, MetadataList, MetadataListItem,
} from "@astryxdesign/core";
import FigureCard from "../components/FigureCard.jsx";
import UnitCard from "../components/UnitCard.jsx";
import AddUnits from "../components/AddUnits.jsx";
import Ico from "../components/Ico.jsx";
import Shell from "../Shell.jsx";
import { figurePool, figureById } from "../rules/kingdom.mjs";
import { validateArmy } from "../rules/muster.mjs";
import { armyStats } from "../rules/stats.mjs";
import { shortfalls } from "../rules/collection.mjs";
import { sizeRule, crewOf, isArtillery, unitProfile } from "../rules/army.mjs";
import { battleTypeById } from "../rules/battle.mjs";
import { GAP } from "../layout.mjs";

// The Army Roster (p218): the units you have bought, what they cost, and what
// the muster rules (p35) say about them.
export default function MusterPane({ kingdom, collection = {}, settings = {}, value, onChange, ready, shell }) {
  const [openFigure, setOpenFigure] = React.useState(null);
  const [adding, setAdding] = React.useState(false);
  const points = value.points ?? 1000;
  const units = value.units ?? [];

  const pool = React.useMemo(() => figurePool(kingdom), [kingdom]);
  const result = validateArmy(kingdom, { points, units });
  const agg = armyStats(units);
  // Only a player tracking their painted figures wants to hear about shortfalls.
  const short = settings.useCollection ? shortfalls(collection, units) : [];
  const over = result.points > points;
  const battle = value.battleType ? battleTypeById.get(value.battleType) : null;

  const setUnits = (next) => onChange({ ...value, units: next });
  const patchUnit = (uid, next) => setUnits(units.map((u) => (u.uid === uid ? next : u)));

  // Figures on the table, characters included (p81).
  const figureCount = units.reduce((s, u) => s + (u.joinedTo ? 0 : unitProfile(u, units)?.bodies ?? 0), 0);

  const add = (r) => {
    const crew = crewOf(r.fig);
    const max = Math.min(sizeRule(r.fig).max, r.entry.maxFigures ?? sizeRule(r.fig).max);
    setUnits([...units, {
      uid: crypto.randomUUID(),
      figureId: r.fig.id,
      count: isArtillery(r.fig) ? (crew ?? 1) : max,
      level: r.entry.levels ? r.entry.levels[0] : undefined,
    }]);
  };

  if (!ready) {
    return <Shell {...shell} title={value.name || "Untitled"} content={<Section paddingBlock={GAP.section} />} />;
  }

  return (
    <Shell
      {...shell}
      title={value.name || "Untitled"}
      meta={(
        <HStack gap={GAP.item} align="center" wrap="wrap">
          {battle && <Token label={battle.name} color="pink" />}
          <NumberInput label="Points" size="lg" width={130} value={points} min={0} step={50}
                       onChange={(p) => onChange({ ...value, points: p || 0 })} />
          <Text type="large" color={over ? "error" : undefined}>{result.points}/{points}</Text>
        </HStack>
      )}
      detailTitle="Army Roster"
      detail={(
        <VStack gap={GAP.group}>
          <HStack justify="center" className="om-plate"><Text type="label">Army Roster</Text></HStack>
          <ProgressBar label="Points Value" isLabelHidden
                       value={Math.min(result.points, points)} max={points || 1}
                       variant={over ? "error" : "accent"} />
          <MetadataList>
            <MetadataListItem label="Points">{result.points} of {points}</MetadataListItem>
            <MetadataListItem label="Units">{units.length}</MetadataListItem>
            <MetadataListItem label="Figures">{figureCount}</MetadataListItem>
            <MetadataListItem label="Health">{agg.health}</MetadataListItem>
            {agg.command > 0 && (
              <MetadataListItem label="Command">{agg.command}, {agg.extraActivations} extra activations</MetadataListItem>
            )}
            {agg.champions > 0 && <MetadataListItem label="Champions">{agg.champions}</MetadataListItem>}
            {agg.shootingDice > 0 && <MetadataListItem label="Shooting dice">{agg.shootingDice}</MetadataListItem>}
            {agg.ranges.length > 0 && (
              <MetadataListItem label="Ranges">{agg.ranges.map((r) => `${r}"`).join(", ")}</MetadataListItem>
            )}
            {Object.keys(agg.activation).length > 0 && (
              <MetadataListItem label="Activation">
                {Object.entries(agg.activation).map(([n, c]) => `${c} on ${n}+`).join(", ")}
              </MetadataListItem>
            )}
            {agg.casters.length > 0 && (
              <MetadataListItem label="Spells">{agg.spellsKnown} known across {agg.casters.length}</MetadataListItem>
            )}
          </MetadataList>
          {(result.errors.length > 0 || result.warnings.length > 0 || short.length > 0) && (
            <VStack gap={GAP.tight} className="om-callout">
              {result.errors.map((e) => <Text key={e}>{e}</Text>)}
              {result.warnings.map((w) => <Text key={w}>{w}</Text>)}
              {short.map((x) => <Text key={x.figureId}>{`${x.name}: own ${x.have} of ${x.need}`}</Text>)}
            </VStack>
          )}
          {battle && <Text type="supporting">{battle.text}</Text>}
        </VStack>
      )}
      content={(
        <VStack gap={GAP.group} className="om-page">
          {units.map((u) => (
            <UnitCard key={u.uid} kingdom={kingdom} unit={u} pool={pool} units={units}
                      onChange={(next) => patchUnit(u.uid, next)}
                      onJoin={(hostUid) => setUnits(units.map((x) => {
                        if (x.uid === u.uid) return { ...x, joinedTo: hostUid };
                        // Joining fills a slot in the host, so trim it to fit (p81).
                        if (hostUid && x.uid === hostUid) {
                          const max = unitProfile(x, [])?.max ?? 1;
                          return { ...x, count: Math.min(x.count ?? 1, max - 1) };
                        }
                        return x;
                      }))}
                      onRemove={() => setUnits(units.filter((x) => x.uid !== u.uid)
                        .map((x) => (x.joinedTo === u.uid ? { ...x, joinedTo: null } : x)))}
                      onOpenFigure={setOpenFigure} />
          ))}
          <div className="om-cta-dock">
            <Button label="Add Units" variant="primary" onClick={() => setAdding(true)}
                    icon={<Ico name="plus" size={20} />} />
          </div>
          <AddUnits isOpen={adding} onOpenChange={setAdding} pool={pool} units={units}
                    collection={collection} onAdd={add} onOpenFigure={setOpenFigure} />
          {openFigure && (
            <FigureCard figureId={openFigure} isOpen onOpenChange={(o) => !o && setOpenFigure(null)}
                        owns={(name) => (kingdom.territories ?? []).some((t) => t.name === name)} />
          )}
        </VStack>
      )}
    />
  );
}
