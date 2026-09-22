import React from "react";
import { Theme, AppShell, Text, Banner, Section } from "@astryxdesign/core";
import { SideNav, SideNavHeading, SideNavItem, SideNavSection } from "@astryxdesign/core/SideNav";
import { MobileNav } from "@astryxdesign/core/MobileNav";
import { marchesTheme } from "./theme/marches.js";

import Landing from "./panes/Landing.jsx";
import FoundKingdom from "./components/FoundKingdom.jsx";
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
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [founding, setFounding] = React.useState(false);
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
    onMenu: () => setMenuOpen(true),
    onNew: () => setFounding(true),
    onImport: () => fileRef.current?.click(),
    onSave: saveAll,
    saved,
  };

  // One nav tree, rendered by SideNav on desktop and MobileNav on phones.
  const SECTIONS = [
    { id: "home", label: "Home" },
    { id: "kingdom", label: "Kingdom" },
    { id: "collection", label: "Collection" },
    { id: "muster", label: "Muster" },
    { id: "reference", label: "Reference" },
  ];
  const navItems = (
    <>
      {SECTIONS.map((s) => (
        <SideNavItem
          key={s.id}
          label={s.label}
          isSelected={section === s.id || (s.id === "kingdom" && section === "kingdoms")}
          onClick={() => { setSection(s.id); setMenuOpen(false); }}
        />
      ))}
      {["kingdoms", "musters"].map((kind) => {
        const rows = store[kind] ?? [];
        if (!rows.length) return null;
        return (
          <SideNavSection key={kind} title={kind === "kingdoms" ? "Kingdoms" : "Musters"}>
            {rows.map((r) => (
              <SideNavItem
                key={r.id}
                label={r.name || "Untitled"}
                isSelected={store.active?.[kind] === r.id}
                onClick={() => { load(kind, r.id); setMenuOpen(false); }}
              />
            ))}
          </SideNavSection>
        );
      })}
    </>
  );
  const sideNav = (
    <SideNav header={<SideNavHeading heading="Oathmark" headingHref="#/" />}>
      {navItems}
    </SideNav>
  );

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
      <AppShell
        height="auto"
        contentPadding={0}
        variant="wash"
        sideNav={sideNav}
        mobileNav={false}
      >
        <MobileNav isOpen={menuOpen} onOpenChange={setMenuOpen} header="Oathmark">
          {navItems}
        </MobileNav>
        <FoundKingdom
          isOpen={founding}
          onOpenChange={setFounding}
          onFound={(base) => {
            setKingdom({ ...EMPTY_KINGDOM, ...base });
            setMuster(EMPTY_MUSTER);
            setFounding(false);
            setSection("kingdom");
          }}
        />
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />
        {error && (
          <Section paddingBlockEnd={0}>
            <Banner status="error" title={error} isDismissable onDismiss={() => setError(null)} />
          </Section>
        )}
        {section === "home" && (
          <Landing onOpen={(id) => setSection(id === "kingdom" ? "kingdoms" : id)} onMenu={() => setMenuOpen(true)} />
        )}
        {section === "kingdoms" && (
          <KingdomList
            store={store}
            onOpen={(id) => load("kingdoms", id)}
            onNew={() => setFounding(true)}
            onBack={() => setSection("home")}
            onMenu={() => setMenuOpen(true)}
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
