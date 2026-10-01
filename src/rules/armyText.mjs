// The Army Roster as plain text, for a message or a forum post.
import { unitProfile, crewOf } from "./army.mjs";
import { unitCost } from "./muster.mjs";
import { figuresIn } from "./stats.mjs";

// A unit's own name leads when it has one; the figure it is follows in brackets.
export const unitLabel = (unit, figName) =>
  unit.name?.trim() ? `${unit.name.trim()} (${figName})` : figName;

export function armyText(value, kingdom, pool) {
  const units = value.units ?? [];
  const spent = units.reduce((n, u) => n + unitCost(u), 0);
  const lines = [value.name || "Untitled Army"];
  const facts = [
    value.commander && `Commander: ${value.commander}`,
    kingdom?.name && `Kingdom: ${kingdom.name}`,
    `Points: ${spent} of ${value.points ?? 0}`,
  ].filter(Boolean);
  lines.push(...facts, "");

  for (const unit of units) {
    const p = unitProfile(unit, units, pool?.get(unit.figureId));
    if (!p) continue;
    const n = crewOf(p.fig) ?? figuresIn(unit);
    const head = `${unitLabel(unit, p.fig.name)}${n > 1 ? ` x${n}` : ""}, ${unitCost(unit)}pts`;
    const extras = [
      p.charFig && `led by ${p.charFig.name}`,
      unit.joinedTo && "fights inside a unit",
      ...(unit.upgrades ?? []).map((u) => u.name),
      unit.magicItem && unit.magicItem.name,
      (unit.spells ?? []).length > 0 && `Spells: ${unit.spells.join(", ")}`,
    ].filter(Boolean);
    lines.push(head);
    if (extras.length) lines.push(`  ${extras.join("; ")}`);
  }
  return lines.join("\n").trimEnd();
}
