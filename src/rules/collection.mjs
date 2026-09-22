import { figureById } from "./kingdom.mjs";

// collection: { [figureId]: number of figures owned }

export function owned(collection, figureId) {
  return collection?.[figureId] ?? 0;
}

// What an army needs of each figure, against what is on the shelf.
export function demand(units = []) {
  const need = new Map();
  for (const u of units) {
    need.set(u.figureId, (need.get(u.figureId) ?? 0) + (u.count ?? 1));
  }
  return need;
}

export function shortfalls(collection, units = []) {
  const out = [];
  for (const [figureId, need] of demand(units)) {
    const have = owned(collection, figureId);
    if (have < need) {
      out.push({
        figureId,
        name: figureById.get(figureId)?.name ?? figureId,
        need,
        have,
        short: need - have,
      });
    }
  }
  return out.sort((a, b) => b.short - a.short);
}

// The largest number of units of this figure the shelf supports at full size.
export function unitsAffordable(collection, figureId) {
  const fig = figureById.get(figureId);
  if (!fig) return 0;
  return Math.floor(owned(collection, figureId) / fig.unitMax);
}

export function collectionTotals(collection = {}) {
  let figures = 0;
  let types = 0;
  let points = 0;
  for (const [id, n] of Object.entries(collection)) {
    if (!n) continue;
    const fig = figureById.get(id);
    if (!fig) continue;
    types += 1;
    figures += n;
    points += fig.variants[0].pts * n;
  }
  return { figures, types, points };
}
