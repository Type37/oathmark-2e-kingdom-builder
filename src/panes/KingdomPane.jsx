import React from "react";
import {
  VStack, HStack, Text, Button, List, ListItem,
  Token,
} from "@astryxdesign/core";
import Ico from "../components/Ico.jsx";
import Shell from "../Shell.jsx";
import RegionMap from "../components/RegionMap.jsx";
import FigureCard from "../components/FigureCard.jsx";
import FigureAccess from "../components/FigureAccess.jsx";
import TerritoryPicker from "../components/TerritoryPicker.jsx";
import NameField from "../components/NameField.jsx";
import Level from "../components/Level.jsx";
import Capital from "../components/Capital.jsx";
import Emblem from "../components/Emblem.jsx";
import EmblemDialog from "../components/EmblemDialog.jsx";
import { GAP, DENSITY } from "../layout.mjs";
import {
  LEVELS, REGION_SIZES, CAPITAL_LISTS, allTerritories, canPlace,
  validateKingdom, territory, grantList, figurePool,
} from "../rules/kingdom.mjs";
import { hueOf } from "../race.mjs";
import { NAMES } from "../names.mjs";

const grants = (list, name, opts) => grantList(list, name, opts).map((g) => g.label).join(", ");

// Every region is visible at once. No stepper, so nothing advances underfoot.
export default function KingdomPane({ value, onChange, onEmblem, shell }) {
  const { level, capitalList, territories: picks } = value;
  const [picking, setPicking] = React.useState(null);
  const [openFigure, setOpenFigure] = React.useState(null);
  const [cropping, setCropping] = React.useState(false);
  const [lit, setLit] = React.useState(null);
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

  const capitalPicker = (
    <VStack gap={GAP.item}>
      <HStack justify="center" className="om-plate"><Text type="label">Region 1</Text></HStack>
      <List density={DENSITY.choice}>
        {CAPITAL_LISTS.map((list) => {
          const cap = allTerritories().find((t) => t.list === list && t.capital);
          return (
            <ListItem key={list} label={cap.name}
              description={<Text type="supporting">{grants(list, cap.name)}</Text>}
              startContent={<Token label="1" size="sm" color={hueOf(list)} />}
              onClick={() => patch({ capitalList: list, territories: [{ region: 1, list, name: cap.name }] })} />
          );
        })}
      </List>
    </VStack>
  );

  const regionList = regions.map((r) => {
    const mine = picks.map((p, i) => ({ p, i })).filter(({ p }) => p.region === r);
    const full = mine.length >= REGION_SIZES[r];
    return (
      <VStack key={r} gap={GAP.item} className={lit === r ? "om-region-lit" : undefined}
              onMouseEnter={() => setLit(r)} onMouseLeave={() => setLit(null)}>
        <HStack gap={GAP.item} align="center" justify="between" className="om-plate">
          <Text type="label">Region {r}</Text>
          <Text type="label">{mine.length} of {REGION_SIZES[r]}</Text>
        </HStack>
        <List density={DENSITY.data}>
          {mine.map(({ p, i }) => (
            <ListItem
              key={`${p.name}-${i}`}
              label={p.name}
              description={
                <HStack gap={1} wrap="wrap">
                  {grantList(p.list, p.name, { asCapital: r === 1 }).map((g) => (
                    <Button key={g.figureId} label={g.label} size="sm" variant="secondary"
                            onClick={() => setOpenFigure(g.figureId)} />
                  ))}
                </HStack>
              }
              startContent={<Token label={`Rarity ${territory(p.list, p.name)?.rarity ?? ""}`} size="sm" color={hueOf(p.list)} />}
              endContent={r === 1 ? undefined : (
                <Button label="Remove" size="sm" variant="ghost" isIconOnly
                        icon={<Ico name="minus" />}
                        onClick={() => patch({ territories: picks.filter((_, j) => j !== i) })} />
              )}
            />
          ))}
          {!full && r > 1 && (
            <ListItem label="Add territory" startContent={<Ico name="plus" />} onClick={() => setPicking(r)} />
          )}
        </List>
      </VStack>
    );
  });

  const map = (
    <RegionMap regions={regions} picks={picks} activeRegion={picking} litRegion={lit}
               onRegionHover={setLit}
               onSlotClick={(r, _i, pick) => { if (capitalList && !pick && r > 1) setPicking(r); }} />
  );
  const access = <FigureAccess kingdom={value} onOpen={setOpenFigure} />;

  // The book's Kingdom Sheet (p217): name, ruler, the rings; then what they grant.
  const detail = (
    <VStack gap={GAP.group}>
      <HStack justify="center" className="om-plate"><Text type="label">Kingdom Sheet</Text></HStack>
      <NameField label="Kingdom Name" size="sm" value={value.name} pool={NAMES.kingdom}
                 onChange={(name) => patch({ name })} />
      <NameField label="Current Ruler" size="sm" value={value.ruler} pool={NAMES.hero}
                 onChange={(ruler) => patch({ ruler })} />
      <HStack gap={2} align="center">
        <Emblem emblemKey={value.emblem} name={value.name} size="xl" />
        <Button label={value.emblem ? "Change Emblem" : "Add Emblem"} size="sm" variant="secondary"
                onClick={() => setCropping(true)} />
        {value.emblem && <Button label="Remove" size="sm" variant="ghost" onClick={() => onEmblem(null)} />}
      </HStack>
      {map}
      {access}
    </VStack>
  );

  const dialogs = (
    <>
      <TerritoryPicker
        region={picking}
        candidates={candidates.map(({ t }) => t)}
        pool={new Set(figurePool(value).keys())}
        onOpenFigure={setOpenFigure}
        onClose={() => setPicking(null)}
        onPick={(t) => {
          patch({ territories: [...picks, { region: picking, list: t.list, name: t.name }] });
          setPicking(null);
        }}
      />
      {openFigure && (
        <FigureCard figureId={openFigure} isOpen onOpenChange={(o) => !o && setOpenFigure(null)} />
      )}
      <EmblemDialog isOpen={cropping} onOpenChange={setCropping}
                    onDone={(blob) => { onEmblem(blob); setCropping(false); }} />
    </>
  );

  return (
    <Shell
      {...shell}
      title={value.name || "Untitled"}
      leading={<Emblem emblemKey={value.emblem} name={value.name} size="lg" />}
      inlineDetail={<VStack gap={GAP.group}>{map}{access}</VStack>}
      subtitle={value.ruler ? <Text>{value.ruler}</Text> : null}
      meta={<HStack gap={GAP.item} align="center"><Capital kingdom={value} /><Level level={level ?? "moderate"} /></HStack>}
      detail={detail}
      detailTitle="Kingdom Sheet"
      content={(
        <VStack gap={GAP.section}>
          {capitalList ? regionList : capitalPicker}
          {result && !result.ok && (
            <VStack gap={GAP.tight} className="om-callout">
              {result.errors.map((e) => <Text key={e}>{e}</Text>)}
            </VStack>
          )}
          {dialogs}
        </VStack>
      )}
    />
  );
}
