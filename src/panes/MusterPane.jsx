import React from "react";
import {
  VStack, HStack, Text, Section, TabList, Tab, NumberInput,
  ProgressBar, Button,
} from "@astryxdesign/core";
import FigureTable from "../components/FigureTable.jsx";
import FigureCard from "../components/FigureCard.jsx";
import Upgrades from "../components/Upgrades.jsx";
import { Derived, Attributes } from "../components/StatLine.jsx";
import Ico from "../components/Ico.jsx";
import Shell from "../Shell.jsx";
import { figurePool, figureById } from "../rules/kingdom.mjs";
import { validateArmy, unitCost } from "../rules/muster.mjs";
import { unitStats, armyStats, STAT_KEYS } from "../rules/stats.mjs";
import { shortfalls, owned } from "../rules/collection.mjs";
import { upgradeCost, applyUpgrades } from "../rules/upgrades.mjs";
import { GAP } from "../layout.mjs";

const ROLE_ORDER = ["character", "infantry", "cavalry", "monster", "artillery"];
const ROLE_LABEL = {
  character: "Characters", infantry: "Infantry", cavalry: "Cavalry",
  monster: "Monsters", artillery: "Artillery",
};

function roleOf(fig) {
  const v = fig.variants[0];
  if (v.attributes.includes("Artillery") || /catapult|ballista/i.test(fig.name)) return "artillery";
  if (v.attributes.some((a) => /^(Command|Champion|Spellcaster)/.test(a)) || v.attributes.includes("Magic Items"))
    return "character";
  if (v.attributes.includes("Monster")) return "monster";
  if (v.base === "25 x 50") return "cavalry";
  if (v.base === "50 x 50" || v.base === "50 x 100") return "monster";
  return "infantry";
}

