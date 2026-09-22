import { figurePool, figureById, chariotUnlocked } from "./kingdom.mjs";

// Random Points Value Table, p33. Rows 11–12 are only reachable at Expert.
export const RANDOM_POINTS = [500, 750, 1000, 1500, 1750, 2000, 2500, 2750, 3000, 3500, 4000, 6000];
export const BATTLE_SCALE = [
  "Minor Skirmish", "Moderate Skirmish", "Major Skirmish", "Minor Battle",
  "Moderate Battle", "Moderate Battle", "Pitched Battle", "Pitched Battle",
  "Major Battle", "Major Battle", "Epic Battle", "Epic Battle",
];

// p33: Beginner halves the die roll and rounds up (max 1,750); Expert adds 2.
export function rollPoints(d10, level) {
  let roll = d10;
  if (level === "beginner") roll = Math.ceil(d10 / 2);
  if (level === "expert") roll = d10 + 2;
  roll = Math.min(12, Math.max(1, roll));
  return RANDOM_POINTS[roll - 1];
}

export function battleScale(points) {
  const i = RANDOM_POINTS.indexOf(points);
  return i >= 0 ? BATTLE_SCALE[i] : null;
}

function variantFor(fig, unit) {
  if (fig.variants.length === 1) return fig.variants[0];
  return fig.variants.find((v) => v.level === unit.level) ?? fig.variants[0];
}

// An entry's cost: per-figure points, plus upgrade deltas, plus magic item.
export function unitCost(unit) {
  const fig = figureById.get(unit.figureId);
  if (!fig) return 0;
  const v = variantFor(fig, unit);
  const n = unit.count ?? 1;
  const upgrades = (unit.upgrades ?? []).reduce((s, u) => s + (u.pts ?? 0), 0);
  const item = unit.magicItem?.pts ?? 0;
  return v.pts * n + upgrades + item;
}

export function armyPoints(army) {
  return (army.units ?? []).reduce((s, u) => s + unitCost(u), 0);
}

// The 20% rule applies to a single figure including its upgrades and items.
export function singleFigureCost(unit) {
  const fig = figureById.get(unit.figureId);
  if (!fig) return 0;
  const v = variantFor(fig, unit);
  const upgrades = (unit.upgrades ?? []).reduce((s, u) => s + (u.pts ?? 0), 0);
  return v.pts + upgrades + (unit.magicItem?.pts ?? 0);
}

export function validateArmy(kingdom, army) {
  const errors = [];
  const warnings = [];
  const pool = figurePool(kingdom);
  const total = armyPoints(army);
  const budget = army.points ?? 0;
  const units = army.units ?? [];

  if (total > budget) errors.push(`${total - budget}pts over`);

  // Availability, stacking maxima, and level bounds.
  const byFigure = new Map();
  for (const u of units) {
    byFigure.set(u.figureId, [...(byFigure.get(u.figureId) ?? []), u]);
  }
  for (const [figureId, list] of byFigure) {
    const fig = figureById.get(figureId);
    const entry = pool.get(figureId);
    const name = fig?.name ?? figureId;
    if (!entry) {
      errors.push(`${name}: not in this kingdom`);
      continue;
    }
    if (list.length > 4) errors.push(`${name}: max 4 units`);
    if (entry.maxUnits != null && list.length > entry.maxUnits)
      errors.push(`${name}: max ${entry.maxUnits} units`);
    if (entry.maxFigures != null) {
      const n = list.reduce((s, u) => s + (u.count ?? 1), 0);
      if (n > entry.maxFigures) errors.push(`${name}: max ${entry.maxFigures}`);
    }
    if (entry.armyMax != null && list.length > entry.armyMax)
      errors.push(`${name}: ${entry.armyMax} per army`);
    for (const u of list) {
      if (entry.levels && u.level != null && !entry.levels.includes(u.level))
        errors.push(`${name}: Level ${u.level} unavailable`);
      const max = fig?.unitMax ?? 1;
      if ((u.count ?? 1) > max) errors.push(`${name}: max ${max} figures`);
    }
    // Mutually exclusive grants from the same territory.
    for (const ex of entry.exclusiveWith ?? []) {
      const exId = ex.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (byFigure.has(exId)) warnings.push(`Choose either ${name} or ${ex}`);
    }
  }

  // 20% rule.
  for (const u of units) {
    const c = singleFigureCost(u);
    if (budget > 0 && c > budget * 0.2) {
      const need = Math.ceil(c / 0.2);
      const name = figureById.get(u.figureId)?.name ?? u.figureId;
      errors.push(`${name} at ${c}pts is over 20%, needing ${need}pts`);
    }
  }

  // Chariot upgrades require a Wainwrights-style territory.
  for (const u of units) {
    const chariot = (u.upgrades ?? []).find((x) => /chariot/i.test(x.name ?? ""));
    if (!chariot) continue;
    const race = figureById.get(u.figureId)?.list;
    if (race && !chariotUnlocked(kingdom, race))
      errors.push(`${figureById.get(u.figureId).name} needs ${race} Wainwrights`);
  }

  // Magic items: characters only, one each per army.
  const itemCounts = new Map();
  for (const u of units) {
    if (!u.magicItem) continue;
    const fig = figureById.get(u.figureId);
    if (!fig?.variants.some((v) => v.attributes.includes("Magic Items")))
      errors.push(`${fig?.name} is not a character`);
    itemCounts.set(u.magicItem.name, (itemCounts.get(u.magicItem.name) ?? 0) + 1);
  }
  for (const [item, n] of itemCounts)
    if (n > 1) errors.push(`${item} appears ${n} times, one allowed per army`);

  // Characters joining units.
  for (const u of units) {
    if (!u.character) continue;
    const host = figureById.get(u.figureId);
    const char = figureById.get(u.character.figureId);
    if (!host || !char) continue;
    if (host.variants[0].base !== char.variants[0].base)
      errors.push(`${char.name} base differs from ${host.name}`);
    const hostV = host.variants[0];
    const charV = variantFor(char, u.character);
    if (charV.M < hostV.M) warnings.push(`${host.name} moves ${charV.M}"`);
    if (charV.A > hostV.A) warnings.push(`${host.name} activates on ${charV.A}`);
  }

  return { ok: errors.length === 0, errors, warnings, points: total, budget, remaining: budget - total };
}
