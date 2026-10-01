// The book's two worked examples, pp24-25 (names, rulers and territories are
// the book's), and Trebes, the owner's own kingdom.
export const EXAMPLE_KINGDOMS = [
  {
    id: "grundeland",
    name: "Grundeland",
    ruler: "Barrok IV",
    level: "beginner",
    capitalList: "dwarf",
    territories: [
      { region: 1, list: "dwarf", name: "Dwarf City" },
      { region: 2, list: "human", name: "Human City" },
      { region: 2, list: "dwarf", name: "Forges" },
    ],
  },
  {
    id: "vasala",
    name: "Vasala",
    ruler: "Queen Kelindra",
    level: "moderate",
    capitalList: "elf",
    territories: [
      { region: 1, list: "elf", name: "Elf City" },
      { region: 2, list: "elf", name: "Silver Mines" },
      { region: 2, list: "elf", name: "Forests" },
      { region: 3, list: "elf", name: "Grasslands" },
      { region: 3, list: "elf", name: "Towers" },
      { region: 3, list: "goblin", name: "Dark Hills" },
    ],
  },
  {
    "id": "trebes",
    "name": "Trebes",
    "ruler": "Euric",
    "level": "moderate",
    "capitalList": "human",
    "culture": "aquitanian",
    "territories": [
      {
        "region": 1,
        "list": "human",
        "name": "Human City",
        "flavor": {
          "theme": "Livestock",
          "structure": "Manor",
          "street": "Gas leak",
          "building": "Orphanage",
          "faction": "Ranger squad"
        }
      },
      {
        "region": 2,
        "list": "necropolis",
        "name": "Necropolis",
        "flavor": {
          "theme": "Training",
          "structure": "Port",
          "street": "Gates",
          "building": "Leatherworks",
          "faction": "Assassins' guild"
        }
      },
      {
        "region": 2,
        "list": "human",
        "name": "Timber Mills"
      },
      {
        "region": 3,
        "list": "human",
        "name": "Monastery"
      },
      {
        "region": 3,
        "list": "elf",
        "name": "Forests"
      },
      {
        "region": 3,
        "list": "necropolis",
        "name": "Catacombs"
      }
    ],
    "regionNames": {
      "1": "Muglock",
      "2": "Ganis",
      "3": "Benoit"
    },
    "regionFlavor": {
      "2": {
        "trait": "Divine",
        "location": "Rockslide"
      },
      "3": {
        "trait": "Cursed",
        "location": "Knoll"
      },
      "4": {
        "trait": "Mysterious",
        "location": "Brook"
      },
      "5": {
        "trait": "Vast",
        "location": "Oil seep"
      },
      "6": {
        "trait": "Forgotten",
        "location": "Scrubland"
      }
    },
    "chronicle": "The utter ruin of Ganis by the Forces of Evil was of little concern to the elves - until their cities and forests burned. Ganis has been reclaimed, but the Kingdom of Trebes now must juggle the recently-arisen citizenry of Ganis with the elven refugees of Benoit together at once."
  },
];

export function loadExample(id) {
  const e = EXAMPLE_KINGDOMS.find((k) => k.id === id);
  if (!e) return null;
  const { id: _drop, ...rest } = e;
  return { ...rest, collection: {} };
}
