import React from "react";
import { get, set, del } from "idb-keyval";

// Emblems are image blobs, too large for localStorage, so they live in IndexedDB.
export async function saveEmblem(blob) {
  const key = `emblem:${crypto.randomUUID()}`;
  await set(key, blob);
  return key;
}

export const deleteEmblem = (key) => (key ? del(key) : Promise.resolve());

export function useObjectUrl(blob) {
  const [url, setUrl] = React.useState(null);
  React.useEffect(() => {
    if (!blob) { setUrl(null); return; }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

export function useEmblem(key) {
  const [blob, setBlob] = React.useState(null);
  React.useEffect(() => {
    if (!key) { setBlob(null); return; }
    let live = true;
    get(key).then((b) => { if (live) setBlob(b ?? null); });
    return () => { live = false; };
  }, [key]);
  return useObjectUrl(blob);
}
