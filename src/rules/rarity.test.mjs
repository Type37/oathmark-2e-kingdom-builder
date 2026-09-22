// Every rarity rule of kingdom building, cited to the printed page of Oathmark 2e.
import { test } from "node:test";
import assert from "node:assert/strict";
import { canPlace, validateKingdom, maxRarity, LISTS, territory } from "./kingdom.mjs";
import data from "../data/oathmark.json" with { type: "json" };

const ok = (capitalList, region, list, name) => canPlace({ capitalList, region, list, name }).ok;

test("p17: Beginner fills 1-2, Moderate 1-3, Expert 1-4", () => {
  const base = { capitalList: "dwarf", territories: [{ region: 1, list: "dwarf", name: "Dwarf City" }] };
  assert.match(validateKingdom({ ...base, level: "beginner" }).errors.join(), /Region 2: 0 of 2/);
  assert.match(validateKingdom({ ...base, level: "expert" }).errors.join(), /Region 4: 0 of 4/);
});

test("p17: a territory outside the level's regions is flagged", () => {
  const k = {
    level: "beginner", capitalList: "dwarf",
    territories: [
      { region: 1, list: "dwarf", name: "Dwarf City" },
      { region: 2, list: "dwarf", name: "Forges" },
      { region: 2, list: "dwarf", name: "Forges" },
      { region: 3, list: "dwarf", name: "Tarns" },
    ],
  };
  assert.match(validateKingdom(k).errors.join(), /Region 3: not in a beginner kingdom/);
});

test("p17: an unknown level is an error, not a crash", () => {
  assert.equal(validateKingdom({ level: "legendary", capitalList: "dwarf", territories: [] }).ok, false);
});

test("p17: the capital is one of the six cities, from the capital list", () => {
  for (const list of LISTS.filter((l) => l !== "unaligned")) {
    const caps = data.territories[list].filter((t) => t.capital);
    assert.equal(caps.length, 1, list);
    assert.equal(caps[0].rarity, 1, list);
    assert.ok(ok(list, 1, list, caps[0].name));
  }
  assert.equal(ok("dwarf", 1, "unaligned", "Ancient Ruins"), false);
  const wrong = validateKingdom({ level: "beginner", capitalList: "dwarf", territories: [
    { region: 1, list: "elf", name: "Elf City" },
    { region: 2, list: "dwarf", name: "Forges" }, { region: 2, list: "dwarf", name: "Forges" }] });
  assert.match(wrong.errors.join(), /Capital mismatch/);
});

test("p18: Region 2 takes own list (2) or less, other lists (1) only", () => {
  assert.equal(maxRarity(2, true), 2);
  assert.equal(maxRarity(2, false), 1);
  assert.ok(ok("dwarf", 2, "dwarf", "Lumber Yard"));
  assert.equal(ok("dwarf", 2, "dwarf", "Hermitages"), false);
  for (const city of ["Human City", "Elf City", "Goblin City", "Orc City", "Necropolis"]) {
    const list = LISTS.find((l) => territory(l, city));
    assert.ok(ok("dwarf", 2, list, city), city);
  }
  assert.equal(ok("dwarf", 2, "necropolis", "Graveyard"), false);
});

test("p18: Region 3 takes own list (3) or less, any list (2) or less", () => {
  assert.equal(maxRarity(3, true), 3);
  assert.equal(maxRarity(3, false), 2);
  assert.ok(ok("dwarf", 3, "dwarf", "Snowcapped Mountains")); // p40 example
  assert.ok(ok("dwarf", 3, "human", "Plains"));
  assert.equal(ok("dwarf", 3, "dwarf", "Moors"), false);
  assert.equal(ok("dwarf", 3, "human", "Monastery"), false);
});

test("p18: Region 4 takes own list (4) or less, any list (3) or less", () => {
  assert.equal(maxRarity(4, true), 4);
  assert.equal(maxRarity(4, false), 3);
  assert.ok(ok("necropolis", 4, "necropolis", "Crypt"));
  assert.ok(ok("necropolis", 4, "human", "Monastery"));
  assert.equal(ok("necropolis", 4, "human", "Rocky Mountains"), false);
});

test("p18: rarity (5) and (6) cannot be taken at creation; Regions 5-6 are campaign only", () => {
  for (const [list, name] of [["elf", "Hill Caves"], ["goblin", "Poisonous Swamps"],
                              ["necropolis", "Endless Tunnels"], ["unaligned", "Glade"], ["unaligned", "High Fells"]]) {
    for (const region of [2, 3, 4]) assert.equal(ok(list === "unaligned" ? "elf" : list, region, list, name), false);
  }
  assert.equal(canPlace({ capitalList: "elf", region: 5, list: "elf", name: "Forests" }).reason, "Campaign only: found the kingdom first");
  assert.equal(canPlace({ capitalList: "elf", region: 4, list: "elf", name: "Hill Caves" }).reason, "Campaign only");
});

