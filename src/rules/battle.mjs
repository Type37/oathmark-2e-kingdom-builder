// The Battle Table and its types, pp29-32, in the book's words.
export const BATTLE_TYPES = [
  {
    id: "deep-strike",
    name: "Deep Strike",
    rolls: [1, 1],
    attacker: true,
    page: 30,
    text: "The attacker may strike against any territory in the opponent's kingdom except the capital (unless the capital is the only remaining unoccupied territory in the kingdom). If the attacker wins the battle, their army occupies the territory they attacked. If the defender wins the battle, they may free any one territory that is currently occupied by the attacking kingdom. If they have no territories occupied by the attacking kingdom, they may add a territory if they have an open space in Regions 3 or 4.",
  },
  {
    id: "invasion",
    name: "Invasion",
    rolls: [2, 2],
    attacker: true,
    page: 31,
    text: "The attacker may strike against any territory in the opponent's kingdom that has an open or occupied border. If the attacker wins the battle, their army occupies the territory they attacked. If the defender wins the battle, they may free any one territory in their kingdom that is currently occupied by the attacking kingdom. If they have no territories occupied by the attacking kingdom, they may add a territory if they have an open space in Regions 3 or 4.",
  },
  {
    id: "border-strike",
    name: "Border Strike",
    rolls: [3, 4],
    attacker: true,
    page: 31,
    text: "The attacker may attack any territory in the opponent's kingdom that has an open border. (If the defender has no territories with open borders, treat this as an Invasion instead). If the attacker wins the battle, their army occupies the territory they attacked. If the defender wins the battle, they may free any one territory that is currently occupied by the attacking kingdom. If they have no territories occupied by the attacking kingdom, they may add a territory if they have an open space in Regions 3, 4, or 5.",
  },
  {
    id: "border-clash",
    name: "Border Clash",
    rolls: [5, 6],
    attacker: true,
    page: 32,
    text: "Whoever wins the battle may choose to occupy one territory of their opponent's kingdom that has an open border. If there are no territories with open borders, they may occupy a territory with an occupied border instead. Alternatively, the attacker may add a territory if they have an open space in Regions 3, 4, 5, or 6.",
  },
  {
    id: "territorial-dispute",
    name: "Territorial Dispute",
    rolls: [7, 8],
    attacker: false,
    page: 32,
    text: "Whoever wins the battle may add a territory if they have an open space in Regions 3, 4, 5 or 6. Alternatively, they may change a single territory in Regions 5 or 6 to a different territory. The loser of the battle should roll a die. On an 8+ they may also add a territory if they have an open space in Regions 3, 4, 5, or 6.",
  },
  {
    id: "exploratory-encounter",
    name: "Exploratory Encounter",
    rolls: [9, 10],
    attacker: false,
    page: 32,
    text: "Whoever wins the battle may add a territory to any open space in their kingdom, including in Region 6. The loser of the battle should roll a die. On a 4+ they may also add a territory if they have an open space in Regions 3, 4, 5 or 6.",
  },
];

export const battleTypeById = new Map(BATTLE_TYPES.map((b) => [b.id, b]));
export const rollLabel = (b) => (b.rolls[0] === b.rolls[1] ? `${b.rolls[0]}` : `${b.rolls[0]}–${b.rolls[1]}`);

// The Battle Table is a d10 (p29).
export function rollBattleType(d10 = 1 + Math.floor(Math.random() * 10)) {
  return BATTLE_TYPES.find((b) => d10 >= b.rolls[0] && d10 <= b.rolls[1]) ?? BATTLE_TYPES.at(-1);
}

// p29: at Beginner level, stick to Exploratory Encounters until Region 3 is full.
export function beginnerAdvice(kingdom) {
  if (kingdom?.level !== "beginner") return null;
  const third = (kingdom.territories ?? []).filter((t) => t.region === 3).length;
  if (third >= 3) return null;
  return "At Beginner level it is suggested that you only play Exploratory Encounters until you have filled out all the territories in Region 3 of your kingdom.";
}

// Points Value Modifier Table, p34. A d10 shifts the attacker's points.
export const POINTS_MODIFIER = [-5, -4, -3, -2, 0, 0, 2, 3, 4, 5];

export function rollPointsModifier(d10 = 1 + Math.floor(Math.random() * 10)) {
  return POINTS_MODIFIER[Math.min(10, Math.max(1, d10)) - 1];
}

// "+2%" of a 1,500-point game is 30 points (p34).
export function applyModifier(points, percent) {
  return Math.round(points + (points * (percent ?? 0)) / 100);
}
