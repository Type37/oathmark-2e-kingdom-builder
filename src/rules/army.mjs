// How a unit is put together on the table (pp44-45, 81-85). The kingdom decides
// what you may take; this decides what a unit looks like once you have taken it.
import { figureById } from "./kingdom.mjs";
import { variantFor, attrLevel, isCharacter, figuresIn } from "./stats.mjs";

import { applyUpgrades } from "./upgrades.mjs";
import { applyGuestItem } from "./magic.mjs";

export { isCharacter };

// The base a figure stands on once a horse or chariot is bought; p81 compares these.
export const baseOf = (fig, unit) =>
  applyUpgrades(variantFor(fig, unit ?? {}), unit?.upgrades ?? []).base;

// Unit sizes by base, p44.
export const UNIT_SIZE = {
  "25 x 25": { max: 20, rank: 5 },
  "25 x 50": { max: 10, rank: 5 },
  "50 x 50": { max: 3, rank: 3 },
  "50 x 100": { max: 1, rank: 1 },
};

export function sizeRule(fig) {
  if (isCharacter(fig)) return { max: 1, rank: 1 };
  const base = fig?.variants?.[0]?.base ?? "";
  return UNIT_SIZE[base] ?? { max: fig?.unitMax ?? 1, rank: fig?.rankWidth ?? 1 };
}

// "Ranks of five, with any leftover figures forming the back rank" (p44).
export function formation(fig, count) {
  const { rank } = sizeRule(fig);
  const full = Math.floor(count / rank);
  const rest = count % rank;
  if (count <= 1) return "";
  if (full === 0) return `1 rank of ${rest}`;
  const head = `${full} rank${full > 1 ? "s" : ""} of ${rank}`;
  return rest ? `${head} + ${rest}` : head;
}

export const isArtillery = (fig) =>
  Boolean(fig?.variants?.[0]?.attributes?.some((a) => a.startsWith("Artillery")));
export const isMonster = (fig) =>
  Boolean(fig?.variants?.[0]?.attributes?.includes("Monster"));

// Artillery units are a piece plus a fixed crew, p84.
export function crewOf(fig) {
  return attrLevel(fig?.variants?.[0] ?? { attributes: [] }, "Crew") || null;
}

// A character may join a unit of the same base size; champions only join their
// own race; monsters and artillery never take one (pp81, 83, 84).
export function canJoin(hostFig, charFig, hostUnit, charUnit) {
  if (!hostFig || !charFig) return { ok: false, why: "" };
  if (isArtillery(hostFig)) return { ok: false, why: "Artillery takes no character" };
  if (isMonster(hostFig)) return { ok: false, why: "Monsters fight alone" };
  if (isCharacter(hostFig)) return { ok: false, why: "A unit may contain only one character" };
  if (hostFig.id === charFig.id) return { ok: false, why: "" };
  const hostBase = baseOf(hostFig, hostUnit);
  const charBase = baseOf(charFig, charUnit);
  // The character takes one of the unit's places, so a unit of one has none to give.
  if (sizeRule(hostFig).max < 2) return { ok: false, why: `A ${hostBase} unit holds one figure` };
  if (hostBase !== charBase) return { ok: false, why: `Base ${charBase} does not match ${hostBase}` };
  const champion = charFig.variants[0].attributes.includes("Champion");
  if (champion && charFig.list !== hostFig.list)
    return { ok: false, why: "A champion only joins its own race" };
  return { ok: true, why: "" };
}

// What canJoin allows, said once for the card that offers the choice.
export function joinRule(charFig, charUnit) {
  const v = charFig?.variants?.[0];
  if (!v) return "";
  const base = baseOf(charFig, charUnit);
  if (sizeRule({ variants: [{ base, attributes: [] }] }).max < 2) return `None: on a ${base}mm base it fights alone`;
  const race = v.attributes.includes("Champion")
    ? `${charFig.list[0].toUpperCase()}${charFig.list.slice(1)} units` : "Units";
  return `${race} on ${base}mm bases, not artillery or monsters`;
}

// A character is bought in its own right and then joins a unit, where it counts
// towards that unit's maximum (p81). The unit takes the slowest Move, and with
// Command, the character's Activation (p82).
export const joinedTo = (units, host) => (units ?? []).find((u) => u.joinedTo && u.joinedTo === host.uid) ?? null;

// A unit drawn from an occupied territory activates one worse, and one from
// Region 6 is Unreliable (p35). The muster records which source it came from.
export function sourcePenalties(entry) {
  const sources = entry?.sources ?? [];
  const allOccupied = sources.length > 0 && sources.every((s) => s.occupied);
  const allBorderland = sources.length > 0 && sources.every((s) => s.region === 6);
  return { occupied: allOccupied, unreliable: allBorderland };
}

export function unitProfile(unit, units, entry) {
  const fig = figureById.get(unit.figureId);
  if (!fig) return null;
  const base = variantFor(fig, unit);
  const penalty = sourcePenalties(entry);
  const v = penalty.occupied || penalty.unreliable
    ? {
        ...base,
        A: base.A + (penalty.occupied ? 1 : 0),
        attributes: penalty.unreliable && !base.attributes.includes("Unreliable")
          ? [...base.attributes, "Unreliable"]
          : base.attributes,
      }
    : base;
  const guest = joinedTo(units, unit);
  const charFig = guest ? figureById.get(guest.figureId) : null;
  const charV = charFig ? variantFor(charFig, guest) : null;
  const bodies = figuresIn(unit) + (charFig ? 1 : 0);
  const move = charV ? Math.min(v.M, charV.M) : v.M;
  const activation = charV && attrLevel(charV, "Command") ? Math.max(v.A, charV.A) : v.A;
  return {
    fig, variant: applyGuestItem(v, guest?.magicItem), guest, charFig, charVariant: charV, penalty,
    bodies,
    max: sizeRule(fig).max,
    formation: formation(fig, bodies),
    move,
    activation,
    // A character inside a unit is part of it, not a unit of its own (p81).
    unitOfOne: bodies === 1 && !unit.joinedTo,
  };
}
