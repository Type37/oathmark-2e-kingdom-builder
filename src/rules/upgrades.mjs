import { figureById, territory } from "./kingdom.mjs";

// An upgrade's cost can scale with a spellcaster's level, p95 and p199.
export function upgradeCost(upgrade, level) {
  if (upgrade.pts != null) return upgrade.pts;
  if (!upgrade.costs?.length) return 0;
  if (level == null) return upgrade.costs[0].pts;
  for (const c of upgrade.costs) {
    const m = String(c.levels ?? "").match(/(\d+)(?:[–-](\d+))?/);
    if (!m) continue;
    const lo = Number(m[1]);
    const hi = m[2] ? Number(m[2]) : lo;
    if (level >= lo && level <= hi) return c.pts;
  }
  return upgrade.costs.at(-1).pts;
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
