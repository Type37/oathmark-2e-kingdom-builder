import React from "react";
import { Theme, AppShell, VStack, Text, Banner, Section } from "@astryxdesign/core";
import { marchesTheme } from "./theme/marches.js";

import { Library } from "./Shell.jsx";
import Landing from "./panes/Landing.jsx";
import KingdomList from "./panes/KingdomList.jsx";
import KingdomPane from "./panes/KingdomPane.jsx";
import CollectionPane from "./panes/CollectionPane.jsx";
import MusterPane from "./panes/MusterPane.jsx";
import ReferencePane from "./panes/ReferencePane.jsx";

import { validateKingdom } from "./rules/kingdom.mjs";
import { STORE_KEY, emptyStore, normalise, save, get, setActive, activeRecord } from "./rules/store.mjs";
import { parseImport } from "./rules/schema.mjs";
import useSection, { PARENT } from "./useSection.mjs";
import { EXAMPLE_KINGDOMS, loadExample } from "./rules/examples.mjs";

const EMPTY_KINGDOM = {
  name: "", ruler: "", level: "moderate", capitalList: null,
  territories: [], collection: {}, chronicle: [],
};
const EMPTY_MUSTER = { name: "", points: 1000, units: [] };

function read() {
  let store;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    store = normalise(raw ? JSON.parse(raw) : null);
  } catch {
    store = emptyStore();
  }
  if (!store.kingdoms.length) {
    for (const e of EXAMPLE_KINGDOMS) store = save(store, "kingdoms", loadExample(e.id));
    store = { ...store, active: {} };
  }
  return store;
}

export default function App() {
  const [store, setStore] = React.useState(read);
  const [section, setSection] = useSection();
  const [kingdom, setKingdom] = React.useState(() => activeRecord(read(), "kingdoms") ?? EMPTY_KINGDOM);
  const [muster, setMuster] = React.useState(EMPTY_MUSTER);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState(null);
  const fileRef = React.useRef(null);

  React.useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch {}
  }, [store]);

  React.useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 1800);
    return () => clearTimeout(t);
  }, [saved]);

  const ready = Boolean(kingdom.capitalList && validateKingdom(kingdom).ok);

  // Everything the frame needs, identical for every section.
  const shell = {
    subtitle: kingdom.name ? <Text type="label">{kingdom.name}</Text> : null,
    onBack: () => setSection(PARENT[section] ?? "home"),
    library: (
      <Library
        section={section}
        onSection={setSection}
        store={store}
        activeIds={store.active}
        onLoad={load}
      />
    ),
    onNew: () => { setKingdom(EMPTY_KINGDOM); setMuster(EMPTY_MUSTER); setSection("kingdom"); },
    onImport: () => fileRef.current?.click(),
    onSave: saveAll,
    saved,
  };

  function saveAll() {
    setStore((s) => {
      let next = s;
      if (kingdom.capitalList) next = save(next, "kingdoms", kingdom);
      if (muster.units.length)
        next = save(next, "musters", { ...muster, name: muster.name || `${muster.points}pts` });
      return next;
    });
    setSaved(true);
  }

  function load(kind, id) {
    const rec = get(store, kind, id);
    if (!rec) return;
    setStore(setActive(store, kind, id));
    if (kind === "kingdoms") { setKingdom({ ...EMPTY_KINGDOM, ...rec }); setSection("kingdom"); }
    if (kind === "musters") { setMuster({ ...EMPTY_MUSTER, ...rec }); setSection("muster"); }
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const { kind, value } = parseImport(await file.text());
      if (kind === "store") setStore((s) => ({ ...s, ...value }));
      else setStore((s) => save(s, kind, { ...value, id: undefined }));
    } catch (err) {
      setError(err.message);
    }
    e.target.value = "";
  }


  return (
    <Theme theme={marchesTheme} mode="light">
      <AppShell height="auto" contentPadding={0} variant="wash">
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
        {error && (
          <Section paddingBlockEnd={0}>
            <Banner status="error" title={error} isDismissable onDismiss={() => setError(null)} />
          </Section>
        )}
        {section === "home" && (
          <Landing onOpen={(id) => setSection(id === "kingdom" ? "kingdoms" : id)} />
        )}
        {section === "kingdoms" && (
          <KingdomList
            store={store}
            onOpen={(id) => load("kingdoms", id)}
            onNew={() => { setKingdom(EMPTY_KINGDOM); setSection("kingdom"); }}
            onBack={() => setSection("home")}
          />
        )}
        {section === "kingdom" && (
          <KingdomPane value={kingdom} onChange={setKingdom} shell={shell} />
        )}
        {section === "collection" && (
          <CollectionPane
            value={kingdom.collection ?? {}}
            onChange={(collection) => setKingdom({ ...kingdom, collection })}
            shell={shell}
          />
        )}
        {section === "muster" && (
          <MusterPane kingdom={kingdom} value={muster} onChange={setMuster} ready={ready} shell={shell} />
        )}
        {section === "reference" && <ReferencePane shell={shell} />}
      </AppShell>
    </Theme>
  );
}
