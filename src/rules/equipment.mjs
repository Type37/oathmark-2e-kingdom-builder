// The Equipment line of a stat block, explained in the book's own words:
// the Figure Stats bullet on p43 and the range table on p72.
const WORN = "All costs and bonuses for a figure's equipment are already worked into their stats.";
const CARRIED =
  "It is necessary to note which figures carry missile weapons, such as bows or slings, as only these figures may make shooting attacks.";
const ANY_WEAPON =
  "A hand weapon or two-handed weapon can refer to any type of weapon and can be represented by swords, axes, clubs, or flails on a model.";

export const equipment = {
  "Hand Weapon": { text: ANY_WEAPON, page: 43 },
  "Two-Handed Weapon": { text: ANY_WEAPON, page: 43 },
  Spear: {
    text: "Spears are listed separately, as these figures generally have the special ability Brace.",
    page: 43,
    attribute: "Brace",
  },
  Shield: { text: WORN, page: 43, attribute: "Shielding" },
  "Light Armour": { text: WORN, page: 43 },
  "Heavy Armour": { text: WORN, page: 43 },
  Bow: { text: CARRIED, page: 43, range: { min: "None", max: '20"' } },
  "Elf Bow": { text: CARRIED, page: 43, range: { min: "None", max: '22"' } },
  Sling: { text: CARRIED, page: 43, range: { min: '2"', max: '12"' } },
};

// Equipment lines carry the odd aside, e.g. "Hunt Master: Hand Weapon; Dogs: None".
export function equipmentParts(line) {
  return String(line)
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const label = part.replace(/^.*?:\s*/, "").trim();
      const entry = Object.keys(equipment).find((k) => k.toLowerCase() === label.toLowerCase());
      return { part, label, entry: entry ? { name: entry, ...equipment[entry] } : null };
    });
}
