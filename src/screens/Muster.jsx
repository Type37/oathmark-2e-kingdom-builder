import React from "react";
import {
  Layout, LayoutHeader, LayoutContent, LayoutFooter, LayoutPanel,
  Section, List, ListItem, VStack, HStack, Text, Heading, Button,
  Badge, NumberInput, ProgressBar, Banner, TabList, Tab, Divider, useMediaQuery,
} from "@astryxdesign/core";

import { figurePool, figureById } from "../rules/kingdom.mjs";
import Ico from "../components/Ico.jsx";
import { FRAME, PANEL, GAP, DENSITY, BREAK } from "../layout.mjs";
import StatLine, { Derived, ArmySummary, RosterRow, Attributes } from "../components/StatLine.jsx";
import { unitStats, armyStats, STAT_KEYS, variantFor } from "../rules/stats.mjs";
import { shortfalls, owned } from "../rules/collection.mjs";
import Upgrades from "../components/Upgrades.jsx";
import FigureTable from "../components/FigureTable.jsx";
import FigureCard from "../components/FigureCard.jsx";
import { upgradeCost, applyUpgrades } from "../rules/upgrades.mjs";
import { validateArmy, unitCost } from "../rules/muster.mjs";

const ROLE_ORDER = ["character", "infantry", "cavalry", "monster", "artillery"];

function roleOf(fig) {
  const v = fig.variants[0];
  const base = v.base;
  if (v.attributes.includes("Artillery") || /catapult|ballista/i.test(fig.name)) return "artillery";
  if (v.attributes.some((a) => /^(Command|Champion|Spellcaster)/.test(a)) || v.attributes.includes("Magic Items"))
    return "character";
  if (v.attributes.includes("Monster")) return "monster";
  if (base === "25 x 50") return "cavalry";
  if (base === "50 x 50" || base === "50 x 100") return "monster";
  return "infantry";
}

const ROLE_LABEL = {
  character: "Characters", infantry: "Infantry", cavalry: "Cavalry",
  monster: "Monsters", artillery: "Artillery",
};

const variantOf = (fig) => fig.variants[0];

