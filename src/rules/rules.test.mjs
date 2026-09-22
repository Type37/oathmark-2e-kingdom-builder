import { test } from "node:test";
import assert from "node:assert/strict";
import { canPlace, validateKingdom, figurePool, placeableIn, chariotUnlocked } from "./kingdom.mjs";
import { validateArmy, armyPoints, rollPoints, battleScale } from "./muster.mjs";

// Book example 1, p24. Beginner: Dwarf City capital, Human City + Forges in Region 2.
const grundeland = {
  name: "Grundeland", level: "beginner", capitalList: "dwarf",
  territories: [
    { region: 1, list: "dwarf", name: "Dwarf City" },
    { region: 2, list: "human", name: "Human City" },
    { region: 2, list: "dwarf", name: "Forges" },
  ],
};

// Book example 2, p24. Moderate: Elf City; R2 Silver Mines + Forests;
// R3 Grasslands, Towers, and goblin Dark Hills.
const vasala = {
  name: "Vasala", level: "moderate", capitalList: "elf",
  territories: [
    { region: 1, list: "elf", name: "Elf City" },
    { region: 2, list: "elf", name: "Silver Mines" },
    { region: 2, list: "elf", name: "Forests" },
    { region: 3, list: "elf", name: "Grasslands" },
    { region: 3, list: "elf", name: "Towers" },
    { region: 3, list: "goblin", name: "Dark Hills" },
  ],
};

test("Grundeland validates as the book builds it", () => {
  const r = validateKingdom(grundeland);
  assert.deepEqual(r.errors, []);
  assert.equal(r.placed, 3);
});

test("Vasala validates as the book builds it", () => {
  const r = validateKingdom(vasala);
  assert.deepEqual(r.errors, []);
  assert.equal(r.placed, 6);
});

test("rarity 1 city from another list is legal in Region 2", () => {
  assert.ok(canPlace({ capitalList: "dwarf", region: 2, list: "human", name: "Human City" }).ok);
});

test("rarity 2 from another list is illegal in Region 2", () => {
  const r = canPlace({ capitalList: "dwarf", region: 2, list: "human", name: "Iron Mines" });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "Rarity 2: needs Region 3");
});

test("rarity 2 from your own list is legal in Region 2", () => {
  assert.ok(canPlace({ capitalList: "dwarf", region: 2, list: "dwarf", name: "Forges" }).ok);
});

test("goblin Dark Hills (2) is legal in an elf Region 3", () => {
  assert.ok(canPlace({ capitalList: "elf", region: 3, list: "goblin", name: "Dark Hills" }).ok);
});

test("rarity 3 from another list is illegal in Region 3", () => {
  assert.equal(canPlace({ capitalList: "elf", region: 3, list: "human", name: "Rough Hills" }).ok, false);
});

test("rarity 4 needs your own list in Region 4", () => {
  assert.ok(canPlace({ capitalList: "human", region: 4, list: "human", name: "Sea Caves" }).ok);
  assert.equal(canPlace({ capitalList: "elf", region: 4, list: "human", name: "Sea Caves" }).ok, false);
});

test("unaligned territories ignore the capital lens", () => {
  // Ancient Ruins is rarity (3): legal in Region 3 for any capital.
  assert.ok(canPlace({ capitalList: "elf", region: 3, list: "unaligned", name: "Ancient Ruins" }).ok);
  assert.ok(canPlace({ capitalList: "orc", region: 3, list: "unaligned", name: "Ancient Ruins" }).ok);
});

test("rarity 5 and 6 are unreachable at creation", () => {
  assert.equal(canPlace({ capitalList: "elf", region: 4, list: "elf", name: "Hill Caves" }).ok, false);
  assert.equal(canPlace({ capitalList: "elf", region: 5, list: "unaligned", name: "High Fells" }).ok, false);
});

test("a non-capital territory cannot sit in Region 1", () => {
  assert.equal(canPlace({ capitalList: "dwarf", region: 1, list: "dwarf", name: "Forges" }).ok, false);
});

test("incomplete kingdom reports the shortfall", () => {
  const r = validateKingdom({ ...grundeland, territories: grundeland.territories.slice(0, 2) });
  assert.equal(r.ok, false);
  assert.match(r.errors.join(" "), /Region 2: 1 of 2/);
});

test("Grundeland grants both dwarf and human basic troops", () => {
  const pool = figurePool(grundeland);
  for (const id of ["dwarf-soldiers", "dwarf-spearmen", "human-soldiers", "human-militia",
                    "dwarf-warriors", "dwarf-linebreakers"])
    assert.ok(pool.has(id), `missing ${id}`);
  assert.equal(pool.has("dwarf-border-guards"), false, "Mountain Passes not taken");
});

test("capital-only figures need the territory to be the capital", () => {
  const pool = figurePool(grundeland);
  assert.ok(pool.has("dwarf-king-or-queen"), "dwarf king from the capital");
  // Human City sits in Region 2, so no human king.
  assert.equal(pool.has("human-king-or-queen"), false);
  assert.ok(pool.has("human-general"), "non-capital-only grants still apply");
});

test("duplicate territories stack their maxima", () => {
  const twoCities = {
    level: "beginner", capitalList: "dwarf",
    territories: [
      { region: 1, list: "dwarf", name: "Dwarf City" },
      { region: 2, list: "dwarf", name: "Forges" },
      { region: 2, list: "dwarf", name: "Forges" },
    ],
  };
  assert.equal(figurePool(twoCities).get("dwarf-champion").max, 3); // 1 capital + 1 + 1
});

