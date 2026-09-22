import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, VStack, HStack, TabList, Tab, Text, Token,
} from "@astryxdesign/core";
import FigureTable from "./FigureTable.jsx";
import { AttributeCard } from "./StatLine.jsx";
import { figureById } from "../rules/kingdom.mjs";
import { STAT_KEYS } from "../rules/stats.mjs";
import { owned } from "../rules/collection.mjs";
import { sizeRule, crewOf } from "../rules/army.mjs";
import { GAP } from "../layout.mjs";

const ROLE_ORDER = ["character", "infantry", "cavalry", "monster", "artillery"];
const ROLE_LABEL = {
  character: "Characters", infantry: "Infantry", cavalry: "Cavalry",
  monster: "Monsters", artillery: "Artillery",
};

export function roleOf(fig) {
  const v = fig.variants[0];
  if (v.attributes.includes("Artillery") || /catapult|ballista/i.test(fig.name)) return "artillery";
  if (v.attributes.some((a) => /^(Command|Champion|Spellcaster)/.test(a)) || v.attributes.includes("Magic Items"))
    return "character";
  if (v.attributes.includes("Monster")) return "monster";
  if (v.base === "25 x 50") return "cavalry";
  if (v.base === "50 x 50" || v.base === "50 x 100") return "monster";
  return "infantry";
}

// What the kingdom's territories allow, by the role it plays on the table.
export default function AddUnits({ isOpen, onOpenChange, pool, units, collection, onAdd, onOpenFigure }) {
  const [openAttr, setOpenAttr] = React.useState(null);
  const [role, setRole] = React.useState("infantry");

  const grouped = React.useMemo(() => {
    const g = {};
    for (const entry of pool.values()) {
      const fig = figureById.get(entry.figureId);
      if (!fig) continue;
      (g[roleOf(fig)] ??= []).push({ entry, fig });
    }
    for (const l of Object.values(g)) l.sort((a, b) => a.fig.variants[0].pts - b.fig.variants[0].pts);
    return g;
  }, [pool]);

  const roles = ROLE_ORDER.filter((r) => grouped[r]?.length);
  const active = roles.includes(role) ? role : roles[0];

  const rows = (grouped[active] ?? []).map(({ entry, fig }) => {
    const v = fig.variants[0];
    const taken = units.filter((u) => u.figureId === fig.id).length;
    const unitCap = entry.maxUnits ?? Math.min(4, entry.maxFigures ?? 4);
    const have = owned(collection, fig.id);
    return {
      figureId: fig.id,
      name: fig.name,
      ...Object.fromEntries(STAT_KEYS.map((k) => [k, v[k]])),
      taken,
      atCap: taken >= unitCap,
      cap: [
        entry.levels ? `Levels ${entry.levels[0]}–${entry.levels.at(-1)}` : null,
        entry.maxUnits ? `${unitCap} units` : `max ${entry.maxFigures ?? sizeRule(fig).max}`,
        crewOf(fig) ? `crew ${crewOf(fig)}` : null,
        have ? `own ${have}` : null,
      ].filter(Boolean).join(", "),
      entry, fig,
    };
  });

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width="min(1280px, 94vw)" maxHeight="92dvh">
      <Layout
        header={<DialogHeader title="Add Units" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={GAP.item} style={{ blockSize: "76dvh", overflowY: "auto" }}>
              <TabList value={active} onChange={setRole}>
                {roles.map((r) => <Tab key={r} value={r} label={ROLE_LABEL[r]} />)}
              </TabList>
              <FigureTable rows={rows} onOpen={onOpenFigure} onAdd={onAdd} onOpenAttribute={setOpenAttr} />
              <AttributeCard name={openAttr} isOpen={Boolean(openAttr)}
                             onOpenChange={(o) => !o && setOpenAttr(null)} />
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}
