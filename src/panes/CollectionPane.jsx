import React from "react";
import { VStack, Text, TextInput, Section, TabList, Tab, NumberInput, HStack } from "@astryxdesign/core";
import FigureTable from "../components/FigureTable.jsx";
import Shell from "../Shell.jsx";
import FigureCard from "../components/FigureCard.jsx";
import { figures } from "../rules/kingdom.mjs";
import { collectionTotals, unitsAffordable } from "../rules/collection.mjs";
import { STAT_KEYS } from "../rules/stats.mjs";
import { GAP } from "../layout.mjs";

const LISTS = ["dwarf", "elf", "goblin", "human", "orc", "necropolis", "unaligned"];
const LABEL = {
  dwarf: "Dwarf", elf: "Elf", goblin: "Goblin", human: "Human",
  orc: "Orc", necropolis: "Necropolis", unaligned: "Unaligned",
};

export default function CollectionPane({ value, onChange, shell }) {
  const [list, setList] = React.useState("dwarf");
  const [query, setQuery] = React.useState("");
  const [openFigure, setOpenFigure] = React.useState(null);
  const totals = collectionTotals(value);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return figures
      .filter((f) => (q ? f.name.toLowerCase().includes(q) : f.list === list))
      .sort((a, b) => a.variants[0].pts - b.variants[0].pts)
      .map((f) => ({
        figureId: f.id,
        name: f.name,
        ...Object.fromEntries(STAT_KEYS.map((k) => [k, f.variants[0][k]])),
        cap: `${f.unitMax} per unit`,
        owned: value?.[f.id] ?? 0,
        units: unitsAffordable(value, f.id),
        fig: f,
      }));
  }, [list, query, value]);

  const set = (id, n) => {
    const next = { ...value };
    if (!n) delete next[id];
    else next[id] = n;
    onChange(next);
  };

  return (
    <Shell
      {...shell}
      title="Collection"
      meta={(
      <Text type="label">
        {totals.figures} figures in {totals.types} types, {totals.points}pts
      </Text>
    )}
      detail={null}
      detailTitle="Collection"
      content={(
      <VStack gap={0}>
        <Section paddingBlockEnd={GAP.item}>
          <TextInput label="Find a figure" value={query} size="sm"
                     onChange={(e) => setQuery(e.target?.value ?? e)} />
        </Section>
        {!query && (
          <Section paddingBlockEnd={0}>
            <TabList value={list} onChange={setList} hasDivider isFullBleed>
              {LISTS.map((l) => <Tab key={l} value={l} label={LABEL[l]} />)}
            </TabList>
          </Section>
        )}
        <Section padding={0}>
          <FigureTable
            rows={rows}
            onOpen={setOpenFigure}
            actionColumn={{
              header: "Owned",
              render: (r) => (
                <HStack gap={2} align="center" justify="end">
                  {r.units ? <Text type="supporting">{r.units}u</Text> : null}
                  <NumberInput label={`${r.name} owned`} isLabelHidden size="sm"
                               value={r.owned} min={0}
                               onChange={(n) => set(r.figureId, Math.max(0, n || 0))} />
                </HStack>
              ),
            }}
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
