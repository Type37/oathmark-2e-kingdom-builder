// Detailed Region & City Lore: flavour from Knave 2e's tables, with no rules
// attached. Each region gets a Place Trait and a Location ("Eerie", "Ashland");
// each city gets a City Theme, a Structure, a Street Detail, a Building and a
// Faction ("Bells", "Temple", "Lanterns", "Bakery", "Thieves' guild"). Rolled once
// and kept on the kingdom, so switching the option off and on again shows the
// same kingdom, not a new one.
import { TRAITS, LOCATIONS, CITY_THEMES, STRUCTURES, STREET_DETAILS, BUILDINGS, FACTIONS } from "../knave-places.mjs";
import { territory } from "./kingdom.mjs";

const pick = (list, rand) => list[Math.floor(rand() * list.length)];

export const isCity = (t) => Boolean(territory(t.list, t.name)?.capital);

// The kingdom with any missing flavour rolled in; the same object back when
// nothing was missing, so a caller can tell whether to save.
export function withFlavor(kingdom, rand = Math.random) {
  let changed = false;
  const regionFlavor = { ...(kingdom.regionFlavor ?? {}) };
  for (const r of [1, 2, 3, 4, 5, 6]) {
    if (!regionFlavor[r]) {
      regionFlavor[r] = { trait: pick(TRAITS, rand), location: pick(LOCATIONS, rand) };
      changed = true;
    }
  }
  const territories = (kingdom.territories ?? []).map((t) => {
    if (!isCity(t) || t.flavor) return t;
    changed = true;
    return {
      ...t,
      flavor: {
        theme: pick(CITY_THEMES, rand), structure: pick(STRUCTURES, rand), street: pick(STREET_DETAILS, rand),
        building: pick(BUILDINGS, rand), faction: pick(FACTIONS, rand),
      },
    };
  });
  return changed ? { ...kingdom, regionFlavor, territories } : kingdom;
}
