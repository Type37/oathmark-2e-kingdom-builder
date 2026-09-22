import React from "react";
import RegionMap from "./RegionMap.jsx";
import { LEVELS, REGION_SIZES, territory, grantList, figurePool, figureById } from "../rules/kingdom.mjs";
import { STAT_KEYS } from "../rules/stats.mjs";

const RACE = {
  dwarf: "Dwarf", elf: "Elf", goblin: "Goblin", human: "Human",
  orc: "Orc", necropolis: "Necropolis", unaligned: "Unaligned",
};

// The Kingdom Sheet as paper: the rings, the territories they hold, and every
// figure the kingdom may muster. Screen hides it; print shows only this.
export default function KingdomPrint({ value }) {
  const level = value.level ?? "moderate";
  const regions = LEVELS[level];
  const picks = value.territories ?? [];
  const pool = [...figurePool(value).entries()]
    .map(([id, entry]) => ({ fig: figureById.get(id), entry }))
    .filter(({ fig }) => fig);

  return (
    <div className="om-print" aria-hidden="true">
      <header className="om-print-head">
        <h1>{value.name || "Untitled Kingdom"}</h1>
        <dl>
          <dt>Ruler</dt><dd>{value.ruler || "—"}</dd>
          <dt>Capital</dt><dd>{picks.find((p) => p.region === 1)?.name ?? "—"}</dd>
          <dt>Regions</dt><dd>{regions.join(", ")}</dd>
        </dl>
      </header>

      <div className="om-print-map">
        <RegionMap regions={[1, 2, 3, 4, 5, 6]} playable={regions} picks={picks} />
      </div>

      {regions.map((r) => {
        const mine = picks.filter((p) => p.region === r);
        return (
          <section key={r} className="om-print-region">
            <h2>Region {r} <span>{mine.length} of {REGION_SIZES[r]}</span></h2>
            {mine.map((p, i) => (
              <div key={`${p.name}-${i}`} className="om-print-terr">
                <h3>{p.name} <span>({territory(p.list, p.name)?.rarity}) {RACE[p.list]}</span></h3>
                <p>{grantList(p.list, p.name, { asCapital: r === 1 }).map((g) => g.label).join(", ") || "—"}</p>
              </div>
            ))}
          </section>
        );
      })}

      <section className="om-print-figures">
        <h2>Figures Available</h2>
        <table>
          <thead>
            <tr>
              <th>Figure</th>
              <th>Max</th>
              {STAT_KEYS.map((k) => <th key={k}>{k === "pts" ? "Pts" : k}</th>)}
              <th>Base</th>
            </tr>
          </thead>
          <tbody>
            {pool.map(({ fig, entry }) => {
              const v = fig.variants[0] ?? {};
              const pts = fig.variants.length > 1
                ? `${fig.variants[0].pts}–${fig.variants.at(-1).pts}`
                : v.pts;
              return (
                <tr key={fig.id}>
                  <td>{fig.name}</td>
                  <td>{entry.unlimited ? "Any" : entry.max ?? "—"}</td>
                  {STAT_KEYS.map((k) => <td key={k}>{k === "pts" ? pts : v[k]}</td>)}
                  <td>{v.base}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
