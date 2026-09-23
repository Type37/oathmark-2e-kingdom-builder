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

// Picks n distinct entries, or as many as the table holds.
function pickSome(list, n) {
  const pool = [...list];
  const out = [];
  while (out.length < n && pool.length) out.push(...pool.splice(Math.floor(Math.random() * pool.length), 1));
  return out;
}

// A few entries in the events table tell the referee to roll again rather than
// saying what happened; they read as instructions, not as lore.
const isEvent = (e) => !/^(pick|roll|choose|select|as above)/i.test(e.text ?? "");

// The ruler: what they hold to, and the thing their reign is remembered for.
export function rollRuler() {
  if (!table) return null;
  const { values, history } = table;
  return { holds: pick(values.entries).name, marked: pick(history.events.filter(isEvent)) };
}

// A line for each of the six regions: what happened out there. The outer
// marches take a border dispute instead, since that is what a frontier is for.
export function rollRegions() {
  if (!table) return null;
  const { history, disputes } = table;
  const events = pickSome(history.events.filter(isEvent), 4);
  return {
    1: events[0], 2: events[1], 3: events[2], 4: events[3],
    5: { name: pick(disputes.entries), text: "" },
    6: { name: pick(disputes.entries), text: "" },
  };
}

// One roll across every table: what this kingdom is like, and how it got here.
export function rollLore() {
  if (!table) return null;
  const { themes, values, disputes, ties, history } = table;
  return {
    ruler: rollRuler(),
    regions: rollRegions(),
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
