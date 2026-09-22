// Each capital list maps to an Astryx categorical colour family.
export const HUE = {
  dwarf: "orange",
  elf: "green",
  goblin: "yellow",
  human: "blue",
  orc: "red",
  necropolis: "purple",
  unaligned: "gray",
};

export const hueOf = (list) => HUE[list] ?? "gray";
