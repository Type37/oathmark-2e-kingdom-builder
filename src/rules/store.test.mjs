import { test } from "node:test";
import assert from "node:assert/strict";
import {
  emptyStore, normalise, save, get, list, remove, duplicate,
  setActive, activeRecord, toFile, fromFile, merge, SCHEMA,
} from "./store.mjs";

test("a fresh store carries the schema and three empty kinds", () => {
  const s = emptyStore();
  assert.equal(s.schema, SCHEMA);
  for (const k of ["kingdoms", "collections", "musters"]) assert.deepEqual(s[k], []);
});

test("normalise repairs a partial or legacy record", () => {
  const s = normalise({ kingdoms: null, stray: 1 });
  assert.deepEqual(s.kingdoms, []);
  assert.equal(s.schema, SCHEMA);
  assert.equal(s.stray, 1, "unknown keys survive");
});

test("save assigns an id, stamps it, and makes it active", () => {
  const s = save(emptyStore(), "kingdoms", { name: "Grundeland" });
  const rec = s.kingdoms[0];
  assert.ok(rec.id);
  assert.ok(rec.saved);
  assert.equal(s.active.kingdoms, rec.id);
});

test("saving the same id replaces rather than appends", () => {
  let s = save(emptyStore(), "kingdoms", { name: "A" });
  const id = s.kingdoms[0].id;
  s = save(s, "kingdoms", { id, name: "A renamed" });
  assert.equal(s.kingdoms.length, 1);
  assert.equal(get(s, "kingdoms", id).name, "A renamed");
});

test("remove drops the record and clears it as active", () => {
  let s = save(emptyStore(), "kingdoms", { name: "A" });
  const id = s.kingdoms[0].id;
  s = remove(s, "kingdoms", id);
  assert.equal(s.kingdoms.length, 0);
  assert.equal(s.active.kingdoms, undefined);
});

test("duplicate copies the payload under a new id", () => {
  let s = save(emptyStore(), "kingdoms", { name: "Vasala", territories: [1, 2] });
  s = duplicate(s, "kingdoms", s.kingdoms[0].id);
  assert.equal(s.kingdoms.length, 2);
  const copy = s.kingdoms.find((r) => r.name.endsWith("copy"));
  assert.deepEqual(copy.territories, [1, 2]);
  assert.notEqual(copy.id, s.kingdoms[0].id);
});

test("list returns newest first", () => {
  let s = save(emptyStore(), "musters", { name: "old" });
  s.musters[0].saved = "2020-01-01T00:00:00Z";
  s = save(s, "musters", { name: "new" });
  assert.equal(list(s, "musters")[0].name, "new");
  assert.equal(list(s, "musters")[1].name, "old");
});

test("active tracking round-trips", () => {
  let s = save(emptyStore(), "collections", { name: "Shelf" });
  const id = s.collections[0].id;
  s = setActive(s, "collections", id);
  assert.equal(activeRecord(s, "collections").name, "Shelf");
});

test("a whole store survives export and import", () => {
  let s = save(emptyStore(), "kingdoms", { name: "Grundeland" });
  s = save(s, "musters", { name: "500pt raid", units: [] });
  const { store, record } = fromFile(toFile(s));
  assert.equal(record, null);
  assert.equal(store.kingdoms[0].name, "Grundeland");
  assert.equal(store.musters[0].name, "500pt raid");
});

test("a single shared record imports on its own", () => {
  const { store, record } = fromFile(JSON.stringify({ name: "Solo", territories: [] }));
  assert.equal(store, null);
  assert.equal(record.name, "Solo");
});

test("an unrecognised file is rejected", () => {
  assert.throws(() => fromFile('{"hello":"world"}'), /Unrecognised file/);
});

test("merge keeps both copies when ids clash", () => {
  let mine = save(emptyStore(), "kingdoms", { name: "Mine" });
  const id = mine.kingdoms[0].id;
  const theirs = { kingdoms: [{ id, name: "Theirs" }] };
  const out = merge(mine, theirs);
  assert.equal(out.kingdoms.length, 2);
  assert.ok(out.kingdoms.some((k) => k.name === "Theirs imported"));
});

import { parseImport, KingdomSchema } from "./schema.mjs";

test("a valid kingdom file parses and fills defaults", () => {
  const { kind, value } = parseImport(
    JSON.stringify({ name: "Grundeland", level: "beginner", territories: [] }),
  );
  assert.equal(kind, "kingdoms");
  assert.deepEqual(value.chronicle, []);
  assert.deepEqual(value.collection, {});
});

test("a bad region number is rejected", () => {
  const r = KingdomSchema.safeParse({
    territories: [{ region: 9, list: "dwarf", name: "Dwarf City" }],
  });
  assert.equal(r.success, false);
});

test("a whole store file is recognised as a store", () => {
  const { kind, value } = parseImport(
    JSON.stringify({ kingdoms: [{ name: "A" }], musters: [], collections: [] }),
  );
  assert.equal(kind, "store");
  assert.equal(value.kingdoms[0].name, "A");
});

test("junk is rejected with a clear message", () => {
  assert.throws(() => parseImport('{"nonsense":true}'), /does not match any Oathmark record/);
});

test("an empty object is not silently treated as a kingdom", () => {
  assert.throws(() => parseImport("{}"), /does not match any Oathmark record/);
});

test("an array is rejected", () => {
  assert.throws(() => parseImport("[1,2,3]"), /does not match any Oathmark record/);
});

test("a muster file is told apart from a kingdom file", () => {
  const { kind } = parseImport(JSON.stringify({ units: [{ figureId: "dwarf-soldiers", count: 20 }] }));
  assert.equal(kind, "musters");
});

test("a collection file is told apart too", () => {
  const { kind, value } = parseImport(JSON.stringify({ owned: { "dwarf-soldiers": 20 } }));
  assert.equal(kind, "collections");
  assert.equal(value.owned["dwarf-soldiers"], 20);
});
