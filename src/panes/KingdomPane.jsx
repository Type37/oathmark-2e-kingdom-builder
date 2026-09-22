import React from "react";
import {
  VStack, HStack, Text, Heading, Button, Section, Divider, List, ListItem,
  Token, Badge, Dialog, DialogHeader, Selector, TextInput,
} from "@astryxdesign/core";
import Ico from "../components/Ico.jsx";
import Shell from "../Shell.jsx";
import RegionMap from "../components/RegionMap.jsx";
import FigureCard from "../components/FigureCard.jsx";
import Chronicle from "../screens/Chronicle.jsx";
import { GAP, DENSITY } from "../layout.mjs";
import {
  LEVELS, REGION_SIZES, CAPITAL_LISTS, allTerritories, canPlace,
  validateKingdom, territory, grantList,
} from "../rules/kingdom.mjs";
import { EXAMPLE_KINGDOMS, loadExample } from "../rules/examples.mjs";

const LIST_LABEL = {
  dwarf: "Dwarf", elf: "Elf", goblin: "Goblin", human: "Human",
  orc: "Orc", necropolis: "Necropolis", unaligned: "Unaligned",
};

// Every region is visible at once. No stepper, so nothing advances underfoot.
export default function KingdomPane({ value, onChange, shell }) {
  const { level, capitalList, territories: picks } = value;
  const [picking, setPicking] = React.useState(null);
  const [openFigure, setOpenFigure] = React.useState(null);
  const patch = (next) => onChange({ ...value, ...next });
  const regions = LEVELS[level ?? "moderate"];
  const result = capitalList ? validateKingdom({ ...value, level: level ?? "moderate" }) : null;

  const candidates = React.useMemo(() => {
    if (!picking || !capitalList) return [];
    return allTerritories()
      .map((t) => ({ t, res: canPlace({ capitalList, region: picking, list: t.list, name: t.name }) }))
      .filter((x) => x.res.ok)
      .sort((a, b) =>
        (a.t.list === capitalList ? -1 : 0) - (b.t.list === capitalList ? -1 : 0) ||
        a.t.rarity - b.t.rarity || a.t.name.localeCompare(b.t.name));
  }, [picking, capitalList]);

  const content = (
    <VStack gap={GAP.section}>
      {!capitalList && (
        <Section padding={0}>
          <VStack gap={GAP.group}>
            <HStack gap={GAP.item} align="end" wrap="wrap">
              <Selector
                label="Experience"
                value={level ?? "moderate"}
                onChange={(l) => patch({ level: l, capitalList: null, territories: [] })}
                options={[
                  { value: "beginner", label: "Beginner, Regions 1 & 2" },
                  { value: "moderate", label: "Moderate, Regions 1, 2 & 3" },
                  { value: "expert", label: "Expert, Regions 1, 2, 3 & 4" },
                ]}
              />
              {EXAMPLE_KINGDOMS.map((e) => (
                <Button key={e.id} label={e.name} size="sm" variant="secondary"
                        onClick={() => onChange(loadExample(e.id))} />
              ))}
            </HStack>

            <VStack gap={GAP.tight}>
              <Text type="label">Capital</Text>
              <List hasDividers density={DENSITY.choice}>
                {CAPITAL_LISTS.map((list) => {
                  const cap = allTerritories().find((t) => t.list === list && t.capital);
                  const count = allTerritories().filter((t) => t.list === list).length;
                  return (
                    <ListItem key={list} label={cap.name} description={`${count} territories`}
                      onClick={() => patch({ capitalList: list, territories: [{ region: 1, list, name: cap.name }] })} />
                  );
                })}
              </List>
            </VStack>
          </VStack>
        </Section>
      )}

      {capitalList && regions.map((r) => {
        const mine = picks.map((p, i) => ({ p, i })).filter(({ p }) => p.region === r);
        const full = mine.length >= REGION_SIZES[r];
        return (
          <VStack key={r} gap={0}>
            <HStack gap={GAP.item} align="center" justify="between" className="om-band">
              <Text type="label">Region {r}</Text>
              <Text type="label">{mine.length} of {REGION_SIZES[r]}</Text>
            </HStack>
            <List hasDividers density={DENSITY.data}>
              {mine.map(({ p, i }) => (
                <ListItem
                  key={`${p.name}-${i}`}
                  label={p.name}
                  description={
                    <HStack gap={1} wrap="wrap">
                      {grantList(p.list, p.name).map((g) => (
                        <Button key={g.figureId} label={g.label} size="sm" variant="secondary"
                                onClick={() => setOpenFigure(g.figureId)} />
                      ))}
                    </HStack>
                  }
                  startContent={<Token label={String(territory(p.list, p.name)?.rarity ?? "")} size="sm" />}
                  endContent={r === 1 ? undefined : (
                    <Button label="Remove" size="sm" variant="ghost" isIconOnly
                            icon={<Ico name="minus" />}
                            onClick={() => patch({ territories: picks.filter((_, j) => j !== i) })} />
                  )}
                />
              ))}
              {!full && r > 1 && (
                <ListItem
                  label="Add territory"
                  startContent={<Ico name="plus" />}
                  onClick={() => setPicking(r)}
                />
              )}
            </List>
          </VStack>
        );
      })}
    </VStack>
  );

  const detail = capitalList ? (
    <VStack gap={GAP.group}>
      <RegionMap regions={regions} picks={picks} activeRegion={picking} />
      <TextInput label="Kingdom" value={value.name ?? ""} size="sm"
                 onChange={(e) => patch({ name: e.target?.value ?? e })} />
      <Divider />
      <Chronicle entries={value.chronicle ?? []} ruler={value.ruler}
                 onChange={(chronicle) => patch({ chronicle })}
                 onRulerChange={(ruler) => patch({ ruler })} />
      {result && !result.ok && (
        <VStack gap={GAP.tight}>
          {result.errors.slice(0, 5).map((e) => <Text key={e} type="supporting">{e}</Text>)}
        </VStack>
      )}
    </VStack>
  ) : null;

  const dialogs = (
    <>
      <Dialog isOpen={Boolean(picking)} onOpenChange={(o) => !o && setPicking(null)} width={560}
              header={<DialogHeader title={`Region ${picking}`} />}>
        <List hasDividers density={DENSITY.data}>
          {candidates.map(({ t }) => (
            <ListItem
              key={`${t.list}/${t.name}`}
              label={t.name}
              description={LIST_LABEL[t.list]}
              startContent={<Token label={String(t.rarity)} size="sm" />}
              onClick={() => {
                patch({ territories: [...picks, { region: picking, list: t.list, name: t.name }] });
                setPicking(null);
              }}
            />
          ))}
        </List>
      </Dialog>
      {openFigure && (
        <FigureCard figureId={openFigure} isOpen onOpenChange={(o) => !o && setOpenFigure(null)} />
      )}
    </>
  );

  return (
    <Shell
      {...shell}
      title="Kingdom"
      meta={result ? <Text type="label">{result.placed}/{result.slots}</Text> : null}
      detail={detail}
      detailTitle="Kingdom Sheet"
      content={(
      <>
        {content}
        {dialogs}
      </>
      )}
    />
  );
}
