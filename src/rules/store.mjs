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

// The chronicle was once a list of dated entries; it is one document now. An
// old list becomes paragraphs, each led by its year: "**Year 3 of Barrok IV.**"
export function chronicleText(chronicle) {
  if (typeof chronicle === "string") return chronicle;
  if (!Array.isArray(chronicle)) return "";
  return chronicle
    .filter((e) => e.title?.trim() || e.body?.trim())
    .map((e) => {
      const when = e.ruler?.trim() ? `Year ${e.year} of ${e.ruler.trim()}` : `Year ${e.year}`;
      return [`**${when}.**`, e.title?.trim() && `${e.title.trim()}.`, e.body?.trim()].filter(Boolean).join(" ");
    })
    .join("\n\n");
}

export function normalise(raw) {
  const s = { ...emptyStore(), ...(raw ?? {}) };
  for (const k of KINDS) if (!Array.isArray(s[k])) s[k] = [];
  s.musters = s.musters.map(currentMagic);
  // A retired feature's saved text is dropped wherever it was kept.
  s.kingdoms = s.kingdoms.map(({ lore: _drop, ...k }) => ({ ...k, chronicle: chronicleText(k.chronicle) }));
  if (s.settings) { const { lore: _off, ...rest } = s.settings; s.settings = rest; }
  s.active = s.active ?? {};
  s.deleted = s.deleted && typeof s.deleted === "object" ? s.deleted : {};
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
  // An example the app seeded becomes yours, and syncs, once you change it.
  const { seeded: _seeded, ...rec } = record;
  const next = { ...rec, id, saved: stamp() };
  const rest = (store[kind] ?? []).filter((r) => r.id !== id);
  return { ...store, [kind]: [...rest, next], active: { ...store.active, [kind]: id } };
}

export function remove(store, kind, id) {
  const active = { ...store.active };
  if (active[kind] === id) delete active[kind];
  // The tombstone lets Discord Sync carry the deletion to other devices.
  return {
    ...store,
    [kind]: (store[kind] ?? []).filter((r) => r.id !== id),
    active,
    deleted: { ...(store.deleted ?? {}), [id]: stamp() },
  };
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
