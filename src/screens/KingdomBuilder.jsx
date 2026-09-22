import React from "react";
import {
  Layout, LayoutHeader, LayoutContent, LayoutFooter, LayoutPanel,
  Stepper, Step, Section, List, ListItem, VStack, HStack,
  Text, Heading, Button, Token, Badge, Divider, TextInput, useMediaQuery,
  Dialog, DialogHeader,
} from "@astryxdesign/core";

import {
  LEVELS, CAPITAL_LISTS, REGION_SIZES, allTerritories, canPlace,
  validateKingdom, territory, grantList,
} from "../rules/kingdom.mjs";
import RegionMap from "../components/RegionMap.jsx";
import Ico from "../components/Ico.jsx";
import { FRAME, PANEL, GAP, DENSITY, BREAK } from "../layout.mjs";
import Chronicle from "./Chronicle.jsx";
import FigureCard from "../components/FigureCard.jsx";
import { EXAMPLE_KINGDOMS, loadExample } from "../rules/examples.mjs";

// Labels follow the Kingdom Starting Regions table, p17.
const EXPERIENCE = [
  { id: "beginner", label: "Beginner", regions: "1 & 2" },
  { id: "moderate", label: "Moderate", regions: "1, 2 & 3" },
  { id: "expert", label: "Expert", regions: "1, 2, 3 & 4" },
];

const LEVEL_SLOTS = {
  beginner: LEVELS.beginner.reduce((n, r) => n + REGION_SIZES[r], 0),
  moderate: LEVELS.moderate.reduce((n, r) => n + REGION_SIZES[r], 0),
  expert: LEVELS.expert.reduce((n, r) => n + REGION_SIZES[r], 0),
};

const LIST_LABEL = {
  dwarf: "Dwarf", elf: "Elf", goblin: "Goblin", human: "Human",
  orc: "Orc", necropolis: "Necropolis", unaligned: "Unaligned",
};

// Resume where the saved kingdom left off: the first region still short of its
// territory count, or the last step when it is complete.
function resumeStep({ level, capitalList, territories = [] }) {
  if (!level) return 0;
  if (!capitalList) return 1;
  const regions = LEVELS[level].filter((r) => r > 1);
  for (const [i, r] of regions.entries()) {
    if (territories.filter((p) => p.region === r).length < REGION_SIZES[r]) return i + 2;
  }
  return regions.length + 1;
}

