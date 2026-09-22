import { test } from "node:test";
import assert from "node:assert/strict";
import { figureById } from "./kingdom.mjs";
import {
  combatDice, flankCombatDice, rankBonus, targetNumber, shootTargetNumber,
  moraleModifier, unitStats, armyStats, weaponsOf,
} from "./stats.mjs";

const dwarfSoldier = figureById.get("dwarf-soldiers");
const humanSoldier = figureById.get("human-soldiers");
const humanArcher = figureById.get("human-archers");
const trolls = figureById.get("trolls");

// Round of Combat Example, p69: 20 human soldiers vs 10 dwarf soldiers.
test("the book's combat example reproduces exactly", () => {
  assert.equal(combatDice(humanSoldier, 20), 5, "both units roll 5 dice");
  assert.equal(combatDice(dwarfSoldier, 10), 5);
  // Human TN 5: dwarf Defence 10, -2 Fight, -3 for additional ranks.
  assert.equal(rankBonus(humanSoldier, 20), 3);
  assert.equal(targetNumber(humanSoldier, 20, 10), 5);
  // Dwarf TN 6: human Defence 9, -2 Fight, -1 for an additional rank.
  assert.equal(rankBonus(dwarfSoldier, 10), 1);
  assert.equal(targetNumber(dwarfSoldier, 10, 9), 6);
});

// Shooting Attack Example, p76: 20 human archers, 4 full ranks, -3 bonus.
test("the book's shooting example reproduces exactly", () => {
  assert.equal(combatDice(humanArcher, 20), 5);
  assert.equal(rankBonus(humanArcher, 20), 3);
  // Dwarf Defence 10 - Shoot 2 - 3 ranks = 5 before cover and range.
  assert.equal(shootTargetNumber(humanArcher, 20, 10), 5);
});

test("a 15-figure unit defends its flank with 3 dice", () => {
  // p65: "a unit of 15 dwarf infantry defending its flank or rear rolls 3 Combat Dice"
  assert.equal(flankCombatDice(dwarfSoldier, 15), 3);
});

test("combat dice never exceed 5 and never fall below 1", () => {
  assert.equal(combatDice(dwarfSoldier, 20), 5);
  assert.equal(combatDice(dwarfSoldier, 1), 1);
  assert.equal(flankCombatDice(dwarfSoldier, 3), 1, "one partial rank still rolls 1");
});

test("rank bonus tracks complete ranks only", () => {
  assert.equal(rankBonus(dwarfSoldier, 4), 0);
  assert.equal(rankBonus(dwarfSoldier, 5), 0);
  assert.equal(rankBonus(dwarfSoldier, 10), 1);
  assert.equal(rankBonus(dwarfSoldier, 14), 1);
  assert.equal(rankBonus(dwarfSoldier, 15), 2);
  assert.equal(rankBonus(dwarfSoldier, 20), 3);
});

test("morale bonus needs 2 complete ranks on 25x25 bases", () => {
  assert.equal(moraleModifier(dwarfSoldier, 3), -1, "under one full rank");
  assert.equal(moraleModifier(dwarfSoldier, 5), 0);
  assert.equal(moraleModifier(dwarfSoldier, 10), 1);
  // 50x50 creatures need only one complete rank.
  assert.equal(moraleModifier(trolls, 3), 1);
  assert.equal(moraleModifier(trolls, 2), -1);
});

test("unitStats exposes the derived numbers together", () => {
  const s = unitStats({ figureId: "dwarf-soldiers", count: 20 });
  assert.equal(s.frontRank, 5);
  assert.equal(s.fullRanks, 4);
  assert.equal(s.partial, false);
  assert.equal(s.combatDice, 5);
  assert.equal(s.rankBonus, 3);
  assert.equal(s.morale, 1);
  assert.equal(s.health, 20);
  assert.equal(s.shielding, 1);
});

test("weapons resolve from equipment text", () => {
  assert.deepEqual(weaponsOf(humanArcher), ["Bow"]);
  assert.deepEqual(weaponsOf(figureById.get("elf-archers")), ["Elf Bow"]);
  assert.deepEqual(weaponsOf(dwarfSoldier), []);
});

test("army stats aggregate command, champions and shooting", () => {
  const a = armyStats([
    { figureId: "dwarf-king-or-queen", count: 1 },  // Command (2), Champion
    { figureId: "dwarf-soldiers", count: 20 },
    { figureId: "dwarf-archers", count: 20 },
  ]);
  assert.equal(a.units, 3);
  assert.equal(a.figures, 41);
  assert.equal(a.command, 2);
  assert.equal(a.extraActivations, 2);
  assert.equal(a.champions, 1);
  assert.equal(a.shootingDice, 5, "archers only");
  assert.deepEqual(a.ranges, [20]);
  assert.equal(a.bestActivation, 4);
  assert.equal(a.worstActivation, 4);
});

test("spellcaster levels drive spells known", () => {
  const a = armyStats([
    { figureId: "dwarf-spellcaster", count: 1, level: 1 },
    { figureId: "dwarf-spellcaster", count: 1, level: 5 },
  ]);
  assert.deepEqual(a.casters.map((c) => c.spells), [3, 7], "level + 2");
  assert.equal(a.spellsKnown, 10);
});

import { shortfalls, unitsAffordable, collectionTotals, demand } from "./collection.mjs";

test("demand sums figures across duplicate units", () => {
  const d = demand([
    { figureId: "dwarf-soldiers", count: 20 },
    { figureId: "dwarf-soldiers", count: 12 },
    { figureId: "dwarf-archers", count: 10 },
  ]);
  assert.equal(d.get("dwarf-soldiers"), 32);
  assert.equal(d.get("dwarf-archers"), 10);
});

test("shortfalls report what the shelf cannot cover", () => {
  const col = { "dwarf-soldiers": 20, "dwarf-archers": 10 };
  const s = shortfalls(col, [
    { figureId: "dwarf-soldiers", count: 20 },
    { figureId: "dwarf-soldiers", count: 12 },
    { figureId: "dwarf-archers", count: 10 },
  ]);
  assert.equal(s.length, 1);
  assert.equal(s[0].figureId, "dwarf-soldiers");
  assert.equal(s[0].need, 32);
  assert.equal(s[0].have, 20);
  assert.equal(s[0].short, 12);
});

test("an uncollected figure is short by its full requirement", () => {
  assert.deepEqual(
    shortfalls({}, [{ figureId: "trolls", count: 3 }]).map((x) => [x.have, x.short]),
    [[0, 3]],
  );
});

test("unitsAffordable divides by the maximum unit size", () => {
  assert.equal(unitsAffordable({ "dwarf-soldiers": 20 }, "dwarf-soldiers"), 1);
  assert.equal(unitsAffordable({ "dwarf-soldiers": 45 }, "dwarf-soldiers"), 2);
  assert.equal(unitsAffordable({ trolls: 3 }, "trolls"), 1, "50x50 units cap at 3");
  assert.equal(unitsAffordable({ dragon: 1 }, "dragon"), 1, "a 50x100 unit is one figure");
});

test("collection totals price the shelf", () => {
  const t = collectionTotals({ "dwarf-soldiers": 20, "dwarf-archers": 10 });
  assert.equal(t.types, 2);
  assert.equal(t.figures, 30);
  assert.equal(t.points, 20 * 15 + 10 * 15);
});