test("p18/p22: unaligned territories use the printed rarity for any capital", () => {
  for (const cap of LISTS.filter((l) => l !== "unaligned")) {
    assert.equal(ok(cap, 2, "unaligned", "Ancient Ruins"), false, cap);
    assert.ok(ok(cap, 3, "unaligned", "Ancient Ruins"), cap);
    assert.equal(ok(cap, 3, "unaligned", "Caverns"), false, cap);
    assert.ok(ok(cap, 4, "unaligned", "Caverns"), cap);
  }
});

test("p17: a terrain printed on the capital's own list counts as same-list, whichever copy is picked", () => {
  // Dark Hills (2) and Rivers (3) appear on both the Goblin and Orc lists (p21).
  assert.ok(ok("orc", 2, "goblin", "Dark Hills"));
  assert.ok(ok("goblin", 2, "orc", "Dark Hills"));
  assert.ok(ok("orc", 3, "goblin", "Rivers"));
  assert.equal(ok("elf", 2, "goblin", "Dark Hills"), false);
  assert.equal(ok("elf", 3, "orc", "Rivers"), false);
});

test("p35: the same terrain may be taken more than once", () => {
  const k = { level: "beginner", capitalList: "dwarf", territories: [
    { region: 1, list: "dwarf", name: "Dwarf City" },
    { region: 2, list: "dwarf", name: "Dwarf City" },
    { region: 2, list: "dwarf", name: "Dwarf City" }] };
  assert.deepEqual(validateKingdom(k).errors, []);
});

test("changing the capital re-checks every territory under the new lens", () => {
  const k = { level: "beginner", capitalList: "dwarf", territories: [
    { region: 1, list: "dwarf", name: "Dwarf City" },
    { region: 2, list: "dwarf", name: "Forges" }, { region: 2, list: "human", name: "Human City" }] };
  assert.equal(validateKingdom(k).ok, true);
  const moved = { ...k, capitalList: "human", territories: [
    { region: 1, list: "human", name: "Human City" }, ...k.territories.slice(1, 2),
    { region: 2, list: "dwarf", name: "Dwarf City" }] };
  assert.match(validateKingdom(moved).errors.join(), /Rarity 2: needs Region 3/);
});

// Rarities as printed on pp20-22.
const BOOK = {
  dwarf: { "Dwarf City": 1, Forges: 2, "Mountain Passes": 2, "Lumber Yard": 2, Hermitages: 3,
    "Dwarf Wainwrights": 3, "Snowcapped Mountains": 3, Tarns: 3, Moors: 4 },
  elf: { "Elf City": 1, "Silver Mines": 2, Forests: 2, Grasslands: 2, "Elf Wainwrights": 3, Kennels: 3,
    Towers: 3, Outposts: 3, "Dark Forests": 3, "Hill Caves": 5 },
  goblin: { "Goblin City": 1, "Slave Camps": 2, "Dark Hills": 2, "Ruined Villages": 2,
    "Goblin Wainwrights": 3, Warrens: 3, Rivers: 3, "Poisonous Swamps": 5 },
  human: { "Human City": 1, "Iron Mines": 2, Barrens: 2, Plains: 2, "Timber Mills": 2,
    "Human Wainwrights": 3, Monastery: 3, "Rough Hills": 3, "Sea Caves": 4, "Rocky Mountains": 4 },
  orc: { "Orc City": 1, Smithies: 2, "Dark Hills": 2, "Ruined Towns": 2, "Orc Wainwrights": 3,
    Dungeons: 3, Rivers: 3 },
  necropolis: { Necropolis: 1, Graveyard: 2, Catacombs: 2, Sepulchre: 2, Tomb: 2, Mausoleum: 2,
    "Dark Tower": 3, "Ash Wastes": 3, Barrows: 4, Crypt: 4, "Endless Tunnels": 5 },
  unaligned: { "Ancient Ruins": 3, Glade: 6, Caverns: 4, "High Fells": 6 },
};

test("pp20-22: territory data matches the printed lists and rarities", () => {
  assert.deepEqual(Object.keys(data.territories).sort(), Object.keys(BOOK).sort());
  for (const [list, want] of Object.entries(BOOK)) {
    const got = Object.fromEntries(data.territories[list].map((t) => [t.name, t.rarity]));
    assert.deepEqual(got, want, list);
  }
});