export default function KingdomBuilder({ value, onChange, onDone }) {
  const { name, level, capitalList, territories: picks } = value;
  const [step, setStep] = React.useState(() => resumeStep(value));
  const [hoverKey, setHoverKey] = React.useState(null);
  const [previewLevel, setPreviewLevel] = React.useState(null);
  const [openFigure, setOpenFigure] = React.useState(null);
  const isNarrow = useMediaQuery(BREAK.panel);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  // The compact Stepper grows its own Previous control; don't double it up.
  const patch = (next) => onChange({ ...value, ...next });

  const regions = level ? LEVELS[level] : [1, 2];
  // Step 1 has no kingdom yet, so the sheet previews the hovered level instead.
  const shownRegions = previewLevel ? LEVELS[previewLevel] : regions;
  const steps = React.useMemo(
    () => [
      { key: "experience", label: "Experience" },
      { key: "capital", label: "Capital" },
      ...regions.filter((r) => r > 1).map((r) => ({ key: `r${r}`, label: `Region ${r}` })),
      { key: "chronicle", label: "Chronicle" },
    ],
    [regions.join()],
  );

  const current = steps[Math.min(step, steps.length - 1)];
  const activeRegion = current.key.startsWith("r")
    ? Number(current.key.slice(1))
    : current.key === "capital"
      ? 1
      : null;

  const kingdom = { ...value, level: level ?? "beginner" };
  const result = level && capitalList ? validateKingdom(kingdom) : null;

  const regionPicks = activeRegion ? picks.filter((p) => p.region === activeRegion) : [];
  const regionFull = activeRegion ? regionPicks.length >= REGION_SIZES[activeRegion] : false;
  const isLast = current.key === "chronicle";

  const candidates = React.useMemo(() => {
    if (!activeRegion || activeRegion === 1 || !capitalList) return [];
    return allTerritories()
      .map((t) => ({ t, res: canPlace({ capitalList, region: activeRegion, list: t.list, name: t.name }) }))
      .sort(
        (a, b) =>
          Number(b.res.ok) - Number(a.res.ok) ||
          (a.t.list === capitalList ? -1 : 0) - (b.t.list === capitalList ? -1 : 0) ||
          a.t.rarity - b.t.rarity ||
          a.t.name.localeCompare(b.t.name),
      );
  }, [activeRegion, capitalList]);

  function addPick(entry) {
    const next = [...picks, entry];
    patch({ territories: next });
    const filled = next.filter((p) => p.region === entry.region).length >= REGION_SIZES[entry.region];
    if (filled) {
      const i = steps.findIndex((s) => s.key === `r${entry.region}`);
      if (i >= 0 && i < steps.length - 1) setStep(i + 1);
    }
  }

  const canAdvance =
    current.key === "experience" ? Boolean(level)
    : current.key === "capital" ? Boolean(capitalList)
    : current.key === "chronicle" ? true
    : regionFull;


  const sheet = (
        <LayoutPanel width={PANEL.kingdom} hasDivider label="Kingdom Sheet" className="om-sticky">
          <VStack gap={GAP.group}>
            {picks.length > 0 && (
              <List hasDividers density={DENSITY.dense}>
                {picks.map((p, i) => (
                  <ListItem
                    key={`${p.region}-${p.name}-${i}`}
                    label={p.name}
                    isSelected={hoverKey === `${p.region}-${p.name}-${i}`}
                    description={`Region ${p.region}: ${LIST_LABEL[p.list]}`}
                    startContent={<Token label={String(territory(p.list, p.name)?.rarity ?? "")} size="sm" />}
                  />
                ))}
              </List>
            )}
            <RegionMap
              regions={shownRegions}
              picks={picks}
              activeRegion={activeRegion}
              hoverKey={hoverKey}
              onSlotHover={setHoverKey}
              onSlotClick={(region) => {
                const i = steps.findIndex((s) => s.key === `r${region}`);
                if (i >= 0) setStep(i);
              }}
            />

          </VStack>
        </LayoutPanel>
  );

  return (
    <>
    <Layout
      padding={FRAME.padding}
      defaultHasDividers
      height="auto"
      contentWidth={FRAME.contentWidth}
      header={
        <LayoutHeader>
          <HStack gap={GAP.group} align="center" justify="between">
            <HStack gap={GAP.item} align="center">
              <Heading level={1}>Kingdom</Heading>
              <TextInput
                value={name}
                onChange={(e) => patch({ name: e.target?.value ?? e })}
                size="sm"
                label="Kingdom"
                isLabelHidden
              />
            </HStack>
            {result && (
              <Text color="secondary">
                {result.placed}/{result.slots}
              </Text>
            )}
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={0}>
            <Section paddingBlockEnd={3}>
              <Stepper activeStep={Math.min(step, steps.length - 1)} onStepClick={setStep} density="compact">
                {steps.map((s, i) => (
                  <Step key={s.key} step={i} label={s.label} />
                ))}
              </Stepper>
            </Section>
            <Divider />

            {current.key === "experience" && (
              <Section padding={0}>
                <List
                  hasDividers
                  density={DENSITY.choice}
                  header={
                    <Section paddingBlockEnd={0} paddingInline={3}>
                      <HStack gap={2} wrap="wrap">
                        {EXAMPLE_KINGDOMS.map((e) => (
                          <Button
                            key={e.id}
                            label={e.name}
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              onChange(loadExample(e.id));
                              setStep(1);
                            }}
                          />
                        ))}
                      </HStack>
                    </Section>
                  }
                >
                  {EXPERIENCE.map((r) => (
                    <ListItem
                      key={r.id}
                      label={r.label}
                      description={`Regions ${r.regions}, ${LEVEL_SLOTS[r.id]} territories`}
                      isSelected={level === r.id || previewLevel === r.id}
                      onClick={() => {
                        patch({ level: r.id, capitalList: null, territories: [] });
                        setPreviewLevel(null);
                        setStep(1);
                      }}
                      onMouseEnter={() => setPreviewLevel(r.id)}
                      onMouseLeave={() => setPreviewLevel(null)}
                    />
                  ))}
                </List>
              </Section>
            )}

            {current.key === "capital" && (
              <Section padding={0}>
                <List hasDividers density={DENSITY.choice}>
                  {CAPITAL_LISTS.map((list) => {
                    const cap = allTerritories().find((t) => t.list === list && t.capital);
                    const count = allTerritories().filter((t) => t.list === list).length;
                    return (
                      <ListItem
                        key={list}
                        label={cap.name}
                        description={`${count} territories`}
                        isSelected={capitalList === list}
                        onClick={() => {
                          patch({ capitalList: list, territories: [{ region: 1, list, name: cap.name }] });
                          setStep(2);
                        }}
                      />
                    );
                  })}
                </List>
              </Section>
            )}

            {current.key === "chronicle" && (
              <Section paddingBlock={4}>
                <Chronicle
                  entries={value.chronicle ?? []}
                  ruler={value.ruler}
                  onChange={(chronicle) => patch({ chronicle })}
                  onRulerChange={(ruler) => patch({ ruler })}
                />
              </Section>
            )}

            {activeRegion > 1 && (
              <Section padding={0}>
                <List
                  hasDividers
                  density={DENSITY.choice}
                  header={
                    <Section paddingBlockEnd={0} paddingInline={3}>
                      <HStack gap={3} align="center" justify="between">
                        <Heading level={2}>Region {activeRegion}</Heading>
                        <Text color="secondary">
                          {regionPicks.length}/{REGION_SIZES[activeRegion]}
                        </Text>
                      </HStack>
                    </Section>
                  }
                >
                  {candidates.map(({ t, res }) => {
                    const mine = picks
                      .map((p, i) => ({ p, i }))
                      .filter(({ p }) => p.region === activeRegion && p.list === t.list && p.name === t.name);
                    const taken = mine.length;
                    const canAdd = res.ok && !regionFull;
                    return (
                      <ListItem
                        key={`${t.list}/${t.name}`}
                        label={t.name}
                        description={
                          res.ok ? (
                            <VStack gap={1}>
                              <Text type="supporting">{LIST_LABEL[t.list]}</Text>
                              <HStack gap={1} wrap="wrap">
                                {grantList(t.list, t.name).map((g) => (
                                  <Button
                                    key={g.figureId}
                                    label={g.label}
                                    size="sm"
                                    variant="secondary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenFigure(g.figureId);
                                    }}
                                  />
                                ))}
                              </HStack>
                            </VStack>
                          ) : (
                            res.reason
                          )
                        }
                        isDisabled={!res.ok}
                        startContent={
                          <HStack gap={2} align="center">
                            <Token label={String(t.rarity)} size="sm" />
                            {canAdd && (
                              <Button
                                label="Add"
                                size="sm"
                                variant="primary"
                                icon={<Ico name="plus" />}
                                onClick={() =>
                                  addPick({ region: activeRegion, list: t.list, name: t.name })
                                }
                              />
                            )}
                          </HStack>
                        }
                        endContent={
                          taken ? (
                            <HStack gap={1} align="center">
                              <Badge label={String(taken)} />
                              <Button
                                label="Remove"
                                size="sm"
                                variant="ghost"
                                isIconOnly
                                icon={<Ico name="minus" />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  patch({ territories: picks.filter((_, j) => j !== mine.at(-1).i) });
                                }}
                              />
                            </HStack>
                          ) : undefined
                        }
                      />
                    );
                  })}
                </List>
              </Section>
            )}
          </VStack>
        </LayoutContent>
      }
      end={isNarrow ? undefined : sheet}
      footer={
        <LayoutFooter>
          <HStack gap={2} justify="between">
            {isNarrow && (
              <Button
                label="Sheet"
                size="sm"
                variant="secondary"
                onClick={() => setSheetOpen(true)}
              />
            )}
            {!isNarrow && (
              <Button
                label="Back"
                variant="ghost"
                isIconOnly
                icon={<Ico name="angle-left" />}
                isDisabled={step === 0}
                onClick={() => setStep(step - 1)}
              />
            )}
            {isLast && (
              <Button
                label="Muster"
                variant="primary"
                icon={<Ico name="angle-right" />}
                isDisabled={!canAdvance}
                onClick={() => onDone?.()}
              />
            )}
          </HStack>
        </LayoutFooter>
      }
    />
    {isNarrow && (
      <Dialog
        isOpen={sheetOpen}
        onOpenChange={setSheetOpen}
        width={420}
        header={<DialogHeader title="Kingdom Sheet" />}
      >
        {sheet}
      </Dialog>
    )}
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
