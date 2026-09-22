import data from "../data/oathmark.json" with { type: "json" };

export const LISTS = Object.keys(data.territories);
export const CAPITAL_LISTS = LISTS.filter((l) => l !== "unaligned");
export const REGION_SIZES = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
export const LEVELS = { beginner: [1, 2], moderate: [1, 2, 3], expert: [1, 2, 3, 4] };

const RARITY_BY_REGION = { 2: { own: 2, other: 1 }, 3: { own: 3, other: 2 }, 4: { own: 4, other: 3 } };

export function territory(list, name) {
  return data.territories[list]?.find((t) => t.name === name);
}

export function allTerritories() {
  return LISTS.flatMap((list) => data.territories[list].map((t) => ({ ...t, list })));
}

export function territorySlots(level) {
  return LEVELS[level].flatMap((r) =>
    Array.from({ length: REGION_SIZES[r] }, (_, i) => ({ region: r, index: i })),
  );
}

// A capital occupies region 1. Regions 2-4 use the own/other rarity lens.
export function maxRarity(region, sameListAsCapital) {
  const row = RARITY_BY_REGION[region];
  if (!row) return 0;
  return sameListAsCapital ? row.own : row.other;
}

// The earliest region that would accept this rarity under the given lens.
function earliestRegion(rarity, sameList) {
  return sameList ? Math.max(2, rarity) : rarity + 1;
}

export function canPlace({ capitalList, region, list, name }) {
  const t = territory(list, name);
  if (!t) return { ok: false, reason: `Unknown: ${list}/${name}` };

  if (region === 1) {
    if (!t.capital) return { ok: false, reason: "Not a capital" };
    return { ok: true };
  }
  if (region > 4) return { ok: false, reason: "Campaign only" };

  // Unaligned territories use their printed rarity regardless of capital (p18, p22).
  // "On the same list as their capital city" (p17) is about the terrain, so a
  // terrain printed on both lists (Dark Hills, Rivers: goblin and orc) counts as own.
  const sameList = list === "unaligned" || list === capitalList || Boolean(territory(capitalList, name));
  if (t.rarity > maxRarity(region, sameList)) {
    const need = earliestRegion(t.rarity, sameList);
    return {
      ok: false,
      reason: need > 4 ? "Campaign only" : `Rarity ${t.rarity}: needs Region ${need}`,
    };
  }
  return { ok: true };
}

// The rarity rule as the book states it (p18), plus where this terrain may sit
// in this kingdom, which is the part a player actually needs.
export function rarityNote({ capitalList, list, name }) {
  const t = territory(list, name);
  if (!t) return null;
  const text =
    "After the name of each terrain type is a number in parenthesis. This number is the rarity of the terrain type and determines where a player can place that type of terrain in their kingdom.";
  if (t.capital) {
    return { title: `Rarity ${t.rarity}`, text, page: 17,
             note: "A capital city sits in Region 1, or in a later region as a second city." };
  }
  if (list === "unaligned") {
    return { title: `Rarity ${t.rarity}`, text, page: 18,
             note: `Unaligned: this keeps rarity ${t.rarity} whatever your capital, so it needs Region ${t.rarity}.` };
  }
  const sameList = list === capitalList || Boolean(territory(capitalList, name));
  const need = earliestRegion(t.rarity, sameList);
  const lens = sameList ? "on your capital's list" : "on another list";
  return {
    title: `Rarity ${t.rarity}`,
    text,
    page: 18,
    note: need > 4
      ? `${need > 4 ? "Campaign only" : ""}: rarity ${t.rarity} ${lens} is beyond Region 4.`
      : `Rarity ${t.rarity} ${lens}, so it needs Region ${need} or later.`,
  };
}

export function placeableIn({ capitalList, region }) {
  return allTerritories().filter((t) => canPlace({ capitalList, region, list: t.list, name: t.name }).ok);
}

