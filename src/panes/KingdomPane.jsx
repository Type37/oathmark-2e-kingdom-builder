import React from "react";
import {
  Icon, Heading, Card, StackItem, VStack, HStack, Text, Button, List, ListItem, Token, Tooltip, Banner, Blockquote,
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
import { DENSITY } from "../layout.mjs";
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
// How long the founding seal takes to land (paper.css, om-found-seal).
const FOUND_MS = 650;

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

  const [sealing, setSealing] = React.useState(false);
  const founded = Boolean(value.founded);
  const started = startComplete(value);
  const openRegions = founded ? [1, 2, 3, 4, 5, 6] : regions;

  const regionList = [1, 2, 3, 4, 5, 6].map((r) => {
    const live = openRegions.includes(r);
    const mine = picks.map((p, i) => ({ p, i })).filter(({ p }) => p.region === r);
    const full = mine.length >= REGION_SIZES[r];
    return (
      <Card key={r} onMouseEnter={() => setLit(r)} onMouseLeave={() => setLit(null)}
            variant={lit === r ? (mine.length ? hueOf(mine[0].p.list) : "pink") : live ? "default" : "muted"}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill"><RegionName region={r} value={value.regionNames?.[r]}
                      onChange={(name) => patch({ regionNames: { ...(value.regionNames ?? {}), [r]: name } })} /></StackItem>
          <HStack gap={2} vAlign="center">
            {r === openBorderRegion(value) && (
              <Defined bare def={borderNote}><Token label="Open borders" size="sm" /></Defined>
            )}
            {!live && <Token label={r > 4 ? "Campaign" : "Later"} size="sm" color="gray" />}
            <Text type="label">{mine.length} of {REGION_SIZES[r]}</Text>
            {/* The region's own action sits in its header, after the detail-page
                template's section headings. */}
            {!full && live && (r > 1 || !capitalList) && (
              r > 1 && !capitalList ? (
                <Tooltip content="Establish your capital first.">
                  <Button label="Add territory" size="sm" variant="secondary" isDisabled
                          icon={<Icon icon="app:plus" />} />
                </Tooltip>
              ) : (
                <Button label={r === 1 ? "Choose a capital" : "Add territory"} size="sm" variant="secondary"
                        icon={<Icon icon="app:plus" />} onClick={() => setPicking(r)} />
              )
            )}
          </HStack>
        </HStack>
        {regionLore?.[r] && (
          <Blockquote>
            <Text type="inherit" weight="semibold">{regionLore[r].name}.</Text>
            {regionLore[r].text ? ` ${regionLore[r].text}` : ""}
          </Blockquote>
        )}
        {mine.length > 0 && (
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
                <HStack gap={2} align="center">
                  {/* Territory is only lost once the kingdom is at war, after founding. */}
                  {founded && (
                    <Tooltip content={occupiedNote.text}>
                      <Switch label="Occupied" size="sm" labelPosition="start" value={Boolean(p.occupied)}
                              onChange={(on) => patch({
                                territories: picks.map((x, j) => (j === i ? { ...x, occupied: on } : x)),
                              })} />
                    </Tooltip>
                  )}
                  <Button label="Remove" size="sm" variant="ghost" isIconOnly
                          icon={<Icon icon="close" />}
                          onClick={() => patch(r === 1
                            ? { capitalList: null, territories: [] }
                            : { territories: picks.filter((_, j) => j !== i) })} />
                </HStack>
              }
            />
          ))}
        </List>
        )}
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
  const chronicle = <Chronicle entries={value.chronicle ?? []} ruler={value.ruler ?? ""} onChange={(chronicle) => patch({ chronicle })} />;

  // The book's Kingdom Sheet (p217): name, ruler, the rings; then what they grant.
  const detail = (
    // Tight inside each group, generous between them: the sheet's name and
    // ruler, the rings, the chronicle, the realm, the figures it grants.
    <VStack gap={6}>
      <VStack gap={3}>
        <Heading level={2}>Kingdom Sheet</Heading>
        <HStack gap={2} vAlign="center">
          <Emblem emblemKey={value.emblem} name={value.name} size="lg" />
          <Button label="Emblem" variant="secondary" onClick={() => setCropping(true)} />
          {value.emblem && (
            <Button label="Remove emblem" variant="ghost" isIconOnly
                    icon={<Icon icon="close" />} onClick={() => onEmblem(null)} />
          )}
        </HStack>
        <NameField label="Current Ruler" value={value.ruler} pool={rulerPool(value.culture)}
                   onChange={(ruler) => patch({ ruler })} />
        {lore?.ruler && (
          <VStack gap={1}>
            <Text color="secondary">Holds to {lore.ruler.holds.toLowerCase()}.</Text>
            <Text color="secondary">
              Their reign is marked by {lore.ruler.marked.name.toLowerCase()}. {lore.ruler.marked.text}
            </Text>
          </VStack>
        )}
      </VStack>
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
      inlineDetail={<VStack gap={6}>{map}{chronicle}{access}</VStack>}
      meta={started && !founded ? (
        <Button label="Found the Kingdom" variant="primary" icon={<Icon icon="app:laurel" />}
                className={sealing ? "om-found om-found-sealing" : "om-found"}
                onClick={() => {
                  if (sealing) return;
                  setSealing(true);
                  // The seal lands, then the kingdom is founded.
                  setTimeout(() => { setSealing(false); patch({ founded: true }); }, FOUND_MS);
                }} />
      ) : onMuster && (
        <Button label={value.name ? `Muster an Army of ${value.name}` : "Muster an Army"}
                variant="primary" icon={<Icon icon="app:muster" />} onClick={onMuster} />
      )}
      detail={detail}
      detailTitle="Kingdom Sheet"
      content={(
        <VStack gap={4}>
          <KingdomPrint value={value} />
          {regionList}
          {result && !result.ok && (
            <VStack gap={1}>
              {result.errors.map((e) => <Banner key={e} status="error" title={e} />)}
            </VStack>
          )}
          {dialogs}
        </VStack>
      )}
    />
  );
}