test("unlimited grants become 4 units from the capital, 2 from elsewhere", () => {
  const pool = figurePool(grundeland);
  assert.equal(pool.get("dwarf-soldiers").maxUnits, 4);
  assert.equal(pool.get("dwarf-warriors").maxUnits, 2);
});

test("spellcaster levels widen with the right territory", () => {
  assert.deepEqual(figurePool(grundeland).get("dwarf-spellcaster").levels, [1, 2]);
  const withHermitages = {
    ...grundeland, level: "moderate",
    territories: [...grundeland.territories,
      { region: 3, list: "dwarf", name: "Hermitages" },
      { region: 3, list: "dwarf", name: "Mountain Passes" },
      { region: 3, list: "dwarf", name: "Tarns" }],
  };
  assert.deepEqual(figurePool(withHermitages).get("dwarf-spellcaster").levels, [1, 2, 3, 4, 5]);
});

test("chariots stay locked without a Wainwrights territory", () => {
  assert.equal(chariotUnlocked(grundeland, "dwarf"), false);
});

test("placeable list shrinks as the region tightens", () => {
  const r2 = placeableIn({ capitalList: "dwarf", region: 2 }).length;
  const r3 = placeableIn({ capitalList: "dwarf", region: 3 }).length;
  assert.ok(r3 > r2, `${r3} should exceed ${r2}`);
});

test("army points add up and report the remainder", () => {
  const army = { points: 750, units: [
    { figureId: "dwarf-soldiers", count: 20 },   // 20 x 15 = 300
    { figureId: "human-soldiers", count: 20 },   // 20 x 12 = 240
  ]};
  assert.equal(armyPoints(army), 540);
  const r = validateArmy(grundeland, army);
  assert.deepEqual(r.errors, []);
  assert.equal(r.remaining, 210);
});

test("a figure not granted by the kingdom is rejected", () => {
  const r = validateArmy(grundeland, { points: 1000, units: [{ figureId: "elf-archers", count: 10 }] });
  assert.match(r.errors.join(" "), /not in this kingdom/);
});

test("the fifth unit of one type is rejected", () => {
  const units = Array.from({ length: 5 }, () => ({ figureId: "dwarf-soldiers", count: 5 }));
  const r = validateArmy(grundeland, { points: 3000, units });
  assert.match(r.errors.join(" "), /max 4 units/);
});

test("three units from a non-capital territory is rejected", () => {
  const units = Array.from({ length: 3 }, () => ({ figureId: "dwarf-warriors", count: 5 }));
  const r = validateArmy(grundeland, { points: 3000, units });
  assert.match(r.errors.join(" "), /max 2 units/);
});

test("unit size cannot exceed the base-size maximum", () => {
  const r = validateArmy(grundeland, { points: 3000, units: [{ figureId: "dwarf-soldiers", count: 21 }] });
  assert.match(r.errors.join(" "), /max 20 figures/);
});

test("the 20% rule uses the book's knucker example", () => {
  const goblinKingdom = {
    level: "expert", capitalList: "goblin",
    territories: [
      { region: 1, list: "goblin", name: "Goblin City" },
      { region: 2, list: "goblin", name: "Slave Camps" },
      { region: 2, list: "goblin", name: "Dark Hills" },
      ...Array.from({ length: 3 }, () => ({ region: 3, list: "goblin", name: "Rivers" })),
      ...Array.from({ length: 4 }, () => ({ region: 4, list: "goblin", name: "Warrens" })),
    ],
  };
  // Poisonous Swamps is rarity (5) so it cannot be taken at creation; grant it
  // the way a campaign win would, to exercise the points rule.
  const withSwamp = { ...goblinKingdom,
    territories: [...goblinKingdom.territories, { region: 5, list: "goblin", name: "Poisonous Swamps" }] };
  const knucker = [{ figureId: "knucker", count: 1 }];
  assert.match(validateArmy(withSwamp, { points: 2000, units: knucker }).errors.join(" "),
    /is over 20%, needing 2500pts/);
  assert.deepEqual(validateArmy(withSwamp, { points: 2500, units: knucker }).errors, []);
});

test("the random points table matches the book", () => {
  assert.equal(rollPoints(1, "moderate"), 500);
  assert.equal(rollPoints(10, "moderate"), 3500);
  assert.equal(rollPoints(10, "expert"), 6000); // 10 + 2 = 12
  assert.equal(rollPoints(1, "expert"), 1000); // 1 + 2 = 3
});

test("Beginner halves the die roll, not the points (p33)", () => {
  assert.equal(rollPoints(10, "beginner"), 1750); // 5: "your largest battle will be 1,750 points"
  assert.equal(rollPoints(9, "beginner"), 1750); // 4.5 rounds up to 5
  assert.equal(rollPoints(3, "beginner"), 750); // 1.5 rounds up to 2
  assert.equal(rollPoints(1, "beginner"), 500);
});

test("each points value names its scale of battle", () => {
  assert.equal(battleScale(500), "Minor Skirmish");
  assert.equal(battleScale(2500), "Pitched Battle");
  assert.equal(battleScale(6000), "Epic Battle");
  assert.equal(battleScale(1234), null);
});

import { EXAMPLE_KINGDOMS, loadExample } from "./examples.mjs";

test("both example kingdoms validate as the book builds them", () => {
  for (const e of EXAMPLE_KINGDOMS) {
    const r = validateKingdom(loadExample(e.id));
    assert.deepEqual(r.errors, [], `${e.name}: ${r.errors.join("; ")}`);
  }
});

test("each example ships an opening chronicle entry", () => {
  for (const e of EXAMPLE_KINGDOMS) {
    assert.ok(e.chronicle.length >= 1);
    assert.equal(e.chronicle[0].year, 1);
    assert.ok(e.ruler);
  }
});
