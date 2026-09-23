import React from "react";
import {
  VStack, HStack, Text, Button, List, ListItem,
  Token, Tooltip,
} from "@astryxdesign/core";
import Ico from "../components/Ico.jsx";
import Shell from "../Shell.jsx";
import RegionMap from "../components/RegionMap.jsx";
import FigureCard from "../components/FigureCard.jsx";
import FigureAccess from "../components/FigureAccess.jsx";
import TerritoryPicker from "../components/TerritoryPicker.jsx";
import NameField from "../components/NameField.jsx";
import RollButton from "../components/RollButton.jsx";
import RegionName from "../components/RegionName.jsx";
import Level from "../components/Level.jsx";
import Capital from "../components/Capital.jsx";
import Emblem from "../components/Emblem.jsx";
import EmblemDialog from "../components/EmblemDialog.jsx";
import { GAP, DENSITY } from "../layout.mjs";
import {
  LEVELS, REGION_SIZES, CAPITAL_LISTS, allTerritories, canPlace,
  validateKingdom, territory, grantList, figurePool, rarityNote, openBorderRegion, borderNote,
  startComplete, occupiedNote,
} from "../rules/kingdom.mjs";
import { hueOf } from "../race.mjs";
import { rollKingdom, rulerPool, cultureOf } from "../names.mjs";
import KingdomLore from "../components/KingdomLore.jsx";
import Defined from "../components/Defined.jsx";
import KingdomPrint from "../components/KingdomPrint.jsx";
import { hasLore } from "../lore.mjs";

const grants = (list, name, opts) => grantList(list, name, opts).map((g) => g.label).join(", ");

