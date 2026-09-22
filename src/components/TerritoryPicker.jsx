import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutPanel,
  VStack, HStack, List, ListItem, Token, Text, Heading, Button, Table, Link, useMediaQuery,
} from "@astryxdesign/core";
import { pixel } from "@astryxdesign/core/Table";
import { territory, figureById } from "../rules/kingdom.mjs";
import { STAT_KEYS } from "../rules/stats.mjs";
import { hueOf } from "../race.mjs";
import { BREAK, GAP } from "../layout.mjs";

const RACE = {
  dwarf: "Dwarf", elf: "Elf", goblin: "Goblin", human: "Human",
  orc: "Orc", necropolis: "Necropolis", unaligned: "Unaligned",
};
const letter = (k) => (k === "pts" ? "Pts" : k);

// The book's words for the choice in front of you, p17 (capital) and p18 (terrain).
const NOTE = {
  capital: "Your choice of capital determines the race of your ruler and/or royal family and has a strong influence on the make-up of any army you muster.",
  terrain: "Each terrain type states which figures that terrain type grants the kingdom access to when mustering an army.",
};

// Each figure a territory grants, with its stat line, marked New when the kingdom lacks it.
function Grants({ t, pool, onOpenFigure }) {
  const rows = t.grants
    .filter((g) => g.figure && !g.capitalOnly)
    .map((g) => {
      const fig = figureById.get(g.figureId);
      const v = fig?.variants[0] ?? {};
      const pts = fig?.variants.length > 1
        ? `${fig.variants[0].pts}–${fig.variants.at(-1).pts}` : v.pts;
      const count = g.max != null ? `${g.max} ` : "";
      const levels = g.levels ? ` Level ${g.levels[0]}–${g.levels.at(-1)}` : "";
      return { id: g.figureId, name: `${count}${g.figure}${levels}`, isNew: !pool.has(g.figureId), ...v, pts };
    });

  const columns = [
    { key: "name", header: "Figure", width: pixel(200), renderCell: (r) => (
      <VStack gap={0} align="start">
        <Link isStandalone onClick={() => onOpenFigure(r.id)}>{r.name}</Link>
        {r.isNew && <Token label="New" size="sm" color={hueOf(t.list)} />}
      </VStack>
    ) },
    ...STAT_KEYS.map((k) => ({
      key: k, header: letter(k), width: pixel(44), align: "center",
      renderCell: (r) => <Text>{r[k]}</Text>,
    })),
  ];
  return <Table data={rows} columns={columns} idKey="id" density="compact" dividers="rows" />;
}

function Preview({ t, region, pool, onOpenFigure, onAdd, onBack }) {
  return (
    <VStack gap={GAP.group}>
      <HStack gap={GAP.item} align="center" wrap="wrap">
        {onBack && <Button label="Back" variant="ghost" size="sm" onClick={onBack} />}
        <Heading level={3}>{t.name}</Heading>
        <Token label={RACE[t.list]} size="sm" color={hueOf(t.list)} />
        <Token label={`Rarity ${t.rarity}`} size="sm" />
      </HStack>
      <Grants t={t} pool={pool} onOpenFigure={onOpenFigure} />
      <HStack justify="end">
        <Button label={`Add to Region ${region}`} variant="primary" onClick={() => onAdd(t)} />
      </HStack>
    </VStack>
  );
}

export default function TerritoryPicker({ region, candidates, pool, onPick, onClose, onOpenFigure }) {
  const narrow = useMediaQuery(BREAK.narrow);
  const [focus, setFocus] = React.useState(null);
  const isOpen = Boolean(region);

  React.useEffect(() => { setFocus(narrow ? null : candidates[0] ?? null); }, [region]); // eslint-disable-line react-hooks/exhaustive-deps

  const withGrants = (c) => ({ ...c, ...territory(c.list, c.name), list: c.list });
  const list = (
    <List density="compact">
      {candidates.map((c) => (
        <ListItem
          key={`${c.list}/${c.name}`}
          label={c.name}
          isSelected={focus?.list === c.list && focus?.name === c.name}
          description={<Text type="supporting">{RACE[c.list]}</Text>}
          startContent={<Token label={`Rarity ${c.rarity}`} size="sm" color={hueOf(c.list)} />}
          onMouseEnter={narrow ? undefined : () => setFocus(c)}
          onClick={() => setFocus(c)}
        />
      ))}
    </List>
  );
  const preview = focus && (
    <Preview t={withGrants(focus)} region={region} pool={pool} onOpenFigure={onOpenFigure}
             onAdd={onPick} onBack={narrow ? () => setFocus(null) : undefined} />
  );
  const close = (o) => !o && onClose();

  return (
    <Dialog isOpen={isOpen} onOpenChange={close} width="min(1280px, 94vw)" maxHeight="92dvh">
      <Layout
        header={<DialogHeader title={`Region ${region}`} onOpenChange={close} />}
        start={narrow ? undefined : <LayoutPanel width={340} hasDivider isScrollable>{list}</LayoutPanel>}
        isScrollable
        content={
          <LayoutContent>
            <VStack gap={GAP.group} style={{ blockSize: "78dvh", overflowY: "auto" }}>
              <HStack className="om-callout">
                <Text>{region === 1 ? NOTE.capital : NOTE.terrain}</Text>
              </HStack>
              {narrow ? (preview ?? list) : preview}
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}
