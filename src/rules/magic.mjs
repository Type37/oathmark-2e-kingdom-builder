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

// Level plus two (p83), and one more for a caster wearing the Ring of
// Spellcasting (p205).
const knowsOneMore = (item) => /^ring of spellcasting$/i.test(item?.name ?? "");
export function spellsKnown(level, magicItem) {
  return level + 2 + (knowsOneMore(magicItem) ? 1 : 0);
}

export function validateSpellChoice(race, level, chosen = [], magicItem) {
  const allowed = new Set(spellsFor(race).map((s) => s.name));
  const errors = [];
  const limit = spellsKnown(level, magicItem);
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

const is = (item, name) => (item?.name ?? "").toLowerCase() === name;
const levelOf = (attrs, name) => {
  const hit = attrs.find((a) => a === name || a.startsWith(`${name} (`));
  if (!hit) return 0;
  return Number(hit.match(/\((\d+)\)/)?.[1] ?? 1);
};
// Raise a levelled ability by one, or grant it at 1, never past max.
const raise = (attrs, name, max = Infinity) => {
  const n = Math.min(levelOf(attrs, name) + 1, max);
  const rest = attrs.filter((a) => !(a === name || a.startsWith(`${name} (`)));
  return [...rest, `${name} (${n})`];
};
const grant = (attrs, name) => (attrs.includes(name) ? attrs : [...attrs, name]);

// Who an item works for (Appendix C, p204). Carrying it anyway buys nothing.
export function itemFits(item, variant) {
  const has = (name) => levelOf(variant?.attributes ?? [], name) > 0;
  if (["golden string bow", "sword of starsilver", "sword of flames"].some((n) => is(item, n)) && !has("Champion"))
    return { ok: false, why: "Needs the Champion attribute" };
  if (is(item, "sceptre of command") && !has("Command")) return { ok: false, why: "Needs the Command attribute" };
  if (is(item, "ring of spellcasting") && !has("Spellcaster")) return { ok: false, why: "Needs the Spellcaster attribute" };
  if (is(item, "crown of regeneration") && has("Undead")) return { ok: false, why: "Undead cannot use it" };
  return { ok: true, why: "" };
}

// What an item does to the profile of the figure carrying it.
export function applyItem(variant, item) {
  if (!item || !itemFits(item, variant).ok) return variant;
  let attrs = variant.attributes;
  if (is(item, "boots of striding")) attrs = grant(attrs, "Nimble");
  if (is(item, "cloak of discorporation")) attrs = grant(attrs, "Discorporate");
  // "Not cumulative with other sources": a figure that regenerates already gains nothing.
  if (is(item, "crown of regeneration") && !levelOf(attrs, "Regenerate")) attrs = [...attrs, "Regenerate (1)"];
  if (is(item, "ring of shielding")) attrs = raise(attrs, "Shielding", 3);
  if (is(item, "banner of courage")) attrs = raise(attrs, "Courage");
  return attrs === variant.attributes ? variant : { ...variant, attributes: attrs };
}

// The Banner of Courage is the one item that reaches the whole unit.
export function applyGuestItem(variant, guestItem) {
  return is(guestItem, "banner of courage") ? { ...variant, attributes: raise(variant.attributes, "Courage") } : variant;
}
