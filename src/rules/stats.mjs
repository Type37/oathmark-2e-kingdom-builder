import { figureById } from "./kingdom.mjs";

// Missile and artillery ranges, p72.
export const RANGES = {
  Bow: [null, 20],
  "Elf Bow": [null, 22],
  Sling: [2, 12],
  "Light Catapult": [8, 32],
  "Heavy Catapult": [12, 40],
  Ballista: [null, 30],
  "Fire Breath": [null, 12],
};

export const MAX_COMBAT_DICE = 5;
// The book's worked examples measure against dwarf soldiers at Defence 10.
export const REFERENCE_DEFENCE = 10;

export const STAT_KEYS = ["A", "M", "F", "S", "D", "CD", "H", "pts"];

// Fight and Shoot come off the enemy's Defence, so they read as subtractions;
// Defence is the number the enemy works down from; Combat Dice are ten-siders (p14).
export function statText(key, value) {
  if (value == null || value === "") return "";
  if (key === "F" || key === "S") return Number(value) > 0 ? `−${value}` : "0";
  if (key === "A" || key === "D") return `${value}+`;
  if (key === "M") return `${value}"`;
  if (key === "CD") return `${value}d10`;
  return String(value);
}

// "0″–20″" reads faster than "None to 20 inches".
export function rangeText(weapon) {
  const r = RANGES[weapon];
  if (!r) return "";
  return `${r[0] ?? 0}"–${r[1]}"`;
}

// "25 x 25" is a square base, so one number says it.
export function baseText(base) {
  const [w, d] = String(base ?? "").split(/\s*[x×]\s*/i);
  return d && d !== w ? `${w} x ${d}` : (w ?? "");
}

// Equipment already inside the stats: the card lists what actually does something.
// Shields and spears do their work through Shielding and Brace; weapons and
// armour sit inside the stats. Only missile weapons survive on their own.
const BAKED_IN = new Set(["Hand Weapon", "Two-Handed Weapon", "Two-handed Weapon",
  "Light Armour", "Heavy Armour", "Shield", "Spear"]);
export const carriesRule = (label) => !BAKED_IN.has(String(label).trim());

export function variantFor(fig, unit = {}) {
  if (fig.variants.length === 1) return fig.variants[0];
  return fig.variants.find((v) => v.level === unit.level) ?? fig.variants[0];
}

export function statLine(fig, unit) {
  const v = variantFor(fig, unit);
  return STAT_KEYS.map((k) => [k, v[k]]);
}

export function frontRank(fig, count) {
  return Math.min(count, fig.rankWidth);
}

export function fullRanks(fig, count) {
  return Math.floor(count / fig.rankWidth);
}

export function hasPartialRank(fig, count) {
  return count % fig.rankWidth !== 0;
}

// Front-arc melee or shooting: CD x front-rank figures, capped at 5.
export function combatDice(fig, count, unit) {
  const v = variantFor(fig, unit);
  return Math.min(MAX_COMBAT_DICE, Math.max(1, v.CD * frontRank(fig, count)));
}

// Fighting an enemy on the flank or rear: CD x complete ranks instead.
export function flankCombatDice(fig, count, unit) {
  const v = variantFor(fig, unit);
  return Math.min(MAX_COMBAT_DICE, Math.max(1, v.CD * fullRanks(fig, count)));
}

// -1 to Target Number per full rank after the first, front arc only.
export function rankBonus(fig, count) {
  return Math.max(0, fullRanks(fig, count) - 1);
}

export function targetNumber(fig, count, enemyDefence = REFERENCE_DEFENCE, unit) {
  const v = variantFor(fig, unit);
  return enemyDefence - v.F - rankBonus(fig, count);
}

export function shootTargetNumber(fig, count, enemyDefence = REFERENCE_DEFENCE, unit) {
  const v = variantFor(fig, unit);
  if (!v.S) return null;
  return enemyDefence - v.S - rankBonus(fig, count);
}

// Morale Test Modifier Table, p77. Rank bonuses depend on base size.
export function moraleModifier(fig, count) {
  const ranks = fullRanks(fig, count);
  const wide = fig.variants[0].base === "25 x 25";
  if (ranks < 1) return -1;
  if (wide) return ranks >= 2 ? 1 : 0;
  return 1;
}

// The figure count at which the morale bonus appears or disappears.
export function nextMoraleThreshold(fig) {
  const wide = fig.variants[0].base === "25 x 25";
  return fig.rankWidth * (wide ? 2 : 1);
}

export function attrLevel(v, name) {
  const hit = v.attributes.find((a) => a === name || a.startsWith(`${name} (`));
  if (!hit) return 0;
  const m = hit.match(/\((\d+)\)/);
  return m ? Number(m[1]) : 1;
}

export function weaponsOf(fig) {
  let eq = fig.equipment.join(", ");
  const found = [];
  // Longest name first: "Elf Bow" must win before plain "Bow" can match it.
  for (const w of Object.keys(RANGES).sort((a, b) => b.length - a.length)) {
    if (!eq.includes(w)) continue;
    found.push(w);
    eq = eq.split(w).join("");
  }
  return found;
}

export function unitStats(unit) {
  const fig = figureById.get(unit.figureId);
  if (!fig) return null;
  const v = variantFor(fig, unit);
  const count = unit.count ?? 1;
  return {
    fig,
    variant: v,
    count,
    frontRank: frontRank(fig, count),
    fullRanks: fullRanks(fig, count),
    partial: hasPartialRank(fig, count),
    combatDice: combatDice(fig, count, unit),
    flankDice: flankCombatDice(fig, count, unit),
    rankBonus: rankBonus(fig, count),
    targetNumber: targetNumber(fig, count, REFERENCE_DEFENCE, unit),
    shootTN: shootTargetNumber(fig, count, REFERENCE_DEFENCE, unit),
    morale: moraleModifier(fig, count),
    moraleAt: nextMoraleThreshold(fig),
    health: v.H * count,
    command: attrLevel(v, "Command"),
    champion: v.attributes.includes("Champion") || attrLevel(v, "Champion") > 0,
    spellcaster: attrLevel(v, "Spellcaster"),
    shielding: attrLevel(v, "Shielding"),
    courage: attrLevel(v, "Courage"),
    weapons: weaponsOf(fig),
  };
}

export function armyStats(units = []) {
  const rows = units.map(unitStats).filter(Boolean);
  const activation = {};
  let command = 0;
  let champions = 0;
  let shootingDice = 0;
  let health = 0;
  let figures = 0;
  const ranges = new Set();
  const casters = [];

  for (const r of rows) {
    activation[r.variant.A] = (activation[r.variant.A] ?? 0) + 1;
    command += r.command;
    if (r.champion) champions += 1;
    if (r.variant.S > 0) shootingDice += r.combatDice;
    health += r.health;
    figures += r.count;
    for (const w of r.weapons) ranges.add(RANGES[w][1]);
    if (r.spellcaster) casters.push({ level: r.spellcaster, spells: r.spellcaster + 2 });
  }

  const acts = rows.map((r) => r.variant.A);
  return {
    units: rows.length,
    figures,
    health,
    command,
    // Each Command(X) buys X extra activation attempts per turn.
    extraActivations: command,
    champions,
    shootingDice,
    ranges: [...ranges].sort((a, b) => a - b),
    casters,
    spellsKnown: casters.reduce((s, c) => s + c.spells, 0),
    activation,
    worstActivation: acts.length ? Math.max(...acts) : null,
    bestActivation: acts.length ? Math.min(...acts) : null,
    rows,
  };
}
