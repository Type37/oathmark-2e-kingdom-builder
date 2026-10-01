import React from "react";
import {
  Icon, Heading, Card, StackItem, VStack, HStack, Text, Button, List, ListItem, Token, Tooltip, Banner,
} from "@astryxdesign/core";
import Shell from "../Shell.jsx";
import RegionMap from "../components/RegionMap.jsx";
import FigureCard from "../components/FigureCard.jsx";
import FigureAccess from "../components/FigureAccess.jsx";
import TerritoryPicker from "../components/TerritoryPicker.jsx";
import NameField from "../components/NameField.jsx";
import RegionName from "../components/RegionName.jsx";
import Level from "../components/Level.jsx";
import Capital from "../components/Capital.jsx";
import Emblem from "../components/Emblem.jsx";
import EmblemDialog from "../components/EmblemDialog.jsx";
import Chronicle from "../components/Chronicle.jsx";
import { Switch } from "@astryxdesign/core/Switch";
import { GAP, DENSITY } from "../layout.mjs";
import {
  LEVELS, REGION_SIZES, CAPITAL_LISTS, allTerritories, canPlace,
  validateKingdom, territory, grantList, figurePool, rarityNote, openBorderRegion, borderNote,
  startComplete, occupiedNote,
} from "../rules/kingdom.mjs";
import { hueOf } from "../race.mjs";
import { rulerPool, cultureOf } from "../names.mjs";
import KingdomLore from "../components/KingdomLore.jsx";
import Defined from "../components/Defined.jsx";
import KingdomPrint from "../components/KingdomPrint.jsx";
import { hasLore, rollLore } from "../lore.mjs";

const grants = (list, name, opts) => grantList(list, name, opts).map((g) => g.label).join(", ");

// Every region is visible at once. No stepper, so nothing advances underfoot.
export default function KingdomPane({ value, onChange, onEmblem, onMuster, settings, onPrint, shell }) {
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

  // Lore and Detail fills itself in: the realm, the ruler and every region.
  React.useEffect(() => {
    if (!settings?.lore || !hasLore || value.lore) return;
    const rolled = rollLore();
    if (rolled) onChange({ ...value, lore: rolled });
  }, [settings?.lore, value.lore]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lore rolled before regions and rulers existed still fills in the new parts.
  const lore = value.lore;
  const regionLore = settings?.lore && hasLore ? lore?.regions : null;

  const founded = Boolean(value.founded);
  const started = startComplete(value);
  const openRegions = founded ? [1, 2, 3, 4, 5, 6] : regions;

  const regionList = [1, 2, 3, 4, 5, 6].map((r) => {
    const live = openRegions.includes(r);
    const mine = picks.map((p, i) => ({ p, i })).filter(({ p }) => p.region === r);
    const full = mine.length >= REGION_SIZES[r];
    return (
      <Card key={r} padding={3} variant={lit === r ? "pink" : live ? "default" : "muted"}>
      <VStack gap={GAP.item} onMouseEnter={() => setLit(r)} onMouseLeave={() => setLit(null)}>
        <HStack gap={GAP.item} vAlign="center">
          <StackItem size="fill"><RegionName region={r} value={value.regionNames?.[r]}
                      onChange={(name) => patch({ regionNames: { ...(value.regionNames ?? {}), [r]: name } })} /></StackItem>
          <HStack gap={GAP.item} vAlign="center">
            {r === openBorderRegion(value) && (
              <Defined bare def={borderNote}><Token label="Open borders" size="sm" /></Defined>
            )}
            {!live && <Token label={r > 4 ? "Campaign" : "Later"} size="sm" color="gray" />}
            <Text type="label">{mine.length} of {REGION_SIZES[r]}</Text>
          </HStack>
        </HStack>
        {regionLore?.[r] && (
          <Text type="supporting" className="om-region-lore">
            <Text type="inherit" weight="semibold">{regionLore[r].name}.</Text>
            {regionLore[r].text ? ` ${regionLore[r].text}` : ""}
          </Text>
        )}
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
                  <Tooltip content={occupiedNote.text}>
                    <Switch label="Occupied" size="sm" labelPosition="start" value={Boolean(p.occupied)}
                            onChange={(on) => patch({
                              territories: picks.map((x, j) => (j === i ? { ...x, occupied: on } : x)),
                            })} />
                  </Tooltip>
                  <Button className="om-remove" label="Remove" size="sm" variant="destructive" isIconOnly
                          icon={<Icon icon="close" />}
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
                <ListItem label="Add territory" isDisabled startContent={<Icon icon="app:plus" />} />
              </Tooltip>
            ) : (
              <ListItem label={r === 1 ? "Choose a capital" : "Add territory"}
                        startContent={<Icon icon="app:plus" />}
                        onClick={() => setPicking(r)} />
            )
          )}
        </List>
      </VStack>
      </Card>
    );
  });

  const map = (
    <RegionMap regions={[1, 2, 3, 4, 5, 6]} playable={regions} picks={picks} activeRegion={picking} litRegion={lit}
               onRegionHover={setLit}
               onSlotClick={(r, _i, pick) => { if (!pick && (r === 1 || capitalList)) setPicking(r); }} />
  );
  const access = <FigureAccess kingdom={value} onOpen={setOpenFigure} />;
  const chronicle = <Chronicle entries={value.chronicle ?? []} onChange={(chronicle) => patch({ chronicle })} />;

  // The book's Kingdom Sheet (p217): name, ruler, the rings; then what they grant.
  const detail = (
    <VStack gap={GAP.group}>
      <Heading level={2}>Kingdom Sheet</Heading>
      <HStack gap={GAP.item} align="center">
        <Emblem emblemKey={value.emblem} name={value.name} size="lg" />
        <Button label="Emblem" variant="secondary" size="sm"
                onClick={() => setCropping(true)} />
        {value.emblem && (
          <Button className="om-remove" label="Remove emblem" size="sm" variant="destructive" isIconOnly
                  icon={<Icon icon="close" />} onClick={() => onEmblem(null)} />
        )}
      </HStack>
      <NameField label="Current Ruler" size="sm" value={value.ruler} pool={rulerPool(value.culture)}
                 onChange={(ruler) => patch({ ruler })} />
      {lore?.ruler && (
        <VStack gap={GAP.tight}>
          <Text type="supporting">Holds to {lore.ruler.holds.toLowerCase()}.</Text>
          <Text type="supporting">
            Their reign is marked by {lore.ruler.marked.name.toLowerCase()}. {lore.ruler.marked.text}
          </Text>
        </VStack>
      )}
      {map}
      {chronicle}
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
      inlineDetail={<VStack gap={GAP.group}>{map}{chronicle}{access}</VStack>}
      meta={started && !founded ? (
        <Button label="Found the Kingdom" variant="primary" onClick={() => patch({ founded: true })} />
      ) : onMuster && (
        <Button label={value.name ? `Muster an Army of ${value.name}` : "Muster an Army"}
                variant="primary" icon={<Icon icon="app:muster" />} onClick={onMuster} />
      )}
      detail={detail}
      detailTitle="Kingdom Sheet"
      content={(
        <VStack gap={GAP.section}>
          <KingdomPrint value={value} />
          {regionList}
          {result && !result.ok && (
            <VStack gap={GAP.tight}>
              {result.errors.map((e) => <Banner key={e} status="error" title={e} />)}
            </VStack>
          )}
          {dialogs}
        </VStack>
      )}
    />
  );
}
