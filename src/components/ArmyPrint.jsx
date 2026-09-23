import React from "react";
import PrintSheet from "./PrintSheet.jsx";
import { useEmblem } from "../emblem.mjs";
import { figureById } from "../rules/kingdom.mjs";
import { unitCost } from "../rules/muster.mjs";
import { applyUpgrades } from "../rules/upgrades.mjs";
import { unitProfile, isCharacter, crewOf } from "../rules/army.mjs";
import { STAT_KEYS, statText, baseText, attrLevel } from "../rules/stats.mjs";
import { spellsKnown } from "../rules/magic.mjs";

// The Army Roster as paper (p218): the crest and the terms of the battle, then
// one block per unit with a box for every figure, to strike off as they fall.
export default function ArmyPrint({ value, kingdom, pool, stats, battle }) {
  const emblem = useEmblem(kingdom?.emblem);
  const units = value.units ?? [];
  const points = value.points ?? 0;
  const spent = units.reduce((n, u) => n + unitCost(u), 0);

  return (
    <PrintSheet>
      <header className="om-print-head">
        {emblem && <img className="om-print-emblem" src={emblem} alt="" />}
        <div className="om-print-title">
          <h1>{value.name || "Untitled Army"}</h1>
          <dl>
            <dt>Commander</dt><dd>{value.commander || "—"}</dd>
            <dt>Kingdom</dt><dd>{kingdom?.name || "—"}</dd>
            <dt>Points</dt><dd>{spent} of {points}</dd>
            {battle && <><dt>Battle</dt><dd>{battle.name}</dd></>}
          </dl>
        </div>
      </header>

      {battle && <p className="om-print-battle">{battle.text}</p>}

      <section className="om-print-roster">
        {units.map((unit) => {
          const p = unitProfile(unit, units, pool.get(unit.figureId));
          if (!p) return null;
          const { fig, variant, charFig } = p;
          const v = applyUpgrades(variant, unit.upgrades ?? []);
          const caster = attrLevel(v, "Spellcaster");
          const figures = crewOf(fig) ?? (unit.count ?? 1);
          const notes = [
            p.formation,
            p.penalty?.occupied ? "occupied ground, activates one worse" : null,
            p.penalty?.unreliable ? "borderlands, Unreliable" : null,
            charFig ? `led by ${charFig.name}` : null,
            unit.joinedTo ? "fights inside a unit" : null,
          ].filter(Boolean).join(" · ");

          return (
            <article key={unit.uid} className="om-print-unit">
              <h3>
                {fig.name}
                <em>{notes}</em>
                <span className="om-print-pts">{unitCost(unit)}pts</span>
              </h3>

              <table className="om-print-stats">
                <thead>
                  <tr>
                    {STAT_KEYS.map((k) => <th key={k}>{k === "pts" ? "Pts" : k}</th>)}
                    <th>Base</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {STAT_KEYS.map((k) => (
                      <td key={k}>{k === "CD" ? v[k] : statText(k, v[k])}</td>
                    ))}
                    <td>{baseText(v.base)}mm</td>
                  </tr>
                </tbody>
              </table>

              {(v.attributes ?? []).length > 0 && (
                <p className="om-print-attrs">{v.attributes.join(", ")}</p>
              )}
              {(unit.upgrades ?? []).length > 0 && (
                <p className="om-print-opts">{unit.upgrades.map((u) => u.name).join(", ")}</p>
              )}
              {unit.magicItem && <p className="om-print-opts">Carries {unit.magicItem.name}</p>}
              {caster > 0 && (
                <p className="om-print-opts">
                  {(unit.spells ?? []).map((s) => `${s.name} (CN${s.cn})`).join(", ")
                    || `${spellsKnown(unit.level ?? caster)} spells to choose`}
                </p>
              )}

              {/* One box per figure: strike them off as they are removed. */}
              <div className="om-print-losses">
                {Array.from({ length: figures }, (_, i) => (
                  <span key={i} className="om-print-box" />
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <section className="om-print-totals">
        <dl>
          {stats.command > 0 && (
            <><dt>Command</dt><dd>{stats.command}, {stats.extraActivations} extra activations</dd></>
          )}
          {stats.champions > 0 && <><dt>Champion dice</dt><dd>{stats.champions}</dd></>}
          {stats.shootingDice > 0 && (
            <><dt>Shooting</dt><dd>{stats.shootingDice} dice to {stats.ranges.map((r) => `${r}"`).join(", ")}</dd></>
          )}
          {stats.casters.length > 0 && (
            <><dt>Spells</dt><dd>{stats.spellsKnown} known across {stats.casters.length}</dd></>
          )}
        </dl>
      </section>
    </PrintSheet>
  );
}

// A character bought in its own right still prints as a unit; nothing here
// needs to know the difference, but the roster reads better with them first.
export const rosterOrder = (units) =>
  [...units].sort((a, b) => {
    const ca = isCharacter(figureById.get(a.figureId)) ? 0 : 1;
    const cb = isCharacter(figureById.get(b.figureId)) ? 0 : 1;
    return ca - cb;
  });
