import { z } from "zod";

// Imported files are untrusted: validate before anything touches app state.
const Territory = z.object({
  region: z.number().int().min(1).max(6),
  list: z.string().min(1),
  name: z.string().min(1),
});

const ChronicleEntry = z.object({
  year: z.number().int().min(1),
  title: z.string(),
  body: z.string().optional().default(""),
});

export const KingdomSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().default(""),
  ruler: z.string().optional().default(""),
  level: z.enum(["beginner", "moderate", "expert"]).nullable().optional(),
  capitalList: z.string().nullable().optional(),
  territories: z.array(Territory).optional().default([]),
  collection: z.record(z.string(), z.number().int().min(0)).optional().default({}),
  chronicle: z.array(ChronicleEntry).optional().default([]),
  emblem: z.string().nullable().optional(),
  saved: z.string().optional(),
});

export const MusterSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().default(""),
  commander: z.string().optional().default(""),
  points: z.number().int().min(0).optional().default(1000),
  kingdomId: z.string().optional(),
  units: z
    .array(
      z.object({
        uid: z.string().optional(),
        figureId: z.string().min(1),
        count: z.number().int().min(1).optional().default(1),
        level: z.number().int().min(1).max(5).optional(),
        upgrades: z.array(z.object({ name: z.string() }).passthrough()).optional(),
      }),
    )
    .optional()
    .default([]),
  saved: z.string().optional(),
});

export const CollectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional().default(""),
  owned: z.record(z.string(), z.number().int().min(0)).optional().default({}),
  saved: z.string().optional(),
});

export const StoreSchema = z.object({
  schema: z.number().optional(),
  kingdoms: z.array(KingdomSchema).optional().default([]),
  collections: z.array(CollectionSchema).optional().default([]),
  musters: z.array(MusterSchema).optional().default([]),
  active: z.record(z.string(), z.string()).optional().default({}),
});

// Every field is optional so partial saves survive, which means an empty
// object would otherwise validate as a blank record. Require a key that
// identifies the kind before trusting the parse.
const MARKERS = {
  kingdoms: ["territories", "capitalList", "level", "chronicle", "ruler"],
  musters: ["units", "points", "kingdomId"],
  collections: ["owned"],
};

export function parseImport(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("File does not match any Oathmark record");
  }

  if (["kingdoms", "musters", "collections"].some((k) => Array.isArray(data[k]))) {
    const asStore = StoreSchema.safeParse(data);
    if (!asStore.success) throw new Error("Store file is not valid");
    return { kind: "store", value: asStore.data };
  }

  for (const [kind, schema] of [
    ["kingdoms", KingdomSchema],
    ["musters", MusterSchema],
    ["collections", CollectionSchema],
  ]) {
    if (!MARKERS[kind].some((k) => k in data)) continue;
    const one = schema.safeParse(data);
    if (one.success) return { kind, value: one.data };
  }
  throw new Error("File does not match any Oathmark record");
}
