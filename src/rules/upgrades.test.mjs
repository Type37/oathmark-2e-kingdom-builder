import { test } from "node:test";
import assert from "node:assert/strict";
import { figureById } from "./kingdom.mjs";
import {
  upgradeCost, upgradeAvailable, upgradesFor, upgradeConflicts, applyUpgrades,
} from "./upgrades.mjs";

const elfKingdom = {
  level: "moderate", capitalList: "elf",
  territories: [
    { region: 1, list: "elf", name: "Elf City" },
    { region: 2, list: "elf", name: "Silver Mines" },
    { region: 2, list: "elf", name: "Forests" },
    { region: 3, list: "elf", name: "Elf Wainwrights" },
    { region: 3, list: "elf", name: "Towers" },
    { region: 3, list: "elf", name: "Grasslands" },
  ],
};

test("every figure option parsed into an upgrade", () => {
  let n = 0;
  for (const f of figureById.values()) n += (f.upgrades ?? []).length;
  assert.equal(n, 73);
});

test("option text keeps its whole tail", () => {
  const king = figureById.get("elf-king-or-queen");
  const chariot = king.upgrades.find((u) => u.name === "Chariot");
  assert.deepEqual(chariot.adds, [
    "Charge (1)", "Wild Charge", "Large", "Limited Manoeuvres", "Limited Movement",
  ]);
  assert.equal(chariot.base, "50 x 100");
  assert.equal(chariot.pts, 80);
});

test("a flat cost reads straight off the option", () => {
  const horse = figureById.get("elf-king-or-queen").upgrades.find((u) => u.name === "Horse");
  assert.equal(upgradeCost(horse), 40);
});

test("a level-scaled cost picks the band for that level", () => {
  const horse = figureById.get("necromancer").upgrades.find((u) => u.name === "Horse");
  assert.equal(upgradeCost(horse, 1), 20);
  assert.equal(upgradeCost(horse, 2), 30);
  assert.equal(upgradeCost(horse, 3), 30);
  assert.equal(upgradeCost(horse, 4), 40);
  assert.equal(upgradeCost(horse, 5), 40);
});

test("a Wainwrights prerequisite is checked against the kingdom", () => {
  const chariot = figureById.get("elf-king-or-queen").upgrades.find((u) => u.name === "Chariot");
  assert.equal(upgradeAvailable(elfKingdom, chariot), true);
  const without = { ...elfKingdom, territories: elfKingdom.territories.filter((t) => t.name !== "Elf Wainwrights") };
  assert.equal(upgradeAvailable(without, chariot), false);
});

test("upgradesFor flags availability per kingdom", () => {
  const ups = upgradesFor(elfKingdom, "elf-king-or-queen");
  assert.equal(ups.length, 2);
  assert.ok(ups.every((u) => u.available));
});

test("a mount and a chariot cannot both apply", () => {
  const ups = figureById.get("elf-king-or-queen").upgrades;
  assert.equal(upgradeConflicts(ups).length, 1);
  assert.deepEqual(upgradeConflicts([ups[0]]), []);
});

test("applying an upgrade rewrites the stat line", () => {
  const king = figureById.get("elf-king-or-queen");
  const chariot = king.upgrades.find((u) => u.name === "Chariot");
  const v = applyUpgrades(king.variants[0], [chariot]);
  assert.equal(v.M, 7);
  assert.equal(v.D, 13);
  assert.equal(v.base, "50 x 100");
  assert.ok(v.attributes.includes("Wild Charge"));
  assert.ok(v.attributes.includes("Eldest"), "original attributes survive");
  assert.equal(king.variants[0].M, 6, "the source variant is untouched");
});

test("the Lich upgrade adds Undead for 20pts", () => {
  const lich = figureById.get("necromancer").upgrades.find((u) => u.name === "Lich");
  assert.equal(upgradeCost(lich), 20);
  assert.deepEqual(lich.adds, ["Undead"]);
});
