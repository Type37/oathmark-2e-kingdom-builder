import React from "react";
import { mergeStores, payloadOf, applyMerged } from "./rules/sync.mjs";
import {
  syncToken, syncUser, lastSynced, markSynced, remoteGet, remotePut, internEmblems,
  discordSignIn, signOut, finishDiscord,
} from "./sync.mjs";

// After an edit, wait this long for the next one before syncing.
const EDIT_DELAY = 3000;
// Coming back to the tab, or the connection returning, syncs at most this often.
const MIN_GAP = 30_000;

// Runs Discord Sync for the app: once on load, after edits, and when you come
// back to the tab. Events, not polling, so an idle phone spends nothing.
export default function useSync(store, setStore) {
  const [state, setState] = React.useState(() => ({ user: syncToken() ? syncUser() : null, busy: false, error: null }));
  const latest = React.useRef(store);
  latest.current = store;
  // What was last agreed with the cloud, so a sync's own write does not
  // schedule another sync of itself.
  const agreed = React.useRef(null);
  const running = React.useRef(false);

  const run = React.useCallback(async () => {
    const tok = syncToken();
    if (!tok || running.current) return;
    running.current = true;
    setState((s) => ({ ...s, busy: true, error: null }));
    try {
      const remote = await remoteGet(tok);
      const merged = mergeStores(payloadOf(latest.current), remote ?? {});
      // Only an emblem that came from the cloud arrives as a data URL.
      merged.kingdoms = await internEmblems(merged.kingdoms);
      const next = applyMerged(latest.current, mergeStores(payloadOf(latest.current), merged));
      agreed.current = JSON.stringify(payloadOf(next));
      setStore(next);
      await remotePut(tok, payloadOf(next));
      markSynced();
      setState((s) => ({ ...s, busy: false }));
    } catch (e) {
      setState((s) => ({ ...s, busy: false, error: e.message }));
    } finally {
      running.current = false;
    }
  }, [setStore]);

  // A return from Discord signs in, then syncs at once.
  React.useEffect(() => {
    const done = finishDiscord();
    if (done?.error) setState((s) => ({ ...s, error: done.error }));
    else if (done?.user) setState((s) => ({ ...s, user: done.user }));
    run();
  }, [run]);

  // An edit syncs once you pause.
  React.useEffect(() => {
    if (!syncToken()) return undefined;
    if (JSON.stringify(payloadOf(store)) === agreed.current) return undefined;
    const t = setTimeout(run, EDIT_DELAY);
    return () => clearTimeout(t);
  }, [store, run]);

  // Back to the tab, or back online.
  React.useEffect(() => {
    const maybe = () => {
      if (document.visibilityState === "hidden") return;
      if (Date.now() - (lastSynced() ?? 0) >= MIN_GAP) run();
    };
    document.addEventListener("visibilitychange", maybe);
    window.addEventListener("focus", maybe);
    window.addEventListener("online", maybe);
    return () => {
      document.removeEventListener("visibilitychange", maybe);
      window.removeEventListener("focus", maybe);
      window.removeEventListener("online", maybe);
    };
  }, [run]);

  return {
    ...state,
    signIn: discordSignIn,
    syncNow: run,
    signOut: () => { signOut(); agreed.current = null; setState({ user: null, busy: false, error: null }); },
  };
}