// Every region is visible at once. No stepper, so nothing advances underfoot.
export default function KingdomPane({ value, onChange, onEmblem, settings, onPrint, shell }) {
  const { level, capitalList, territories: picks } = value;
  const [picking, setPicking] = React.useState(null);
  const [openFigure, setOpenFigure] = React.useState(null);
  const [cropping, setCropping] = React.useState(false);
  const [lit, setLit] = React.useState(null);
  const patch = (next) => onChange({ ...value, ...next });
  const regions = LEVELS[level ?? "moderate"];
  const result = capitalList ? validateKingdom({ ...value, level: level ?? "moderate" }) : null;

  const capitals = () => allTerritories().filter((t) => t.capital);
  const candidates = React.useMemo(() => {
    if (picking === 1) return capitals().map((t) => ({ t, res: { ok: true } }));
    if (!picking || !capitalList) return [];
    return allTerritories()
      .map((t) => ({ t, res: canPlace({ capitalList, region: picking, list: t.list, name: t.name, founded: value.founded, kingdom: value }) }))
      .filter((x) => x.res.ok)
      .sort((a, b) =>
        (a.t.list === capitalList ? -1 : 0) - (b.t.list === capitalList ? -1 : 0) ||
        a.t.rarity - b.t.rarity || a.t.name.localeCompare(b.t.name));
  }, [picking, capitalList]);

  const founded = Boolean(value.founded);
  const started = startComplete(value);
  const openRegions = founded ? [1, 2, 3, 4, 5, 6] : regions;

  const regionList = [1, 2, 3, 4, 5, 6].map((r) => {
    const live = openRegions.includes(r);
    const mine = picks.map((p, i) => ({ p, i })).filter(({ p }) => p.region === r);
    const full = mine.length >= REGION_SIZES[r];
    return (
      <VStack key={r} gap={GAP.item} className={`${lit === r ? "om-region-lit" : ""}${live ? "" : " om-region-closed"}`.trim() || undefined}
              onMouseEnter={() => setLit(r)} onMouseLeave={() => setLit(null)}>
        <HStack gap={GAP.item} align="center" justify="between" className="om-plate">
          <RegionName region={r} value={value.regionNames?.[r]}
                      onChange={(name) => patch({ regionNames: { ...(value.regionNames ?? {}), [r]: name } })} />
          <HStack gap={GAP.item} align="center">
            {r === openBorderRegion(value) && (
              <Defined bare def={borderNote}><Token label="Open borders" size="sm" /></Defined>
            )}
            {!live && <Token label={r > 4 ? "Campaign" : "Later"} size="sm" color="gray" />}
            <Text type="label">{mine.length} of {REGION_SIZES[r]}</Text>
          </HStack>
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
              startContent={
                <Defined bare def={rarityNote({ capitalList, list: p.list, name: p.name })}
                         label={`Rarity ${territory(p.list, p.name)?.rarity ?? ""}`}>
                  <Token label={`Rarity ${territory(p.list, p.name)?.rarity ?? ""}`} size="sm" color={hueOf(p.list)} />
                </Defined>
              }
              endContent={
                <HStack gap={GAP.item} align="center">
                  <Defined bare def={occupiedNote}>
                    <Token label="Occupied" size="sm" color={p.occupied ? "red" : "gray"}
                           onClick={() => patch({
                             territories: picks.map((x, j) => (j === i ? { ...x, occupied: !x.occupied } : x)),
                           })} />
                  </Defined>
                  <Button label="Remove" size="sm" variant="destructive" isIconOnly
                          icon={<Ico name="times" />}
                          onClick={() => patch(r === 1
                            ? { capitalList: null, territories: [] }
                            : { territories: picks.filter((_, j) => j !== i) })} />
                </HStack>
              }
            />
          ))}
          {!full && live && (r > 1 || !capitalList) && (
            r > 1 && !capitalList ? (
              <Tooltip content="Establish your capital first.">
                <ListItem label="Add territory" isDisabled startContent={<Ico name="plus" />} />
              </Tooltip>
            ) : (
              <ListItem label={r === 1 ? "Choose a capital" : "Add territory"}
                        startContent={<Ico name="plus" />}
                        onClick={() => setPicking(r)} />
            )
          )}
        </List>
      </VStack>
    );
  });

  const map = (
    <RegionMap regions={[1, 2, 3, 4, 5, 6]} playable={regions} picks={picks} activeRegion={picking} litRegion={lit}
               onRegionHover={setLit}
               onSlotClick={(r, _i, pick) => { if (!pick && (r === 1 || capitalList)) setPicking(r); }} />
  );
  const access = <FigureAccess kingdom={value} onOpen={setOpenFigure} />;

  // The book's Kingdom Sheet (p217): name, ruler, the rings; then what they grant.
  const detail = (
    <VStack gap={GAP.group}>
      <HStack justify="center" className="om-plate"><Text type="label">Kingdom Sheet</Text></HStack>
      <NameField label="Current Ruler" size="sm" value={value.ruler} pool={rulerPool(value.culture)}
                 onChange={(ruler) => patch({ ruler })} />
      {map}
      {settings?.lore && hasLore && <KingdomLore value={value} onChange={onChange} />}
      {access}
    </VStack>
  );

  const dialogs = (
    <>
      <TerritoryPicker
        region={picking}
        candidates={candidates.map(({ t }) => t)}
        founded={founded}
        capitalList={capitalList}
        pool={new Set(figurePool(value).keys())}
        onOpenFigure={setOpenFigure}
        onClose={() => setPicking(null)}
        onPick={(t) => {
          patch(picking === 1
            ? { capitalList: t.list, territories: [{ region: 1, list: t.list, name: t.name }] }
            : { territories: [...picks, { region: picking, list: t.list, name: t.name }] });
          setPicking(null);
        }}
      />
      {openFigure && (
        <FigureCard figureId={openFigure} isOpen onOpenChange={(o) => !o && setOpenFigure(null)}
                    owns={(name) => picks.some((p) => p.name === name)} />
      )}
      <EmblemDialog isOpen={cropping} onOpenChange={setCropping}
                    onDone={(blob) => { onEmblem(blob); setCropping(false); }} />
    </>
  );

  return (
    <Shell
      {...shell}
      onPrint={onPrint}
      title={value.name || "Untitled"}
      onRename={(name) => patch({ name, culture: cultureOf(name) ?? value.culture ?? null })}
      titleAction={<RollButton label="Roll a kingdom name" isIconOnly onClick={() => patch(rollKingdom(value.name))} />}
      leading={
        <Button label={value.emblem ? "Change emblem" : "Add an emblem"} variant="ghost" isIconOnly
                onClick={() => setCropping(true)}>
          <Emblem emblemKey={value.emblem} name={value.name} size="lg" />
        </Button>
      }
      inlineDetail={<VStack gap={GAP.group}>{map}{access}</VStack>}
      meta={null}
      detail={detail}
      detailTitle="Kingdom Sheet"
      content={(
        <VStack gap={GAP.section}>
          <KingdomPrint value={value} />
          {regionList}
          {started && !founded && (
            <div className="om-cta-dock">
              <Button label="Found the Kingdom" variant="primary"
                      onClick={() => patch({ founded: true })} />
            </div>
          )}
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
