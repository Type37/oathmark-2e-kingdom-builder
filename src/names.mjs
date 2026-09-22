// Name pools for the roll buttons. Army and hero names come from the
// Dragon Rampant 2e builder; realm names follow the book's Grundeland and Vasala.

const KINGDOM_NAMES = [
  "Grimhollow", "Aldermoor", "Kharzduin", "Vel Anthir", "Brackenfell", "Duskwater",
  "Hallowmere", "Ironreach", "Thornwick", "Carrow Vale", "Eldmarch", "Stonevigil",
  "Ashenfold", "Merrowdeep", "Kelmoor", "Sunderhold", "Brightwater", "Varnholt",
  "Wyvernmere", "Oakenshaw", "Gloamreach", "Harrowgate", "Silvanor", "Cragmere",
  "Rookfell", "Dunhallow", "Emberlyn", "Morvaine", "Tollemarch", "Westerburg",
];

const WARBAND_NAMES = [
  "The Foul-Wind Goblins", "Rottingutt's Malodorous Horde", "The Ninefold Legion",
  "Warriors of the Ashen Crown", "The Gilded Company", "Hosts of the Pale King",
  "The Bramblewild Kin", "Sons of the Smouldering Peak", "The Drowned Court",
  "Vanguard of the Silver Thorn", "The Marrow Legion", "Wyrms of the Second Dawn",
  "The Hollow Host", "Riders of the Broken Moon", "The Emberclad",
  "Covenant of the Green Flame", "The Tattered Banners", "Wolves of Winter's Edge",
  "The Sunken Diadem", "Feywild Marauders", "The Obsidian Reach",
  "Legion of the Weeping Gate", "The Barrow-Wardens", "Storm of the Iron Fens",
  "The Thrice-Cursed", "Heralds of the Amber Sun", "The Rustfang Tribe",
  "Court of Antlers", "The Glass Serpents", "Banners of the Dawnrazor",
];

const HERO_NAMES = [
  "Rottingutt the Rank", "Ardenuff the Slayer", "Ser Caldros of the Vale",
  "Morgause Nightweaver", "Grimjaw Bonechewer", "The Lady Vane",
  "Uthred One-Eye", "Piskiewhistle the Sly", "Bramblehart", "Old Nan Gwynn",
  "Vashti the Bright", "Thane Tostig", "Dunmor the Undying", "Sable the Wanderer",
  "Colin the Summoner", "Hexwarden Ysolt", "Baelgor Flamewreathed", "Meg of the Marsh",
  "Sir Percivale Prim", "The Gore-Crow", "Aldith Ravenshield", "Skarn the Butcher",
  "Elowen Thornsong", "Duke Malebranche", "Wolfric Greymane",
];

export const NAMES = { kingdom: KINGDOM_NAMES, army: WARBAND_NAMES, hero: HERO_NAMES };

// A random entry, nudged off the current value so a roll always changes it.
export function randomName(pool, avoid) {
  if (!pool?.length) return "";
  if (pool.length === 1) return pool[0];
  let n = pool[Math.floor(Math.random() * pool.length)];
  if (n === avoid) n = pool[(pool.indexOf(n) + 1) % pool.length];
  return n;
}
