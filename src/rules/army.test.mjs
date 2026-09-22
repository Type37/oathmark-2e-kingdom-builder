import { test } from "node:test";
import assert from "node:assert/strict";
import { formation, sizeRule, canJoin, crewOf, unitProfile, isMonster } from "./army.mjs";
import { figureById } from "./kingdom.mjs";
import { validateArmy } from "./muster.mjs";

const soldiers = figureById.get("human-soldiers");
const general = figureById.get("human-general");
const dwarfChampion = figureById.get("dwarf-champion");
const catapult = figureById.get("human-light-catapult");

test("unit sizes follow the base, p44", () => {
  assert.deepEqual(sizeRule(soldiers), { max: 20, rank: 5 });
  assert.equal(formation(soldiers, 13), "2 ranks of 5 + 3");
  assert.equal(formation(soldiers, 20), "4 ranks of 5");
});

test("a character counts towards the unit maximum, p81", () => {
  const units = [
    { uid: "h", figureId: "human-soldiers", count: 19 },
    { uid: "c", figureId: "human-general", count: 1, joinedTo: "h" },
  ];
  const p = unitProfile(units[0], units);
  assert.equal(p.bodies, 20);
  assert.equal(p.charFig.name, general.name);
});

test("a champion only joins its own race, p83", () => {
  assert.equal(canJoin(soldiers, dwarfChampion).ok, false);
  assert.equal(canJoin(soldiers, general).ok, true);
});

test("artillery takes no character and has fixed crew, p84", () => {
  assert.equal(canJoin(catapult, general).ok, false);
  assert.ok(crewOf(catapult) > 0);
});

test("an over-full unit is reported", () => {
  const kingdom = {
    level: "moderate", capitalList: "human",
    territories: [{ region: 1, list: "human", name: "Human City" }],
  };
  const units = [
    { uid: "h", figureId: "human-soldiers", count: 20 },
    { uid: "c", figureId: "human-general", count: 1, joinedTo: "h" },
  ];
  const r = validateArmy(kingdom, { points: 5000, units });
  assert.ok(r.errors.some((e) => /21 figures, max 20/.test(e)), r.errors.join("; "));
});

test("a founded kingdom may grow into Regions 5 and 6, p37", async () => {
  const { canPlace, startComplete } = await import("./kingdom.mjs");
  const start = { capitalList: "elf", region: 5, list: "elf", name: "Hill Caves" };
  assert.equal(canPlace(start).ok, false);
  assert.equal(canPlace({ ...start, founded: true }).ok, true);
  const k = {
    level: "beginner", capitalList: "elf",
    territories: [
      { region: 1, list: "elf", name: "Elf City" },
      { region: 2, list: "elf", name: "Forests" },
      { region: 2, list: "elf", name: "Silver Mines" },
    ],
  };
  assert.equal(startComplete(k), true);
  assert.equal(startComplete({ ...k, territories: k.territories.slice(0, 2) }), false);
});

test("a campaign territory must share a border with unoccupied ground, p37", async () => {
  const { canPlace, sharesBorder } = await import("./kingdom.mjs");
  const kingdom = {
    founded: true, level: "expert", capitalList: "elf",
    territories: [
      { region: 1, list: "elf", name: "Elf City" },
      { region: 4, list: "elf", name: "Outposts" },
    ],
  };
  assert.equal(sharesBorder(kingdom, 5), true);
  const cut = { ...kingdom, territories: kingdom.territories.map((t) => ({ ...t, occupied: true })) };
  assert.equal(sharesBorder(cut, 5), false);
  assert.equal(canPlace({
    capitalList: "elf", region: 5, list: "elf", name: "Hill Caves", founded: true, kingdom: cut,
  }).ok, false);
});
