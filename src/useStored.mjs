import React from "react";

const KEY = "oathmark.v1";

function read(fallback) {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

// Storage can be unavailable (private windows, blocked site data); never let
// that take the app down.
export default function useStored(fallback) {
  const [state, setState] = React.useState(() => read(fallback));

  React.useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* not persisted this session */
    }
  }, [state]);

  const reset = React.useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* nothing to clear */
    }
    setState(fallback);
  }, [fallback]);

  return [state, setState, reset];
}
