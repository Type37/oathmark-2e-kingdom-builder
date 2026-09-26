// Name pools for the roll buttons. Every entry is printed in a published book
// the owner has, with its page, or is a historical name from the owner's
// research (HN); nothing here is invented. See notes/culture-pools.md.
//   DR = Dragon Rampant, second edition (Osprey Games), Daniel Mersey
//   KL = The Book of Knights & Ladies (Pendragon 5th ed., 2007), in bkl-names.mjs
//   HN = historical British and Saxon names, the owner's research
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

// Historical British and Saxon names from the owner's research (HN), row by row
// from their d10 × d10 tables.
// The Britons are the book of Knights & Ladies' Cymri. "Horse" (Saxon 1-4) is
// left out as a misprint of Horsa, which KL p28 already has.
const HN = {
  cymric: [
    "Caradoc", "Cado", "Malgo", "Tutgal", "Vortiporius", "Cadog", "Medraut", "Pasgen", "Idris", "Pabo",
    "Cadwallader", "Mor", "Keredic", "Urien", "Arthur", "Pedrog", "Ceido", "Cunedda", "Gwyddno", "Sawyl",
    "Gwerthefyr", "Gerren", "Cadvan", "Cynfarch", "Senyllt", "Bedwyr", "Einion", "Tutwal", "Gwrin", "Asaph",
    "Cuneglasus", "Bledric", "Geraint", "Donault", "Uther", "Meurig", "Cadwallon", "Iago", "Meirchion", "Dunaut",
    "Guoremor", "Clemen", "Yvor", "Selyf", "Ambrosius", "Owain", "Maelgwyn", "Cadfan", "Meilir", "Aneirin",
    "Gwenddoleu", "Petroc", "Yni", "Aurelius", "Caradocus", "Erb", "Rhun", "Cadfael", "Mael", "Deiniol",
    "Conomor", "Culmin", "Vortigern", "Riderich", "Solor", "Tewdrig", "Iddon", "Idwal", "Brydw", "Ambrosius",
    "Constantine", "Donyarth", "Constans", "Morcant", "Glywys", "Athrwys", "Ynyr", "Rhodri", "Tristan", "Cynwyl",
    "Gwalchafed", "Octavius", "Erbin", "Garcianus", "Gwynllyn", "Lot", "Gadeon", "Cynan", "Gruffudd", "Pawl",
    "Maximianus", "Custennin", "Dionotus", "Peredur", "Gwallawc", "Conan", "Merchwyn", "Hywel", "Merfyn", "Cadell",
  ],
  saxon: [
    "Cerdic", "Cenwalh", "Aethelwold", "Hlothhere", "Oswiu", "Nodhelm", "Aethelfrith", "Creoda", "Ealdwulf",
    "Cynric", "Wehha", "Ealdwulf", "Oisc", "Eadric", "Wulfhere", "Esa", "Edwin", "Offa", "Aelfwald",
    "Ceawlin", "Wuffa", "Aescwine", "Octa", "Icel", "Aethelred", "Eoppa", "Eanfrith", "Aelfwynn", "Hrotha",
    "Ceol", "Tytila", "Saebert", "Eormenric", "Cnebba", "Aelle", "Ida", "Oswald", "Aart", "Uppinga",
    "Ceowulf", "Raedwald", "Sexred", "Aedelberht", "Cynewald", "Cissa", "Glappa", "Oswiu", "Cenfus", "Sledda",
    "Cynegils", "Eorpwald", "Saeward", "Eadbald", "Creoda", "Aedelwealh", "Adda", "Aella", "Aescwine", "Swithelm",
    "Cwichelm", "Ricberht", "Sigeberht", "Aedwald", "Pybba", "Eadwulf", "Arthelric", "Oswine", "Centwine", "Sigeric",
    "Cenwalh", "Sigeberht", "Seabbi", "Eorcenberht", "Cearl", "Ecgwald", "Theordric", "Eadwulf", "Ine", "Mul",
    "Penda", "Ecgric", "Sigered", "Eormenred", "Eowa", "Berhthun", "Frithuwald", "Coenred", "Anna", "Swaefheard",
    "Cuthwulf", "Aethelhere", "Hengest", "Ecgberht", "Peada", "Andhun", "Hussa", "Icel", "Ealdwold", "Wihtred",
  ],
};

// A culture is a homeland's people and the names they give their rulers.
// Dragon Rampant realms keep that book's heroes.
const book = (src) => (list) => list.filter(([, cite]) => cite.startsWith(src)).map(([n]) => n);
export const CULTURES = {
  "dragon-rampant": { label: "Dragon Rampant", rulers: book("DR")(HERO) },
  ...Object.fromEntries(Object.entries(BKL_CULTURES).map(([id, c]) => [id, {
    label: c.label,
    // Pict women take Cymric names (KL p26); Roman women feminize the men's (KL p27).
    rulers: [...new Set([...c.male, ...c.female, ...(c.femaleRule ?? []),
             ...(c.femaleFrom ? BKL_CULTURES[c.femaleFrom].female : []), ...(HN[id] ?? [])])],
  }])),
};

// Some homelands read as plainly modern places, so they take their older or
// period forms. Left of the arrow is the book's name.
const OLDER = {
  // Zazamanc (KL p112): the owner's swap.
  Berbers: ["Numidia"], Vandals: ["Byzacena", "Cartago"],
  Egypt: ["Babylone", "Aegyptus", "Floripa", "Ferumbra", "Kemetia"],
  Araby: ["Saba", "Azagouc", "Tribalibot"],
  // Byzantine (KL p78), French (p86), Danish (p82) and Italian (p99).
  Syria: ["Antiochia"], Constantinople: ["Miklagard"],
  "Orléans": ["Aurelianum"], "Ile de France": ["Francia"],
  Jutland: ["Jylland"], Zealand: ["Sjælland"], Skane: ["Skåne"],
  Rome: ["Roma"], Venice: ["Venetia"], Milan: ["Mediolanum"], Florence: ["Florentia"],
  Genoa: ["Genua"], Pisa: ["Pisae"], Syracuse: ["Syracusae"], Amalfi: ["Amalphia"],
};

// [homeland, culture]
export const HOMELANDS = [
  ...book("DR")(KINGDOM).map((n) => [n, "dragon-rampant"]),
  ...BKL_HOMELANDS.flatMap(([n, c]) => (OLDER[n] ?? [n]).map((name) => [name, c])),
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
// Cultures weigh the same, except more British (Cymric) and Saxon, and fewer Faerie children.
const WEIGHT = { cymric: 3, saxon: 2, faerie: 0.25 };
const CULTURE_IDS = Object.keys(CULTURES).filter((c) => HOMELANDS.some(([, h]) => h === c));
function rollCulture() {
  const total = CULTURE_IDS.reduce((t, c) => t + (WEIGHT[c] ?? 1), 0);
  let r = Math.random() * total;
  return CULTURE_IDS.find((c) => (r -= WEIGHT[c] ?? 1) < 0) ?? CULTURE_IDS.at(-1);
}
export function rollKingdom(avoid) {
  const culture = rollCulture();
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