export default function Muster({ kingdom, value, onChange }) {
  const points = value?.points ?? 1000;
  const units = value?.units ?? [];
  const setPoints = (p) => onChange({ ...value, points: p || 0 });
  const setUnits = (fn) =>
    onChange({ ...value, units: typeof fn === "function" ? fn(units) : fn });
  const [role, setRole] = React.useState("infantry");
  const [openFigure, setOpenFigure] = React.useState(null);
  const isNarrow = useMediaQuery(BREAK.panel);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const pool = React.useMemo(() => figurePool(kingdom), [kingdom]);
  const army = { points, units };
  const result = validateArmy(kingdom, army);
  const agg = armyStats(units);
  const collection = kingdom.collection ?? {};
  const short = shortfalls(collection, units);

  const grouped = React.useMemo(() => {
    const g = {};
    for (const entry of pool.values()) {
      const fig = figureById.get(entry.figureId);
      if (!fig) continue;
      const r = roleOf(fig);
      (g[r] ??= []).push({ entry, fig });
    }
    for (const list of Object.values(g))
      list.sort((a, b) => a.fig.variants[0].pts - b.fig.variants[0].pts);
    return g;
  }, [pool]);

  const roles = ROLE_ORDER.filter((r) => grouped[r]?.length);
  const activeRole = roles.includes(role) ? role : roles[0];

  function addUnit(fig, entry) {
    const v = fig.variants[0];
    setUnits((prev) => [
      ...prev,
      {
        uid: crypto.randomUUID(),
        figureId: fig.id,
        count: Math.min(fig.unitMax, entry.maxFigures ?? fig.unitMax),
        level: entry.levels ? entry.levels[0] : undefined,
      },
    ]);
  }

  function setCount(uid, count) {
    if (!Number.isFinite(count) || count < 1) {
      setUnits((prev) => prev.filter((u) => u.uid !== uid));
      return;
    }
    setUnits((prev) => prev.map((u) => (u.uid === uid ? { ...u, count } : u)));
  }

  function removeUnit(uid) {
    setUnits((prev) => prev.filter((u) => u.uid !== uid));
  }

  const overBudget = result.points > points;

  return (
    <>
    <Layout
      padding={FRAME.padding}
      defaultHasDividers
      height="auto"
      header={
        <LayoutHeader>
          <VStack gap={2}>
            <HStack gap={4} align="center" justify="between">
              <HStack gap={3} align="center">
                <Heading level={1}>Muster</Heading>
                {kingdom.name && <Text color="secondary">{kingdom.name}</Text>}
              </HStack>
              <Text type="large" color={overBudget ? "error" : undefined}>
                {result.points}/{points}
              </Text>
            </HStack>
            <ProgressBar
              label="Points Value"
              value={Math.min(result.points, points)}
              max={points || 1}
              variant={overBudget ? "error" : result.remaining <= points * 0.05 ? "warning" : "accent"}
              isLabelHidden
            />
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={0}>
            <Section paddingBlockEnd={0}>
              <TabList value={activeRole} onChange={setRole} hasDivider isFullBleed>
                {roles.map((r) => (
                  <Tab key={r} value={r} label={ROLE_LABEL[r]} />
                ))}
              </TabList>
            </Section>

            <Section padding={0}>
              <FigureTable
                rows={(grouped[activeRole] ?? []).map(({ entry, fig }) => {
                  const v = variantOf(fig);
                  const taken = units.filter((u) => u.figureId === fig.id).length;
                  const unitCap = entry.maxUnits ?? Math.min(4, entry.maxFigures ?? 4);
                  return {
                    figureId: fig.id,
                    name: fig.name,
                    ...Object.fromEntries(STAT_KEYS.map((k) => [k, v[k]])),
                    taken,
                    atCap: taken >= unitCap,
                    cap: [
                      entry.levels ? `Levels ${entry.levels[0]}\u2013${entry.levels.at(-1)}` : null,
                      entry.maxUnits ? `${unitCap} units` : `max ${entry.maxFigures}`,
                      owned(collection, fig.id) ? `own ${owned(collection, fig.id)}` : null,
                    ].filter(Boolean).join(", "),
                    entry,
                    fig,
                  };
                })}
                onOpen={setOpenFigure}
                onAdd={(r) => addUnit(r.fig, r.entry)}
              />
            </Section>
          </VStack>
        </LayoutContent>
      }
      end={
        <LayoutPanel width={PANEL.roster} hasDivider label="Army roster" className="om-sticky">
          <VStack gap={GAP.group}>
            <NumberInput
              label="Points Value"
              value={points}
              onChange={setPoints}
              min={0}
              step={50}
              size="sm"
            />
            {units.length > 0 && (
              <VStack gap={0}>
                {units.map((u, i) => {
                  const fig = figureById.get(u.figureId);
                  return (
                    <React.Fragment key={u.uid}>
                      {i > 0 && <Divider />}
                      <RosterRow
                        name={fig.name}
                        pts={unitCost(u)}
                        level={u.level}
                        s={unitStats(u)}
                        attributes={<Attributes variant={applyUpgrades(unitStats(u).variant, u.upgrades ?? [])} />}
                        upgrades={
                          <Upgrades
                            kingdom={kingdom}
                            figureId={u.figureId}
                            level={u.level}
                            chosen={u.upgrades ?? []}
                            onChange={(ups) =>
                              setUnits((prev) =>
                                prev.map((x) =>
                                  x.uid === u.uid
                                    ? {
                                        ...x,
                                        upgrades: ups.map((g) => ({
                                          name: g.name,
                                          pts: upgradeCost(g, u.level),
                                          changes: g.changes,
                                          base: g.base,
                                          adds: g.adds,
                                        })),
                                      }
                                    : x,
                                ),
                              )
                            }
                          />
                        }
                        controls={
                          fig.unitMax > 1 ? (
                            <NumberInput
                              label={`${fig.name} figures`}
                              isLabelHidden
                              value={u.count}
                              onChange={(n) => setCount(u.uid, n)}
                              min={0}
                              max={fig.unitMax}
                              size="sm"
                            />
                          ) : (
                            <Button label="Remove" size="sm" variant="ghost" isIconOnly
                                    icon={<Ico name="minus" />}
                                    onClick={() => removeUnit(u.uid)} />
                          )
                        }
                      />
                    </React.Fragment>
                  );
                })}
              </VStack>
            )}

            {units.length > 0 && <ArmySummary a={agg} />}

            {result.errors.length > 0 && (
              <VStack gap={2}>
                {result.errors.slice(0, 5).map((e) => (
                  <Banner key={e} status="error" title={e} />
                ))}
              </VStack>
            )}
            {short.length > 0 && (
              <VStack gap={2}>
                {short.slice(0, 5).map((x) => (
                  <Banner
                    key={x.figureId}
                    status="info"
                    title={`${x.name}: own ${x.have} of ${x.need}`}
                  />
                ))}
              </VStack>
            )}

            {result.warnings.length > 0 && (
              <VStack gap={2}>
                {result.warnings.slice(0, 3).map((w) => (
                  <Banner key={w} status="warning" title={w} />
                ))}
              </VStack>
            )}
          </VStack>
        </LayoutPanel>
      }
      footer={
        <LayoutFooter>
          <Text color="secondary">
            {units.length} {units.length === 1 ? "unit" : "units"}, {units.reduce((s, u) => s + (u.count ?? 1), 0)} figures
          </Text>
        </LayoutFooter>
      }
    />
    {openFigure && (
      <FigureCard
        figureId={openFigure}
        isOpen={Boolean(openFigure)}
        onOpenChange={(open) => !open && setOpenFigure(null)}
      />
    )}
    </>
  );
}
