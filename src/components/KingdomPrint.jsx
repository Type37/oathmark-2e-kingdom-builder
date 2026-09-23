import React from "react";
import RegionMap from "./RegionMap.jsx";
import { useEmblem } from "../emblem.mjs";
import { LEVELS, REGION_SIZES, territory, grantList, figurePool, figureById } from "../rules/kingdom.mjs";
import { STAT_KEYS, statText, baseText } from "../rules/stats.mjs";

const RACE = {
  dwarf: "Dwarf", elf: "Elf", goblin: "Goblin", human: "Human",
  orc: "Orc", necropolis: "Necropolis", unaligned: "Unaligned",
};
const RACE_ORDER = ["dwarf", "elf", "goblin", "human", "orc", "necropolis", "unaligned"];

// The Kingdom Sheet as paper: crest and rings beside the region ledger, the
// realm's character underneath, and the figures it may muster overleaf.
export default function KingdomPrint({ value }) {
  const emblem = useEmblem(value.emblem);
  const level = value.level ?? "moderate";
  const start = LEVELS[level];
  const picks = value.territories ?? [];
  const regions = [...new Set([...start, ...picks.map((p) => p.region)])].sort((a, b) => a - b);
  const lore = value.lore;

  const byRace = RACE_ORDER
    .map((list) => ({
      list,
      rows: [...figurePool(value).values()]
        .map((entry) => ({ fig: figureById.get(entry.figureId), entry }))
        .filter(({ fig }) => fig?.list === list),
    }))
    .filter((g) => g.rows.length);

  return (
    <div className="om-print" aria-hidden="true">
      <header className="om-print-head">
        {emblem && <img className="om-print-emblem" src={emblem} alt="" />}
        <div className="om-print-title">
          <h1>{value.name || "Untitled Kingdom"}</h1>
          <dl>
            <dt>Ruler</dt><dd>{value.ruler || "—"}</dd>
            <dt>Capital</dt><dd>{picks.find((p) => p.region === 1)?.name ?? "—"}</dd>
            <dt>Start</dt><dd>{level}, Regions {start.join(", ")}</dd>
          </dl>
        </div>
      </header>

      <div className="om-print-body">
        <div className="om-print-map">
          <RegionMap regions={[1, 2, 3, 4, 5, 6]} playable={regions} picks={picks} />
        </div>

        <div className="om-print-ledger">
          {regions.map((r) => {
            const mine = picks.filter((p) => p.region === r);
            const blanks = Math.max(0, REGION_SIZES[r] - mine.length);
            return (
              <section key={r} className="om-print-region">
                <h2>
                  {value.regionNames?.[r]?.trim() || `Region ${r}`}
                  <span>{mine.length} of {REGION_SIZES[r]}</span>
                </h2>
                {mine.map((p, i) => (
                  <div key={`${p.name}-${i}`} className="om-print-terr">
                    <h3>
                      <span className={`om-print-box${p.occupied ? " is-on" : ""}`} />
                      {p.name}
                      <em>({territory(p.list, p.name)?.rarity}) {RACE[p.list]}</em>
                    </h3>
                    <p>{grantList(p.list, p.name, { asCapital: r === 1 }).map((g) => g.label).join(", ") || "—"}</p>
                  </div>
                ))}
                {Array.from({ length: blanks }, (_, i) => (
                  <div key={`blank-${i}`} className="om-print-terr">
                    <h3><span className="om-print-box" /><span className="om-print-rule" /></h3>
                  </div>
                ))}
              </section>
            );
          })}
        </div>
      </div>

      {lore && (
        <section className="om-print-realm">
          <h2>The Realm<span>{lore.theme.name}</span></h2>
          <p>{lore.theme.text}</p>
          <dl>
            <dt>Values</dt><dd>{lore.values.map((v) => v.name).join("; ")}</dd>
            <dt>Neighbour</dt><dd>{lore.dispute}</dd>
            <dt>Ties</dt><dd>{lore.tie}</dd>
            <dt>History</dt>
            <dd>
              {lore.history.origin.name}. {lore.history.rise.name}. {lore.history.peak.name}. {lore.history.fall.name}.
            </dd>
          </dl>
        </section>
      )}

      <section className="om-print-figures">
        {byRace.map(({ list, rows }) => (
          <table key={list}>
            <caption>{RACE[list]}</caption>
            <thead>
              <tr>
                <th>Figure</th>
                <th>Max</th>
                {STAT_KEYS.map((k) => <th key={k}>{k === "pts" ? "Pts" : k}</th>)}
                <th>Base</th>
                <th>Special</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ fig, entry }) => {
                const v = fig.variants[0] ?? {};
                const pts = fig.variants.length > 1
                  ? `${fig.variants[0].pts}–${fig.variants.at(-1).pts}`
                  : v.pts;
                return (
                  <tr key={fig.id}>
                    <td>{fig.name}</td>
                    <td>{entry.unlimited ? "Any" : entry.max ?? "—"}</td>
                    {STAT_KEYS.map((k) => (
                      <td key={k}>{k === "pts" ? pts : k === "CD" ? v[k] : statText(k, v[k])}</td>
                    ))}
                    <td>{baseText(v.base)}</td>
                    <td className="om-print-special">{(v.attributes ?? []).join(", ")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ))}
      </section>
    </div>
  );
}
