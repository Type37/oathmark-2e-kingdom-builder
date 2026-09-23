import React from "react";
import PrintSheet from "./PrintSheet.jsx";
import { useEmblem } from "../emblem.mjs";
import { lookupAttribute } from "../rules/kingdom.mjs";
import { unitCost } from "../rules/muster.mjs";
import { applyUpgrades } from "../rules/upgrades.mjs";
import { unitProfile, crewOf } from "../rules/army.mjs";
import { STAT_KEYS, statText, baseText, attrLevel, figuresIn, weaponsOf, rangeText } from "../rules/stats.mjs";
import { spells as ALL_SPELLS, magicItems as ALL_ITEMS, spellsKnown } from "../rules/magic.mjs";

const byName = (a, b) => a.name.localeCompare(b.name);
const COLS = STAT_KEYS.filter((k) => k !== "pts");

// The Army Roster as paper: one table of units, then every rule this army
// actually uses, in full, so the book can stay in the bag.
export default function ArmyPrint({ value, kingdom, pool, stats, battle }) {
  const emblem = useEmblem(kingdom?.emblem);
  const units = value.units ?? [];
  const points = value.points ?? 0;

  // Resolve each unit once; the table and the glossaries both read from this.
  const rows = units.map((unit) => {
    const p = unitProfile(unit, units, pool.get(unit.figureId));
    if (!p) return null;
    const v = applyUpgrades(p.variant, unit.upgrades ?? []);
    const caster = attrLevel(v, "Spellcaster");
    return {
      unit, p, v,
      figures: crewOf(p.fig) ?? figuresIn(unit),
      range: weaponsOf(p.fig).map((w) => `${w} ${rangeText(w)}`).join(", "),
      knows: caster ? spellsKnown(unit.level ?? caster) : 0,
    };
  }).filter(Boolean);

  const spent = rows.reduce((n, r) => n + unitCost(r.unit), 0);

  // Levelled abilities share one entry: Shielding (1) and Shielding (2) are one rule.
  const attributes = [...new Set(rows.flatMap((r) => r.v.attributes ?? []))]
    .map((label) => lookupAttribute(label))
    .filter(Boolean)
    .reduce((out, def) => (out.some((x) => x.name === def.name) ? out : [...out, def]), [])
    .sort(byName);

  const spellNames = new Set(rows.flatMap((r) => (r.unit.spells ?? []).map((s) => s.name)));
  const known = ALL_SPELLS.filter((s) => spellNames.has(s.name)).sort(byName);

  const itemNames = new Set(rows.map((r) => r.unit.magicItem?.name).filter(Boolean));
  const carried = ALL_ITEMS.filter((i) => itemNames.has(i.name)).sort(byName);

  return (
    <PrintSheet>
      <header className="om-print-head">
        {emblem && <img className="om-print-emblem" src={emblem} alt="" />}
        <div className="om-print-title">
          <h1>{value.name || "Untitled Army"}</h1>
          <dl className="om-print-facts">
            <dt>Points</dt><dd>{spent} of {points}</dd>
            {value.commander && <><dt>Commander</dt><dd>{value.commander}</dd></>}
            {kingdom?.name && <><dt>Kingdom</dt><dd>{kingdom.name}</dd></>}
            {stats.command > 0 && (
              <><dt>Command</dt><dd>up to {stats.extraActivations} extra {stats.extraActivations === 1 ? "activation" : "activations"}</dd></>
            )}
            {stats.champions > 0 && <><dt>Champion dice</dt><dd>{stats.champions}</dd></>}
            {stats.shootingDice > 0 && (
              <><dt>Shooting</dt><dd>{stats.shootingDice} dice to {stats.ranges.map((r) => `${r}"`).join(", ")}</dd></>
            )}
            {battle && <><dt>Battle</dt><dd>{battle.name}</dd></>}
          </dl>
        </div>
      </header>
      {battle && <p className="om-print-battle">{battle.text}</p>}

      <table className="om-print-units">
        <thead>
          <tr>
            <th>Figure</th>
            {COLS.map((k) => <th key={k}>{k}</th>)}
            <th>Base</th>
            <th>Range</th>
            <th>Figures</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ unit, p, v, figures, range, knows }) => (
            <tr key={unit.uid}>
              <td className="om-print-unit-name">
                <strong>{p.fig.name}</strong>
                <span>
                  {[
                    p.penalty?.occupied ? "occupied ground, activates one worse" : null,
                    p.penalty?.unreliable ? "borderlands, Unreliable" : null,
                    p.charFig ? `led by ${p.charFig.name}` : null,
                    unit.joinedTo ? "fights inside a unit" : null,
                    ...(v.attributes ?? []),
                    ...(unit.upgrades ?? []).map((u) => u.name),
                    unit.magicItem ? `carries ${unit.magicItem.name}` : null,
                  ].filter(Boolean).join(", ")}
                </span>
                {knows > 0 && (
                  <span className="om-print-spells">
                    <b>Spells</b>
                    {(unit.spells ?? []).map((s) => <i key={s.name}>{s.name} CN{s.cn}</i>)}
                    {Array.from({ length: Math.max(0, knows - (unit.spells ?? []).length) },
                      (_, i) => <span key={i} className="om-print-rule" />)}
                  </span>
                )}
              </td>
              {COLS.map((k) => <td key={k}>{k === "CD" ? v[k] : statText(k, v[k])}</td>)}
              <td>{baseText(v.base)}</td>
              <td>{range}</td>
              <td className="om-print-figures-cell">
                {figures}
                {p.formation && <small>{p.formation}</small>}
              </td>
              <td>{unitCost(unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>


      {attributes.length > 0 && (
        <>
          <h2 className="om-print-section">Special Abilities</h2>
          <div className="om-print-glossary">
            {attributes.map((def) => (
              <div key={def.name} className="om-print-entry">
                <h3>{def.name}<em>p{def.page}</em></h3>
                <p>{def.text}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {known.length > 0 && (
        <>
          <h2 className="om-print-section">Spells</h2>
          <div className="om-print-glossary">
            {known.map((s) => (
              <div key={s.name} className="om-print-entry">
                <h3>{s.name}<em>CN{s.cn}</em></h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {carried.length > 0 && (
        <>
          <h2 className="om-print-section">Magic Items</h2>
          <div className="om-print-glossary">
            {carried.map((i) => (
              <div key={i.name} className="om-print-entry">
                <h3>{i.name}<em>{i.pts}pts</em></h3>
                <p>{i.text}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </PrintSheet>
  );
}
