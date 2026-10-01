import { unitCost } from "./muster.mjs";
import { unitProfile, crewOf } from "./army.mjs";
import { figuresIn } from "./stats.mjs";

// The Army Roster as plain text, for pasting into a chat or a forum post.
// A character that joins a unit is listed under it.
export function armyText({ value, kingdom, pool }) {
  const units = value.units ?? [];
  const total = units.reduce((n, u) => n + unitCost(u), 0);

  const line = (unit, indent = "") => {
    const p = unitProfile(unit, units, pool.get(unit.figureId));
    if (!p) return null;
    const figures = crewOf(p.fig) ?? figuresIn(unit);
    const label = unit.name ? `${unit.name} (${p.fig.name})` : p.fig.name;
    const extras = [
      unit.level ? `Level ${unit.level}` : null,
      ...(unit.upgrades ?? []).map((u) => u.name),
      unit.magicItem ? unit.magicItem.name : null,
      (unit.spells ?? []).length ? `Spells: ${unit.spells.join(", ")}` : null,
    ].filter(Boolean);
    return `${indent}${label}${figures > 1 ? ` x${figures}` : ""} - ${unitCost(unit)}pts`
      + (extras.length ? ` [${extras.join("; ")}]` : "");
  };

  const lines = [`${value.name || "Untitled Army"} - ${total} of ${value.points ?? 0}pts`];
  if (kingdom?.name) lines.push(kingdom.name);
  if (value.commander) lines.push(`Commander: ${value.commander}`);
  lines.push("");
  for (const u of units.filter((x) => !x.joinedTo)) {
    const text = line(u);
    if (text) lines.push(text);
    for (const j of units.filter((x) => x.joinedTo === u.uid)) {
      const jt = line(j, "  + ");
      if (jt) lines.push(jt);
    }
  }
  return lines.join("\n");
}
