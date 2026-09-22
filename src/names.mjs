// Name pools for the roll buttons. Every entry is printed in a published book
// the owner has, with its page; nothing here is invented. See notes/name-pools.md.
//   DR = Dragon Rampant, second edition (Osprey Games), Daniel Mersey
//   KL = The Book of Knights & Ladies (Pendragon 5th ed., 2007), in bkl-names.mjs
// Page numbers are the books' printed page numbers.
import { BKL_CULTURES, BKL_HOMELANDS } from "./bkl-names.mjs";

const KINGDOM = [
  ["Barbarica", "DR p203"],
  ["Ukkert", "DR p174"],
  ["the Foul-Wind Pass", "DR p16"],
  ["Hacky Valley", "DR p176"],
  ["the Plains of Doom", "DR p171"],
  ["the Shining Citadel", "DR p216"],
  ["the Frozen City", "DR p225"],
];

const ARMY = [
  ["Rottingutt's Malodorous Goblins of the Foul-Wind Pass", "DR p16"],
  ["Knights of the Shining Citadel", "DR p216"],
  ["Wizards of the Frozen City", "DR p225"],
  ["The Nine Travellers", "DR p224"],
  ["Men of the North", "DR p218"],
  ["Men of the West", "DR p219"],
  ["Sand Marauders", "DR p223"],
  ["Woodland Folk", "DR p226"],
  ["Graveyard Dwellers", "DR p214"],
  ["Hollywood Cave People", "DR p215"],
  ["Bog People", "DR p203"],
  ["Mountain Dwarves", "DR p204"],
  ["Northlanders", "DR p204"],
  ["Picts", "DR p205"],
  ["Bronze Age Heroes", "DR p206"],
  ["Faerie Borderlands", "DR p210"],
  ["Lizard Kin", "DR p217"],
  ["Rat Kin", "DR p221"],
  ["Renaissance Men", "DR p222"],
];

const HERO = [
  ["Rottingutt", "DR p16"],
  ["MacTavish", "DR p22"],
  ["Ardenuff the Slayer", "DR p22"],
  ["Olaf the Owl", "DR p22"],
  ["King Arthur", "DR p50"],
  ["Wessel the Weasel Whisperer", "DR p52"],
  ["Merlin the Wise", "DR p64"],
  ["Colin the Summoner", "DR p117"],
  ["The Grand Old Duke of Orc", "DR p179"],
];

export const SOURCES = { kingdom: KINGDOM, army: ARMY, hero: HERO };

// A culture is a homeland's people and the names they give their rulers.
// Dragon Rampant realms keep that book's heroes.
const book = (src) => (list) => list.filter(([, cite]) => cite.startsWith(src)).map(([n]) => n);
export const CULTURES = {
  "dragon-rampant": { label: "Dragon Rampant", rulers: book("DR")(HERO) },
  ...Object.fromEntries(Object.entries(BKL_CULTURES).map(([id, c]) => [id, {
    label: c.label,
    // Pict women take Cymric names (KL p26); Roman women feminize the men's (KL p27).
    rulers: [...c.male, ...c.female, ...(c.femaleRule ?? []),
             ...(c.femaleFrom ? BKL_CULTURES[c.femaleFrom].female : [])],
  }])),
};

// The book's Zazamanc lands (KL p112) read as plainly modern, so the owner swapped
// them for older names: Berbers, Vandals, Egypt and Araby out; Patelamunt stays.
const ZAZAMANC_OUT = new Set(["Berbers", "Vandals", "Egypt", "Araby"]);
const ZAZAMANC_IN = [
  "Numidia",                    // Berbers
  "Byzacena", "Cartago",        // Vandals
  "Babylone", "Aegyptus",       // Egypt
  "Floripa", "Ferumbra", "Kemetia", // Egypt: the owner's names
  "Saba",                       // Araby
  "Azagouc", "Tribalibot",      // kingdoms from Wolfram's Parzival
];

// [homeland, culture]
export const HOMELANDS = [
  ...book("DR")(KINGDOM).map((n) => [n, "dragon-rampant"]),
  ...BKL_HOMELANDS.filter(([n]) => !ZAZAMANC_OUT.has(n)).map(([n, c]) => [n, c]),
  ...ZAZAMANC_IN.map((n) => [n, "zazamanc"]),
];

export const NAMES = {
  kingdom: HOMELANDS.map(([n]) => n),
  army: ARMY.map(([n]) => n),
  hero: [...new Set(Object.values(CULTURES).flatMap((c) => c.rulers))],
};

const byName = new Map(HOMELANDS.map(([n, c]) => [n.toLowerCase(), c]));
export const cultureOf = (name) => byName.get(String(name ?? "").trim().toLowerCase()) ?? null;

// A kingdom's ruler, and any later hero, comes from its culture's names.
export const rulerPool = (culture) => CULTURES[culture]?.rulers ?? NAMES.hero;

// The kingdom-name roll: a culture first, then one of its homelands, then a ruler of that culture.
const CULTURE_IDS = Object.keys(CULTURES).filter((c) => HOMELANDS.some(([, h]) => h === c));
export function rollKingdom(avoid) {
  const culture = CULTURE_IDS[Math.floor(Math.random() * CULTURE_IDS.length)];
  const homes = HOMELANDS.filter(([, c]) => c === culture).map(([n]) => n);
  return { name: randomName(homes, avoid), culture, ruler: randomName(rulerPool(culture)) };
}

// A random entry, nudged off the current value so a roll always changes it.
export function randomName(pool, avoid) {
  if (!pool?.length) return "";
  if (pool.length === 1) return pool[0];
  let n = pool[Math.floor(Math.random() * pool.length)];
  if (n === avoid) n = pool[(pool.indexOf(n) + 1) % pool.length];
  return n;
}
