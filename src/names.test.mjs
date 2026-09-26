import { test } from "node:test";
import assert from "node:assert/strict";
import { CULTURES, HOMELANDS, NAMES, cultureOf, rulerPool, rollKingdom } from "./names.mjs";

test("every homeland has a culture with rulers", () => {
  for (const [n, c] of HOMELANDS) assert.ok(CULTURES[c]?.rulers.length, `${n} → ${c}`);
});

test("a rolled kingdom's ruler comes from its culture", () => {
  for (let i = 0; i < 200; i++) {
    const k = rollKingdom();
    assert.ok(NAMES.kingdom.includes(k.name));
    assert.ok(rulerPool(k.culture).includes(k.ruler), `${k.name}: ${k.ruler}`);
  }
});

test("known homelands resolve to the book's culture", () => {
  assert.equal(cultureOf("Salisbury"), "cymric");     // KL p22
  assert.equal(cultureOf("London"), "roman");         // KL p22
  assert.equal(cultureOf("Jylland"), "danish");       // KL p82, in its older form
  assert.equal(cultureOf("Grundeland"), null);        // Oathmark realms are not in the pools
  assert.equal(cultureOf("Nowhere"), null);
});

test("Pict rulers include Cymric women (KL p26), Roman women take -ia (KL p27)", () => {
  assert.ok(rulerPool("pict").includes("Nest"));
  assert.ok(rulerPool("roman").includes("Arcavia"));
  assert.ok(!rulerPool("roman").some((n) => n.endsWith("rixia")));
});

test("British names join the Cymri and Saxon names the Saxons, once each (HN)", () => {
  assert.ok(rulerPool("cymric").includes("Vortigern"));
  assert.ok(rulerPool("saxon").includes("Aethelfrith"));
  assert.ok(!rulerPool("saxon").includes("Horse"));
  for (const c of ["cymric", "saxon"]) assert.equal(new Set(rulerPool(c)).size, rulerPool(c).length);
});

test("the roll draws a culture first, so every culture comes up", () => {
  const seen = new Set();
  for (let i = 0; i < 2000; i++) seen.add(rollKingdom().culture);
  assert.equal(seen.size, Object.keys(CULTURES).length);
});

test("plainly modern places take their older forms", () => {
  assert.equal(cultureOf("Egypt"), null);
  assert.equal(cultureOf("Syria"), null);
  assert.equal(cultureOf("Antiochia"), "byzantine");
  assert.equal(cultureOf("Mediolanum"), "italian");
  assert.equal(cultureOf("Azagouc"), "zazamanc");
  assert.equal(cultureOf("Patelamunt"), "zazamanc");
});
