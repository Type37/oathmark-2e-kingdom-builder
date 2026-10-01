import { test } from "node:test";
import assert from "node:assert/strict";
import { withFlavor, isCity } from "./flavor.mjs";
import { TRAITS, LOCATIONS, CITY_THEMES, STRUCTURES, STREET_DETAILS, BUILDINGS, FACTIONS } from "../knave-places.mjs";

const kingdom = {
  territories: [
    { region: 1, list: "dwarf", name: "Dwarf City" },
    { region: 2, list: "dwarf", name: "Forges" },
  ],
};

test("every region past the capital gets a Knave place trait and location", () => {
  const k = withFlavor(kingdom);
  assert.equal(k.regionFlavor[1], undefined);
  for (const r of [2, 3, 4, 5, 6]) {
    assert.ok(TRAITS.includes(k.regionFlavor[r].trait));
    assert.ok(LOCATIONS.includes(k.regionFlavor[r].location));
  }
});

test("a city gets a theme, structure, street detail, building and faction; other terrain gets none", () => {
  const [city, forges] = withFlavor(kingdom).territories;
  assert.equal(isCity(city), true);
  assert.ok(CITY_THEMES.includes(city.flavor.theme));
  assert.ok(STRUCTURES.includes(city.flavor.structure));
  assert.ok(STREET_DETAILS.includes(city.flavor.street));
  assert.ok(BUILDINGS.includes(city.flavor.building));
  assert.ok(FACTIONS.includes(city.flavor.faction));
  assert.equal(forges.flavor, undefined);
});

test("flavour is rolled once: a kingdom that has it comes back unchanged", () => {
  const once = withFlavor(kingdom);
  assert.equal(withFlavor(once), once);
});

test("no table entry only points at another table", () => {
  for (const list of [TRAITS, LOCATIONS, CITY_THEMES, STRUCTURES, STREET_DETAILS, BUILDINGS, FACTIONS]) {
    assert.ok(list.length >= 80);
    assert.ok(list.every((w) => !w.includes("(")));
  }
});
