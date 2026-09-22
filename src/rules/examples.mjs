// The two worked examples, pp24-25. Names, rulers and territories are the book's.
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
];

export function loadExample(id) {
  const e = EXAMPLE_KINGDOMS.find((k) => k.id === id);
  if (!e) return null;
  const { id: _drop, ...rest } = e;
  return { ...rest, collection: {} };
}
