import { get as idbGet } from "idb-keyval";
import { saveEmblem } from "./emblem.mjs";

// Discord Sync: your kingdoms, armies and collection follow your Discord
// account to every device.
//
// The same design as the A Billion Suns Shipyard's Fleet Sync (web/fleet-sync.ts
// in that repo), which came from Dropfleet Commander's. Read that header before
// changing the shape of this one.
//
// - Discord sign-in goes through the Cloudflare Worker all of Jet's builders
//   share (Dropfleet Commander's worker/discord-sync). Discord issues no
//   token a static site can check, so the Worker does the OAuth exchange and
//   hands back a `discord-...` key: HMAC(secret, Discord id), the same on
//   every device. The Worker's allow-list already includes this app's path.
//
// - The key names one Firestore document in the `dropfleet-builder` project's
//   `sync` collection, over the plain REST API (no Firebase SDK). The API key
//   is not a secret; access control is the live firestore.rules, which allow
//   get/update/delete of a document named exactly, and never a listing.
//
// - This app's documents carry an `om2-` prefix. Dropfleet's tokens are
//   letters and hyphens only, so a prefix with a digit can never collide with
//   one, and the other builders each use a prefix of their own.
//
// - The whole store travels as one JSON string in `payload`, the only shape
//   the rules accept (payload, updatedAt, version).

const PROJECT = "dropfleet-builder";
const API_KEY = "AIzaSyCuVs19-E131IHSZ_smWcLLl52djAZuJ60";
const DOC_PREFIX = "om2-";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/sync/`;
const WORKER = "https://dfc-discord-sync.discord-sync.workers.dev";
// Firestore's ceiling is 1 MiB a document; the rules allow 900,000 for payload.
const MAX_PAYLOAD_BYTES = 900_000;

const K = { token: "oathmark.sync.token", user: "oathmark.sync.user", state: "oathmark.sync.state", last: "oathmark.sync.last" };
const load = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const keep = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };

export const syncToken = () => load(K.token);
export const syncUser = () => { try { return JSON.parse(load(K.user) ?? "null"); } catch { return null; } };
export const lastSynced = () => Number(load(K.last)) || null;
export const markSynced = () => keep(K.last, String(Date.now()));

const docUrl = (tok) => `${BASE}${encodeURIComponent(DOC_PREFIX + tok)}?key=${API_KEY}`;

async function failure(res) {
  let detail = "";
  try { detail = (await res.json())?.error?.message ?? ""; } catch {}
  if (res.status === 403) return new Error(`Sync was refused by the server. ${detail}`.trim());
  if (res.status === 429) return new Error("Sync is busy. Try again in a minute.");
  return new Error(detail || `Sync failed (HTTP ${res.status}).`);
}

// An emblem is a key into this device's IndexedDB, meaningless anywhere else,
// so it travels as a data URL and is stored again on the far side.
const blobToDataUrl = (blob) => new Promise((resolve) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => resolve(null);
  r.readAsDataURL(blob);
});

// The cloud copy of an emblem is shrunk to what the app needs at most: the
// print sheet's 26mm emblem at 300dpi is 307px, so 320 prints sharp. The
// stored one is 512px, and the sync's whole document must stay under 900KB.
const EMBLEM_SYNC_PX = 320;

async function shrink(blob) {
  try {
    const img = await createImageBitmap(blob);
    const scale = Math.min(1, EMBLEM_SYNC_PX / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const out = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    return out && out.size < blob.size ? out : blob;
  } catch {
    return blob;
  }
}

async function inlineEmblems(kingdoms) {
  return Promise.all(kingdoms.map(async (k) => {
    if (!k.emblem || k.emblem.startsWith("data:")) return k;
    const blob = await idbGet(k.emblem).catch(() => null);
    const url = blob ? await blobToDataUrl(await shrink(blob)) : null;
    return { ...k, emblem: url };
  }));
}

export async function internEmblems(kingdoms) {
  return Promise.all(kingdoms.map(async (k) => {
    if (!k.emblem?.startsWith("data:")) return k;
    const blob = await (await fetch(k.emblem)).blob();
    return { ...k, emblem: await saveEmblem(blob) };
  }));
}

export async function remoteGet(tok) {
  const res = await fetch(docUrl(tok), { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw await failure(res);
  const raw = (await res.json())?.fields?.payload?.stringValue;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function remotePut(tok, payload) {
  const wire = { ...payload, kingdoms: await inlineEmblems(payload.kingdoms ?? []) };
  const json = JSON.stringify(wire);
  if (new Blob([json]).size > MAX_PAYLOAD_BYTES) {
    throw new Error("Too much to sync in one go; emblem images are most of it. Everything is still saved on this device.");
  }
  const res = await fetch(docUrl(tok), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        payload: { stringValue: json },
        updatedAt: { integerValue: String(Date.now()) },
        version: { integerValue: "1" },
      },
    }),
  });
  if (!res.ok) throw await failure(res);
}

// ── Discord ──────────────────────────────────────────────────────────────

export function discordSignIn() {
  const buf = new Uint8Array(18);
  crypto.getRandomValues(buf);
  const nonce = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
  keep(K.state, nonce);
  const back = `${location.origin}${location.pathname}`;
  location.href = `${WORKER}/login?state=${nonce}&return=${encodeURIComponent(back)}`;
}

export function signOut() {
  keep(K.token, null);
  keep(K.user, null);
  keep(K.last, null);
}

// The Worker sends the browser back with the key in the URL fragment, which
// never reaches a server log. It is read once, as this module loads (before
// the router reads the hash as a page), and wiped from the address bar.
let returned = null;
try {
  if (location.hash.includes("dsync")) {
    returned = new URLSearchParams(location.hash.slice(1));
    history.replaceState(null, "", location.pathname + location.search);
  }
} catch {}

const looksLikeKey = (k) => /^[a-z]+(-[a-z]+){3,}$/.test(k) && k.length >= 24;

// Null unless this load is a return from Discord. Only a sign-in this browser
// started is accepted (the nonce), so a crafted link cannot sign you into an
// account that is not yours.
export function finishDiscord() {
  const p = returned;
  if (!p) return null;
  returned = null;
  const expected = load(K.state);
  keep(K.state, null);
  if (!expected || p.get("ds") !== expected) return { error: "Discord sign-in expired. Try again." };
  const why = p.get("dsync_error");
  if (why) return { error: why === "access_denied" || why === "cancelled" ? "Discord sign-in was cancelled." : "Discord sign-in failed. Try again." };
  const key = p.get("dsync") ?? "";
  if (!looksLikeKey(key)) return { error: "Discord sign-in failed. Try again." };
  const user = { name: p.get("dn") || "Discord", avatar: p.get("da") || "" };
  keep(K.token, key);
  keep(K.user, JSON.stringify(user));
  return { user };
}
