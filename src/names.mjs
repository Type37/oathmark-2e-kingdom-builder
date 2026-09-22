// Name pools for the roll buttons. Every entry is printed in a published book
// the owner has, with its page; nothing here is invented. See notes/name-pools.md.
//   OM = Oathmark: Second Edition (Osprey Games, 2026)
//   DR = Dragon Rampant, second edition (Osprey Games), Daniel Mersey
// Page numbers are the books' printed page numbers.

const KINGDOM = [
  ["Grundeland", "OM p24"],
  ["Vasala", "OM p24"],
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
  ["Barrok IV", "OM p24"],
  ["Queen Kelindra", "OM p24"],
  ["Prince Kalek", "OM p24"],
  ["Grunk Nosesplatter", "OM p208"],
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
export const NAMES = {
  kingdom: KINGDOM.map(([n]) => n),
  army: ARMY.map(([n]) => n),
  hero: HERO.map(([n]) => n),
};

// A random entry, nudged off the current value so a roll always changes it.
export function randomName(pool, avoid) {
  if (!pool?.length) return "";
  if (pool.length === 1) return pool[0];
  let n = pool[Math.floor(Math.random() * pool.length)];
  if (n === avoid) n = pool[(pool.indexOf(n) + 1) % pool.length];
  return n;
}
