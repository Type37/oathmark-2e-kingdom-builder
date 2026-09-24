// Named saves for kingdoms, collections and musters, in one versioned record.
import { spellNamed, itemNamed } from "./magic.mjs";

export const STORE_KEY = "oathmark.v2";
export const SCHEMA = 2;

export function emptyStore() {
  return { schema: SCHEMA, kingdoms: [], collections: [], musters: [], active: {} };
}

function uid() {
  return (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).slice(0, 12);
}

export function stamp() {
  return new Date().toISOString();
}

const KINDS = ["kingdoms", "collections", "musters"];

// A saved army's items and spells are matched back to the book's current
// entries, so a renamed one keeps its place in the pickers and the print.
export function currentMagic(muster) {
  return {
    ...muster,
    units: (muster.units ?? []).map((u) => ({
      ...u,
      ...(u.magicItem ? { magicItem: itemNamed(u.magicItem) ?? u.magicItem } : {}),
      ...(u.spells ? { spells: u.spells.map((s) => spellNamed(s)?.name ?? s) } : {}),
    })),
  };
}

export function normalise(raw) {
  const s = { ...emptyStore(), ...(raw ?? {}) };
  for (const k of KINDS) if (!Array.isArray(s[k])) s[k] = [];
  s.musters = s.musters.map(currentMagic);
  s.active = s.active ?? {};
  s.schema = SCHEMA;
  return s;
}

export function list(store, kind) {
  return [...(store[kind] ?? [])].sort((a, b) => (b.saved ?? "").localeCompare(a.saved ?? ""));
}

export function get(store, kind, id) {
  return (store[kind] ?? []).find((r) => r.id === id) ?? null;
}

export function save(store, kind, record) {
  const id = record.id ?? uid();
  const next = { ...record, id, saved: stamp() };
  const rest = (store[kind] ?? []).filter((r) => r.id !== id);
  return { ...store, [kind]: [...rest, next], active: { ...store.active, [kind]: id } };
}

export function remove(store, kind, id) {
  const active = { ...store.active };
  if (active[kind] === id) delete active[kind];
  return { ...store, [kind]: (store[kind] ?? []).filter((r) => r.id !== id), active };
}

export function duplicate(store, kind, id) {
  const src = get(store, kind, id);
  if (!src) return store;
  const { id: _drop, saved: _s, ...rest } = src;
  return save(store, kind, { ...rest, name: `${src.name || "Untitled"} copy` });
}

export function setActive(store, kind, id) {
  return { ...store, active: { ...store.active, [kind]: id } };
}

export function activeRecord(store, kind) {
  return get(store, kind, store.active?.[kind]);
}

// Export produces one file; import accepts a whole store or a single record.
export function toFile(store) {
  return JSON.stringify({ schema: SCHEMA, exported: stamp(), ...store }, null, 2);
}

export function fromFile(text) {
  const data = JSON.parse(text);
  if (KINDS.some((k) => Array.isArray(data[k]))) return { store: normalise(data), record: null };
  if (data.territories || data.units || data.collection) return { store: null, record: data };
  throw new Error("Unrecognised file");
}

export function merge(store, incoming) {
  let out = store;
  for (const kind of KINDS) {
    for (const rec of incoming[kind] ?? []) {
      const clash = get(out, kind, rec.id);
      out = save(out, kind, clash ? { ...rec, id: undefined, name: `${rec.name} imported` } : rec);
    }
  }
  return out;
}