export function validateKingdom(k) {
  const errors = [];
  if (!LEVELS[k.level]) return { ok: false, errors: [`Unknown level: ${k.level}`], slots: 0, placed: 0 };
  const slots = territorySlots(k.level);
  const placed = k.territories ?? [];
  const capital = placed.find((p) => p.region === 1);

  if (!capital) errors.push("No capital");
  else if (capital.list !== k.capitalList)
    errors.push(`Capital mismatch: ${capital.list}/${k.capitalList}`);

  for (const r of LEVELS[k.level]) {
    const want = REGION_SIZES[r];
    const got = placed.filter((p) => p.region === r).length;
    if (got !== want) errors.push(`Region ${r}: ${got} of ${want}`);
  }
  // The level fixes which regions are filled (p17); nothing may sit outside them.
  const outside = [...new Set(placed.map((p) => p.region))]
    .filter((r) => !LEVELS[k.level].includes(r) && !(r > 4))
    .sort((a, b) => a - b);
  for (const r of outside) errors.push(`Region ${r}: not in a ${k.level} kingdom`);
  for (const p of placed) {
    const res = canPlace({ capitalList: k.capitalList, region: p.region, list: p.list, name: p.name });
    if (!res.ok) errors.push(res.reason);
  }
  return { ok: errors.length === 0, errors, slots: slots.length, placed: placed.length };
}

// Territories stack: two Dwarf Cities grant two Dwarf Spellcasters.
export function figurePool(k) {
  const pool = new Map();
  for (const p of k.territories ?? []) {
    const t = territory(p.list, p.name);
    if (!t) continue;
    const isCapital = p.region === 1;
    for (const g of t.grants) {
      if (!g.figure) continue;
      if (g.capitalOnly && !isCapital) continue;
      const cur = pool.get(g.figureId) ?? {
        figureId: g.figureId, figure: g.figure, sources: [],
        max: 0, unlimited: false, fromCapital: false,
        levels: null, exclusiveWith: new Set(), armyMax: null,
      };
      cur.sources.push({ ...p, rarity: t.rarity });
      if (g.max == null) cur.unlimited = true;
      else cur.max += g.max;
      if (isCapital) cur.fromCapital = true;
      if (g.levels) cur.levels = [...new Set([...(cur.levels ?? []), ...g.levels])].sort((a, b) => a - b);
      if (g.armyMax != null) cur.armyMax = g.armyMax;
      for (const x of [].concat(g.exclusiveWith ?? [])) cur.exclusiveWith.add(x);
      pool.set(g.figureId, cur);
    }
  }
  // Unlimited grants resolve to a unit count: 4 if from the capital, else 2.
  for (const e of pool.values()) {
    e.exclusiveWith = [...e.exclusiveWith];
    if (e.unlimited) e.maxUnits = e.fromCapital ? 4 : 2;
    else e.maxFigures = e.max;
  }
  return pool;
}

export function chariotUnlocked(k, race) {
  return (k.territories ?? []).some((p) =>
    territory(p.list, p.name)?.grants.some((g) => g.unlocks === "chariotOption" && g.race === race),
  );
}

// "1 Dwarf Spellcaster Level 1\u20132", as the kingdom lists print it (p20).
export function grantLabel(g) {
  const n = g.max != null ? `${g.max} ` : "";
  const lv = g.levels ? ` Level ${g.levels[0]}\u2013${g.levels.at(-1)}` : "";
  return `${n}${g.figure}${lv}`;
}

// Pass asCapital: false to drop the "*" grants a non-capital city does not give (p20).
export function grantList(list, name, { asCapital = true } = {}) {
  const t = territory(list, name);
  if (!t) return [];
  return t.grants
    .filter((g) => g.figure && (asCapital || !g.capitalOnly))
    .map((g) => ({ figureId: g.figureId, label: grantLabel(g) }));
}

export const figures = data.figures;
export const figureById = new Map(data.figures.map((f) => [f.id, f]));
export const errata = data.errata;
export const attributes = data.attributes;
export const stats = data.stats;
export const baseRule = {
  name: "Base",
  text: "The figure's base size in millimetres (mm). The first number is the width of the base across the front of the figure, the second number is the depth of the base on the sides.",
  note: "Editor's note: the game doesn't really care about base sizes from a mathematical perspective. It's not that big a deal. Don't rebase anything.",
  page: 43,
};

// "Command (2)" -> the Appendix A entry for Command, with its level.
export function lookupAttribute(label) {
  const m = String(label).match(/^(.*?)(?:\s*\((\d+)\))?$/);
  const name = (m?.[1] ?? label).trim();
  const entry = data.attributes[name];
  return entry ? { ...entry, level: m?.[2] ? Number(m[2]) : null } : null;
}
