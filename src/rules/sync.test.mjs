import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeStores, payloadOf, applyMerged } from "./sync.mjs";

const army = (id, saved, name = id) => ({ id, saved, name });
const ids = (list) => list.map((r) => r.id).sort();

test("records on either side are kept", () => {
  const m = mergeStores({ musters: [army("a", "2026-01-01")] }, { musters: [army("b", "2026-01-02")] });
  assert.deepEqual(ids(m.musters), ["a", "b"]);
});

test("on a clash the newer save wins, whichever side it is on", () => {
  const local = { musters: [army("a", "2026-02-01", "new")] };
  const remote = { musters: [army("a", "2026-01-01", "old")] };
  assert.equal(mergeStores(local, remote).musters[0].name, "new");
  assert.equal(mergeStores(remote, local).musters[0].name, "new");
});

test("a deletion travels, and does not come back from the other side", () => {
  const local = { musters: [], deleted: { a: "2026-03-01" } };
  const remote = { musters: [army("a", "2026-02-01")] };
  assert.deepEqual(mergeStores(local, remote).musters, []);
  assert.equal(mergeStores(local, remote).deleted.a, "2026-03-01");
});

test("a record saved after its deletion outlives it", () => {
  const local = { musters: [army("a", "2026-04-01")] };
  const remote = { musters: [], deleted: { a: "2026-03-01" } };
  assert.deepEqual(ids(mergeStores(local, remote).musters), ["a"]);
});

test("seeded examples stay on the device, and stay put after a merge", () => {
  const store = { kingdoms: [{ id: "ex", saved: "2026-01-01", seeded: true }, { id: "k", saved: "2026-01-01" }] };
  assert.deepEqual(ids(payloadOf(store).kingdoms), ["k"]);
  const merged = mergeStores(payloadOf(store), { kingdoms: [{ id: "r", saved: "2026-01-02" }] });
  assert.deepEqual(ids(applyMerged(store, merged).kingdoms), ["ex", "k", "r"]);
});
