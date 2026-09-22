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
    chronicle: [
      {
        year: 1,
        title: "Grundeland founded",
        body:
          "A kingdom of dwarves and humans, ruled by Barrok IV, an old but still " +
          "hearty dwarf. Its symbol is a shield bearing a crossed hammer and sword, " +
          "for the unity of the two peoples who live there.",
      },
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
    chronicle: [
      {
        year: 1,
        title: "Vasala under Kelindra",
        body:
          "Ruled by the young elf queen Kelindra, a powerful sorceress. Most armies " +
          "march under her younger brother, Prince Kalek. The Dark Hills bring goblin " +
          "wolfriders into elvish service, carrying elvish shields.",
      },
    ],
  },
];

export function loadExample(id) {
  const e = EXAMPLE_KINGDOMS.find((k) => k.id === id);
  if (!e) return null;
  const { id: _drop, ...rest } = e;
  return { ...rest, collection: {} };
}
