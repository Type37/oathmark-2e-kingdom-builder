// The merge behind Discord Sync, kept pure so its rules can be tested.
//
// Every kingdom, collection and army is a record with an id and a `saved`
// stamp. Two copies of the store merge by id: a record on one side only is
// kept, and on a clash the newer `saved` wins. A deletion travels as a
// tombstone (id -> when it was deleted), so an army deleted on one device does
// not come back from the cloud on the next pull; a record saved after its
// tombstone outlives it. Nothing is dropped any other way.

export const SYNC_KINDS = ["kingdoms", "collections", "musters"];

const newer = (a, b) => (a ?? "") > (b ?? "");

export function mergeStores(local, remote) {
  const deleted = { ...(remote?.deleted ?? {}) };
  for (const [id, at] of Object.entries(local?.deleted ?? {})) {
    if (newer(at, deleted[id])) deleted[id] = at;
  }
  const out = { deleted };
  for (const kind of SYNC_KINDS) {
    const byId = new Map();
    for (const rec of [...(remote?.[kind] ?? []), ...(local?.[kind] ?? [])]) {
      const have = byId.get(rec.id);
      if (!have || newer(rec.saved, have.saved)) byId.set(rec.id, rec);
    }
    out[kind] = [...byId.values()].filter((r) => !deleted[r.id] || newer(r.saved, deleted[r.id]));
  }
  return out;
}

// What goes up: the records and the tombstones, never the seeded examples a
// fresh device starts with, so a new phone does not add them to everyone's set.
export function payloadOf(store) {
  const out = { deleted: store.deleted ?? {} };
  for (const kind of SYNC_KINDS) out[kind] = (store[kind] ?? []).filter((r) => !r.seeded);
  return out;
}

// What comes back: the merged records laid over the store, keeping this
// device's own choices (which record is open, the options) and any seeded
// examples that have not been touched.
export function applyMerged(store, merged) {
  const out = { ...store, deleted: merged.deleted };
  for (const kind of SYNC_KINDS) {
    const seeded = (store[kind] ?? []).filter((r) => r.seeded && !merged[kind].some((m) => m.id === r.id));
    out[kind] = [...merged[kind], ...seeded];
  }
  return out;
}