export default function MusterPane({ kingdom, value, onChange, ready, shell }) {
  const [role, setRole] = React.useState("infantry");
  const [openFigure, setOpenFigure] = React.useState(null);
  const points = value.points ?? 1000;
  const units = value.units ?? [];
  const collection = kingdom.collection ?? {};

  const pool = React.useMemo(() => figurePool(kingdom), [kingdom]);
  const result = validateArmy(kingdom, { points, units });
  const agg = armyStats(units);
  const short = shortfalls(collection, units);
  const over = result.points > points;

  const grouped = React.useMemo(() => {
    const g = {};
    for (const entry of pool.values()) {
      const fig = figureById.get(entry.figureId);
      if (!fig) continue;
      (g[roleOf(fig)] ??= []).push({ entry, fig });
    }
    for (const l of Object.values(g)) l.sort((a, b) => a.fig.variants[0].pts - b.fig.variants[0].pts);
    return g;
  }, [pool]);

  const roles = ROLE_ORDER.filter((r) => grouped[r]?.length);
  const activeRole = roles.includes(role) ? role : roles[0];
  const setUnits = (next) => onChange({ ...value, units: next });

  if (!ready) {
    return (
      <Shell
        {...shell}
        title="Muster"
        content={
          <Section paddingBlock={GAP.section}>
          </Section>
        }
      />
    );
  }

  const rows = (grouped[activeRole] ?? []).map(({ entry, fig }) => {
    const v = fig.variants[0];
    const taken = units.filter((u) => u.figureId === fig.id).length;
    const unitCap = entry.maxUnits ?? Math.min(4, entry.maxFigures ?? 4);
    return {
      figureId: fig.id,
      name: fig.name,
      ...Object.fromEntries(STAT_KEYS.map((k) => [k, v[k]])),
      taken,
      atCap: taken >= unitCap,
      cap: [
        entry.levels ? `Levels ${entry.levels[0]}–${entry.levels.at(-1)}` : null,
        entry.maxUnits ? `${unitCap} units` : `max ${entry.maxFigures}`,
        owned(collection, fig.id) ? `own ${owned(collection, fig.id)}` : null,
      ].filter(Boolean).join(", "),
      entry, fig,
    };
  });

  return (
    <Shell
      {...shell}
      title="Muster"
      meta={(
      <HStack gap={GAP.item} align="center">
        <NumberInput label="Points" value={points} min={0} step={50} size="sm"
                     onChange={(p) => onChange({ ...value, points: p || 0 })} />
        <Text type="large" color={over ? "error" : undefined}>
          {result.points}/{points}
        </Text>
      </HStack>
    )}
      detailTitle="Army Roster"
      detail={(
      <VStack gap={GAP.group}>
        <HStack justify="center" className="om-plate"><Text type="label">Army Roster</Text></HStack>
        <ProgressBar label="Points Value" isLabelHidden
                     value={Math.min(result.points, points)} max={points || 1}
                     variant={over ? "error" : "accent"} />
        {units.map((u, i) => {
          const fig = figureById.get(u.figureId);
          const st = unitStats(u);
          return (
            <VStack key={u.uid} gap={GAP.item}>
              <HStack gap={GAP.item} align="center" justify="between" wrap="wrap">
                <Text type="large">{fig.name}</Text>
                <HStack gap={1} align="center">
                  {fig.unitMax > 1 && (
                    <NumberInput label={`${fig.name} figures`} isLabelHidden size="sm"
                                 value={u.count} min={0} max={fig.unitMax}
                                 onChange={(n) =>
                                   setUnits(!n || n < 1
                                     ? units.filter((x) => x.uid !== u.uid)
                                     : units.map((x) => (x.uid === u.uid ? { ...x, count: n } : x)))} />
                  )}
                  <Button label="Remove" size="sm" variant="ghost" isIconOnly
                          icon={<Ico name="minus" />}
                          onClick={() => setUnits(units.filter((x) => x.uid !== u.uid))} />
                </HStack>
              </HStack>
              <Text type="label">{unitCost(u)}pts</Text>
              <Derived s={st} />
              <Attributes variant={applyUpgrades(st.variant, u.upgrades ?? [])} />
              <Upgrades kingdom={kingdom} figureId={u.figureId} level={u.level}
                        chosen={u.upgrades ?? []}
                        onChange={(ups) =>
                          setUnits(units.map((x) => x.uid === u.uid
                            ? { ...x, upgrades: ups.map((g) => ({
                                name: g.name, pts: upgradeCost(g, u.level),
                                changes: g.changes, base: g.base, adds: g.adds })) }
                            : x))} />
            </VStack>
          );
        })}
        {(result.errors.length > 0 || short.length > 0) && (
          <VStack gap={GAP.tight} className="om-callout">
            {result.errors.map((e) => <Text key={e}>{e}</Text>)}
            {short.map((x) => <Text key={x.figureId}>{`${x.name}: own ${x.have} of ${x.need}`}</Text>)}
          </VStack>
        )}
        {units.length > 0 && (
          <VStack gap={GAP.tight}>
            <HStack gap={GAP.group} justify="between">
              <Text type="label">Activation</Text>
              <Text type="large">
                {Object.entries(agg.activation).map(([n, c]) => `${c} on ${n}`).join(", ")}
              </Text>
            </HStack>
            {agg.command > 0 && (
              <HStack gap={GAP.group} justify="between">
                <Text type="label">Command</Text>
                <Text type="large">{agg.command}, giving {agg.extraActivations} extra</Text>
              </HStack>
            )}
            <HStack gap={GAP.group} justify="between">
              <Text type="label">Health</Text>
              <Text type="large">{agg.health}</Text>
            </HStack>
          </VStack>
        )}
      </VStack>
      )}
      content={(
      <VStack gap={0}>
        <Section paddingBlockEnd={0}>
          <TabList value={activeRole} onChange={setRole} isFullBleed>
            {roles.map((r) => <Tab key={r} value={r} label={ROLE_LABEL[r]} />)}
          </TabList>
        </Section>
        <Section padding={0}>
          <FigureTable
            rows={rows}
            onOpen={setOpenFigure}
            onAdd={(r) =>
              setUnits([...units, {
                uid: crypto.randomUUID(),
                figureId: r.fig.id,
                count: Math.min(r.fig.unitMax, r.entry.maxFigures ?? r.fig.unitMax),
                level: r.entry.levels ? r.entry.levels[0] : undefined,
              }])}
          />
        </Section>
        {openFigure && (
          <FigureCard figureId={openFigure} isOpen onOpenChange={(o) => !o && setOpenFigure(null)} />
        )}
      </VStack>
      )}
    />
  );
}
