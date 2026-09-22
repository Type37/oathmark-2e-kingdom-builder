import { figureById, territory } from "./kingdom.mjs";

// An upgrade's cost can scale with a spellcaster's level, p95 and p199.
// The book writes a scaled cost two ways: "Level 1 +20pts, Level 2-3 +30pts",
// where the parser keeps the levels, and "+20pts for level 1, +30pts for levels
// 2-3", where it does not and the printed line is the only record.
export function costBands(upgrade) {
  if (upgrade.pts != null) return [{ lo: null, hi: null, pts: upgrade.pts }];
  const kept = (upgrade.costs ?? [])
    .map((c) => {
      const m = String(c.levels ?? "").match(/(\d+)(?:\s*[–-]\s*(\d+))?/);
      return m ? { pts: c.pts, lo: Number(m[1]), hi: m[2] ? Number(m[2]) : Number(m[1]) } : null;
    })
    .filter(Boolean);
  if (kept.length) return kept;
  const bands = [];
  for (const m of String(upgrade.raw ?? "").matchAll(/\+(\d+)pts for (?:all levels|levels?\s*(\d+)(?:\s*[–-]\s*(\d+))?)/g)) {
    bands.push({ pts: Number(m[1]), lo: m[2] ? Number(m[2]) : null, hi: m[3] ? Number(m[3]) : (m[2] ? Number(m[2]) : null) });
  }
  if (bands.length) return bands;
  return (upgrade.costs ?? []).map((c) => ({ pts: c.pts, lo: null, hi: null }));
}

export function costLabel(upgrade) {
  const bands = costBands(upgrade);
  if (bands.length === 1 && bands[0].lo == null) return `+${bands[0].pts}pts`;
  return bands
    .map((b) => (b.lo == null
      ? `+${b.pts}pts`
      : `${b.lo === b.hi ? `Level ${b.lo}` : `Levels ${b.lo}–${b.hi}`} +${b.pts}pts`))
    .join(", ");
}

export function upgradeCost(upgrade, level) {
  if (upgrade.pts != null) return upgrade.pts;
  const bands = costBands(upgrade);
  if (!bands.length) return 0;
  if (level == null) return bands[0].pts;
  const hit = bands.find((b) => b.lo != null && level >= b.lo && level <= b.hi);
  return (hit ?? bands.at(-1)).pts;
}

// "Elf Wainwrights" style prerequisites are territories, so check the kingdom.
export function upgradeAvailable(kingdom, upgrade) {
  if (!upgrade.requires) return true;
  const want = upgrade.requires.toLowerCase();
  return (kingdom.territories ?? []).some((p) => p.name.toLowerCase() === want);
}

export function upgradesFor(kingdom, figureId) {
  const fig = figureById.get(figureId);
  if (!fig) return [];
  return (fig.upgrades ?? []).map((u) => ({
    ...u,
    available: upgradeAvailable(kingdom, u),
  }));
}

// A mount and a chariot are mutually exclusive: both set the base size.
export function upgradeConflicts(chosen = []) {
  const bases = chosen.filter((u) => u.base);
  return bases.length > 1
    ? [`${bases.map((u) => u.name).join(" and ")} both change the base size`]
    : [];
}

// The upgrade rewrites the stat line it touches, and appends its attributes.
export function applyUpgrades(variant, chosen = []) {
  const out = { ...variant, attributes: [...variant.attributes] };
  for (const u of chosen) {
    for (const [k, v] of Object.entries(u.changes ?? {})) out[k] = v;
    if (u.base) out.base = u.base;
    for (const a of u.adds ?? []) if (!out.attributes.includes(a)) out.attributes.push(a);
  }
  return out;
}
