// Lore tables live in src/lore/, which is git-ignored: the tables are from a
// book we can't redistribute, so the deployed site ships without them and this
// module reports the feature as absent.
const modules = import.meta.glob("./lore/*.mjs", { eager: true });
const table = Object.values(modules)[0]?.WWN ?? null;

export const hasLore = Boolean(table);
export const loreSource = table ? "Worlds Without Number, Kevin Crawford" : null;

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const pickTwo = (list) => {
  const a = pick(list);
  let b = pick(list);
  if (b === a) b = list[(list.indexOf(a) + 1) % list.length];
  return [a, b];
};

// One roll across every table: what this kingdom is like, and how it got here.
export function rollLore() {
  if (!table) return null;
  const { themes, values, disputes, ties, history } = table;
  return {
    theme: pick([...themes.negative, ...themes.positive]),
    values: pickTwo(values.entries),
    dispute: pick(disputes.entries),
    tie: pick(ties.entries),
    history: {
      origin: pick(history.origin),
      rise: pick(history.rise),
      peak: pick(history.peak),
      fall: pick(history.fall),
    },
  };
}
