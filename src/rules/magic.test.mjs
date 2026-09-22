import { test } from "node:test";
import assert from "node:assert/strict";
import { spells, magicItems, spellsFor, spellsKnown, validateSpellChoice } from "./magic.mjs";

test("all six spell lists survived the parse", () => {
  const groups = new Set(spells.map((s) => s.group));
  assert.deepEqual(
    [...groups].sort(),
    ["Dwarf", "Elf", "General", "Goblin and Orc", "Human", "Necromancer"],
  );
});

test("every spell has a casting number in range", () => {
  for (const s of spells) {
    assert.ok(s.cn >= 3 && s.cn <= 10, `${s.name} CN ${s.cn}`);
    assert.ok(s.text.length > 30, `${s.name} text too short`);
  }
});

test("every magic item has a point cost", () => {
  assert.equal(magicItems.length, 13);
  for (const i of magicItems) assert.ok(i.pts > 0 && i.text.length > 30, i.name);
});

test("a caster sees General plus its own race only", () => {
  const elf = spellsFor("elf").map((s) => s.group);
  assert.deepEqual([...new Set(elf)].sort(), ["Elf", "General"]);
  assert.equal(spellsFor("elf").some((s) => s.group === "Dwarf"), false);
});

test("goblins and orcs share one list", () => {
  assert.deepEqual(spellsFor("goblin").map((s) => s.name), spellsFor("orc").map((s) => s.name));
});

test("a necropolis caster uses the Necromancer list as its race", () => {
  const groups = new Set(spellsFor("necropolis").map((s) => s.group));
  assert.deepEqual([...groups].sort(), ["General", "Necromancer"]);
});

test("spells known is level plus two", () => {
  assert.equal(spellsKnown(1), 3);
  assert.equal(spellsKnown(5), 7);
});

test("choosing too many spells fails", () => {
  const names = spellsFor("elf").slice(0, 5).map((s) => s.name);
  const r = validateSpellChoice("elf", 1, names);
  assert.equal(r.ok, false);
  assert.match(r.errors[0], /5 spells chosen, 3 allowed/);
});

test("a spell from another race's list is rejected", () => {
  const dwarfOnly = spells.find((s) => s.group === "Dwarf").name;
  const r = validateSpellChoice("elf", 5, [dwarfOnly]);
  assert.equal(r.ok, false);
  assert.match(r.errors[0], /not on this caster's lists/);
});

test("the same spell twice is rejected", () => {
  const n = spellsFor("human")[0].name;
  const r = validateSpellChoice("human", 3, [n, n]);
  assert.equal(r.ok, false);
  assert.match(r.errors.join(" "), /chosen twice/);
});

test("a legal choice passes", () => {
  const names = spellsFor("dwarf").slice(0, 3).map((s) => s.name);
  assert.deepEqual(validateSpellChoice("dwarf", 1, names).errors, []);
});
