import data from "../data/oathmark.json" with { type: "json" };

export const spells = data.spells;
export const magicItems = data.magicItems;

// A caster draws from the General list plus its own race, p191. Necromancers
// use the Necromancer list as their race.
const RACE_LIST = {
  dwarf: "Dwarf", elf: "Elf", goblin: "Goblin and Orc", orc: "Goblin and Orc",
  human: "Human", necropolis: "Necromancer",
};

export function spellsFor(race) {
  const own = RACE_LIST[race];
  return spells.filter((s) => s.group === "General" || s.group === own);
}

export function spellsKnown(level) {
  return level + 2;
}

export function validateSpellChoice(race, level, chosen = []) {
  const allowed = new Set(spellsFor(race).map((s) => s.name));
  const errors = [];
  const limit = spellsKnown(level);
  if (chosen.length > limit) errors.push(`${chosen.length} spells chosen, ${limit} allowed`);
  for (const name of chosen) {
    if (!allowed.has(name)) errors.push(`${name} is not on this caster's lists`);
  }
  if (new Set(chosen).size !== chosen.length) errors.push("The same spell is chosen twice");
  return { ok: errors.length === 0, errors, limit };
}

export function itemsFor() {
  return magicItems;
}
