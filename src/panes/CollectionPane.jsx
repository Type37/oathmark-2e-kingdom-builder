import React from "react";
import { VStack, Text, TextInput, Section, TabList, Tab, HStack } from "@astryxdesign/core";
import FigureTable from "../components/FigureTable.jsx";
import Shell from "../Shell.jsx";
import FigureCard from "../components/FigureCard.jsx";
import { AttributeCard } from "../components/StatLine.jsx";
import Counter from "../components/Counter.jsx";
import { figures } from "../rules/kingdom.mjs";
import { collectionTotals, unitsAffordable } from "../rules/collection.mjs";
import { STAT_KEYS } from "../rules/stats.mjs";
import { GAP } from "../layout.mjs";

const LISTS = ["dwarf", "elf", "goblin", "human", "orc", "necropolis", "unaligned"];

// Sorting is by column; names sort as text, everything else as numbers.
function sorted(rows, { key, dir }) {
  const sign = dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (key === "name") return sign * a.name.localeCompare(b.name);
    if (key === "owned") return sign * ((a.owned ?? 0) - (b.owned ?? 0));
    return sign * ((Number(a[key]) || 0) - (Number(b[key]) || 0));
  });
}
const LABEL = {
  dwarf: "Dwarf", elf: "Elf", goblin: "Goblin", human: "Human",
  orc: "Orc", necropolis: "Necropolis", unaligned: "Unaligned",
};

export default function CollectionPane({ value, onChange, shell }) {
  const [list, setList] = React.useState("dwarf");
  const [query, setQuery] = React.useState("");
  const [openFigure, setOpenFigure] = React.useState(null);
  const [openAttr, setOpenAttr] = React.useState(null);
  const totals = collectionTotals(value);
  const sections = React.useRef({});
  const [sort, setSort] = React.useState(null);

  // Every figure in the book, in printed order, kept in its own list's section.
  const groups = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const row = (f) => ({
      figureId: f.id,
      name: f.name,
      ...Object.fromEntries(STAT_KEYS.map((k) => [k, f.variants[0][k]])),
      cap: `${f.unitMax} per unit`,
      owned: value?.[f.id] ?? 0,
      units: unitsAffordable(value, f.id),
      fig: f,
    });
    return LISTS
      .map((l) => ({
        list: l,
        rows: figures
          .filter((f) => f.list === l && (!q || f.name.toLowerCase().includes(q)))
          .map(row),
      }))
      .filter((g) => g.rows.length)
      .map((g) => (sort ? { ...g, rows: sorted(g.rows, sort) } : g));
  }, [query, value, sort]);

  // Clicking a column sorts every list section by it, ascending then descending.
  const onSort = (key) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  // The list names are a jump bar, not a filter.
  const jump = (l) => {
    setList(l);
    sections.current[l]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
      meta={null}
      detail={null}
      detailTitle="Collection"
      content={(
      <VStack gap={0}>
        <Section paddingBlockEnd={GAP.item}>
          <TextInput label="Find a figure" value={query} size="sm"
                     onChange={(e) => setQuery(e.target?.value ?? e)} />
        </Section>
        <Section paddingBlockEnd={0} className="om-sticky-tabs">
          <TabList value={list} onChange={jump} isFullBleed>
            {LISTS.map((l) => <Tab key={l} value={l} label={LABEL[l]} />)}
          </TabList>
        </Section>
        {groups.map((g) => (
          <Section key={g.list} padding={0} className="om-list-section">
            <div ref={(el) => { sections.current[g.list] = el; }}>
              <HStack justify="center" className="om-plate"><Text type="label">{LABEL[g.list]}</Text></HStack>
            </div>
            <FigureTable
              rows={g.rows}
              sort={sort}
              onSort={onSort}
              onOpen={setOpenFigure}
              onOpenAttribute={setOpenAttr}
              actionColumn={{
                header: "Owned",
                width: 210,
                render: (r) => (
                  <HStack gap={2} align="center" justify="end">
                    {r.units ? <Text type="supporting">{r.units}u</Text> : null}
                    <Counter label={`${r.name} owned`} value={r.owned}
                             onChange={(n) => set(r.figureId, n)} />
                  </HStack>
                ),
              }}
            />
          </Section>
        ))}
        <AttributeCard name={openAttr} isOpen={Boolean(openAttr)} onOpenChange={(o) => !o && setOpenAttr(null)} />
        {openFigure && (
          <FigureCard figureId={openFigure} isOpen onOpenChange={(o) => !o && setOpenFigure(null)} />
        )}
      </VStack>
      )}
    />
  );
}
