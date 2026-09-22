// How a unit is put together on the table (pp44-45, 81-85). The kingdom decides
// what you may take; this decides what a unit looks like once you have taken it.
import { figureById } from "./kingdom.mjs";
import { variantFor, attrLevel } from "./stats.mjs";

// Unit sizes by base, p44.
export const UNIT_SIZE = {
  "25 x 25": { max: 20, rank: 5 },
  "25 x 50": { max: 10, rank: 5 },
  "50 x 50": { max: 3, rank: 3 },
  "50 x 100": { max: 1, rank: 1 },
};

export function sizeRule(fig) {
  const base = fig?.variants?.[0]?.base ?? "";
  return UNIT_SIZE[base] ?? { max: fig?.unitMax ?? 1, rank: fig?.rankWidth ?? 1 };
}

// "Ranks of five, with any leftover figures forming the back rank" (p44).
export function formation(fig, count) {
  const { rank } = sizeRule(fig);
  const full = Math.floor(count / rank);
  const rest = count % rank;
  if (count <= 0) return "";
  if (full === 0) return `1 rank of ${rest}`;
  const head = `${full} rank${full > 1 ? "s" : ""} of ${rank}`;
  return rest ? `${head} + ${rest}` : head;
}

export const isArtillery = (fig) =>
  Boolean(fig?.variants?.[0]?.attributes?.some((a) => a.startsWith("Artillery")));
export const isMonster = (fig) =>
  Boolean(fig?.variants?.[0]?.attributes?.includes("Monster"));
export const isCharacter = (fig) =>
  Boolean(fig?.variants?.some((v) => v.attributes.includes("Magic Items")));

// Artillery units are a piece plus a fixed crew, p84.
export function crewOf(fig) {
  return attrLevel(fig?.variants?.[0] ?? { attributes: [] }, "Crew") || null;
}

// A character may join a unit of the same base size; champions only join their
// own race; monsters and artillery never take one (pp81, 83, 84).
export function canJoin(hostFig, charFig) {
  if (!hostFig || !charFig) return { ok: false, why: "" };
  if (isArtillery(hostFig)) return { ok: false, why: "Artillery takes no character" };
  if (isMonster(hostFig)) return { ok: false, why: "Monsters fight alone" };
  if (hostFig.id === charFig.id) return { ok: false, why: "" };
  const hostBase = hostFig.variants[0].base;
  const charBase = charFig.variants[0].base;
  if (hostBase !== charBase) return { ok: false, why: `Base ${charBase} does not match ${hostBase}` };
  const champion = charFig.variants[0].attributes.includes("Champion");
  if (champion && charFig.list !== hostFig.list)
    return { ok: false, why: "A champion only joins its own race" };
  return { ok: true, why: "" };
}

// A character is bought in its own right and then joins a unit, where it counts
// towards that unit's maximum (p81). The unit takes the slowest Move, and with
// Command, the character's Activation (p82).
export const joinedTo = (units, host) => (units ?? []).find((u) => u.joinedTo && u.joinedTo === host.uid) ?? null;

export function unitProfile(unit, units) {
  const fig = figureById.get(unit.figureId);
  if (!fig) return null;
  const v = variantFor(fig, unit);
  const guest = joinedTo(units, unit);
  const charFig = guest ? figureById.get(guest.figureId) : null;
  const charV = charFig ? variantFor(charFig, guest) : null;
  const bodies = (unit.count ?? 1) + (charFig ? 1 : 0);
  const move = charV ? Math.min(v.M, charV.M) : v.M;
  const activation = charV && attrLevel(charV, "Command") ? Math.max(v.A, charV.A) : v.A;
  return {
    fig, variant: v, guest, charFig, charVariant: charV,
    bodies,
    max: sizeRule(fig).max,
    formation: formation(fig, bodies),
    move,
    activation,
    unitOfOne: bodies === 1,
  };
}
