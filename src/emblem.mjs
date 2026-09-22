import React from "react";
import { get, set, del } from "idb-keyval";

// Emblems are image blobs, too large for localStorage, so they live in IndexedDB.
export async function saveEmblem(blob) {
  const key = `emblem:${crypto.randomUUID()}`;
  await set(key, blob);
  return key;
}

export const deleteEmblem = (key) => (key ? del(key) : Promise.resolve());

export function useEmblem(key) {
  const [url, setUrl] = React.useState(null);
  React.useEffect(() => {
    if (!key) { setUrl(null); return; }
    let objectUrl = null;
    let live = true;
    get(key).then((blob) => {
      if (!live || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      live = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [key]);
  return url;
}
