import React from "react";
import { Theme, AppShell, Text, Banner, Section } from "@astryxdesign/core";
import { SideNav, SideNavHeading, SideNavItem, SideNavSection } from "@astryxdesign/core/SideNav";
import { MobileNav } from "@astryxdesign/core/MobileNav";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import { marchesTheme } from "./theme/marches.js";

import Landing from "./panes/Landing.jsx";
import Emblem from "./components/Emblem.jsx";

import { validateKingdom } from "./rules/kingdom.mjs";
import {
  STORE_KEY, emptyStore, normalise, save, get, remove, duplicate, setActive, activeRecord, toFile,
} from "./rules/store.mjs";
import { parseImport } from "./rules/schema.mjs";
import useSection, { PARENT } from "./useSection.mjs";
import { EXAMPLE_KINGDOMS, loadExample } from "./rules/examples.mjs";
import { saveEmblem, deleteEmblem } from "./emblem.mjs";
import { downloadJson, fileSlug } from "./download.mjs";

// Each page is its own chunk, so the landing screen loads only itself.
const KingdomList = React.lazy(() => import("./panes/KingdomList.jsx"));
const KingdomPane = React.lazy(() => import("./panes/KingdomPane.jsx"));
const MusterList = React.lazy(() => import("./panes/MusterList.jsx"));
const MusterPane = React.lazy(() => import("./panes/MusterPane.jsx"));
const CollectionPane = React.lazy(() => import("./panes/CollectionPane.jsx"));
const ReferencePane = React.lazy(() => import("./panes/ReferencePane.jsx"));
const OptionsPane = React.lazy(() => import("./panes/OptionsPane.jsx"));
const FoundKingdom = React.lazy(() => import("./components/FoundKingdom.jsx"));
const MusterNew = React.lazy(() => import("./components/MusterNew.jsx"));

const EMPTY_KINGDOM = {
  name: "", ruler: "", level: "moderate", capitalList: null,
  territories: [], collection: {}, emblem: null, culture: null,
};
const EMPTY_MUSTER = { name: "", commander: "", points: 1000, units: [], battleType: null, uneven: null };

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

// The owned-miniatures tracker is one record, shared by every kingdom and muster.
const collectionOf = (store) => store.collections[0] ?? { name: "Collection", owned: {} };

export default function App() {
  const [store, setStore] = React.useState(read);
  const [section, setSection] = useSection();
  const [error, setError] = React.useState(null);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [founding, setFounding] = React.useState(false);
  const [mustering, setMustering] = React.useState(false);
  const [deleting, setDeleting] = React.useState(null);
  const fileRef = React.useRef(null);

  React.useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch {}
  }, [store]);

  const kingdom = activeRecord(store, "kingdoms");
  const muster = activeRecord(store, "musters");
  const musterKingdom = muster ? get(store, "kingdoms", muster.kingdomId) : null;
  const collection = collectionOf(store);
  const buildable = store.kingdoms.filter((k) => k.capitalList);

  // Every edit writes straight to the store: nothing to save by hand.
  const update = (kind) => (next) => setStore((s) => save(s, kind, next));
  const go = (id) => { setSection(id); setMenuOpen(false); };
  const open = (kind, id) => {
    setStore((s) => setActive(s, kind, id));
    go(kind === "kingdoms" ? "kingdom" : "muster");
  };

  const exportAll = () => downloadJson("oathmark.json", toFile(store));
  const exportOne = (rec) => downloadJson(`${fileSlug(rec.name)}.json`, JSON.stringify(rec, null, 2));

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      const { kind, value } = parseImport(await file.text());
      if (kind === "store") setStore((s) => normalise({ ...s, ...value }));
      else setStore((s) => save(s, kind, { ...value, id: undefined }));
    } catch (err) {
      setError(err.message);
    }
  }

  const fileActions = [
    { label: "Import", onClick: () => fileRef.current?.click() },
    { label: "Export All", onClick: exportAll },
  ];
  const appActions = [
    { label: "Options", onClick: () => go("options") },
    { type: "divider" },
    ...fileActions,
  ];
  const recordActions = (kind, rec) => rec ? [
    ...(kind === "kingdoms" ? [{ label: "Print", onClick: () => window.print() }] : []),
    { label: "Export", onClick: () => exportOne(rec) },
    { label: "Duplicate", onClick: () => setStore((s) => duplicate(s, kind, rec.id)) },
    { type: "divider" },
    { label: "Delete", variant: "destructive", onClick: () => setDeleting({ kind, rec }) },
  ] : [];

  // Duplicates and re-imports share an emblem key, so only drop the blob when nothing else uses it.
  const emblemInUse = (key, exceptId) =>
    store.kingdoms.some((k) => k.id !== exceptId && k.emblem === key);

  async function setEmblem(rec, blob) {
    const old = rec.emblem;
    const key = blob ? await saveEmblem(blob) : null;
    setStore((s) => save(s, "kingdoms", { ...get(s, "kingdoms", rec.id), emblem: key }));
    if (old && !emblemInUse(old, rec.id)) deleteEmblem(old);
  }

  function confirmDelete() {
    const { kind, rec } = deleting;
    if (kind === "kingdoms" && rec.emblem && !emblemInUse(rec.emblem, rec.id)) deleteEmblem(rec.emblem);
    setStore((s) => remove(s, kind, rec.id));
    setDeleting(null);
    go(kind === "kingdoms" ? "kingdoms" : "musters");
  }

  const shell = {
    onBack: () => go(PARENT[section] ?? "home"),
    onMenu: () => setMenuOpen(true),
    appActions,
    onOptions: () => go("options"),
  };

  // The rail: three builders, then the saved records, with the rules reference last.
  const builders = [
    { id: "kingdoms", label: "Kingdom Builder", match: ["kingdoms", "kingdom"] },
    { id: "musters", label: "Army Builder", match: ["musters", "muster"] },
    { id: "collection", label: "Unit Collection", match: ["collection"] },
  ];
  const navItems = (
    <>
      {builders.map((b) => (
        <SideNavItem key={b.id} label={b.label} isSelected={b.match.includes(section)}
                     onClick={() => go(b.id)} />
      ))}
      <SideNavSection title="Rules">
        <SideNavItem label="Reference" isSelected={section === "reference"} onClick={() => go("reference")} />
      </SideNavSection>
    </>
  );
  const sideNav = section === "home" ? undefined : (
    <SideNav header={<SideNavHeading heading="Oathmark" headingHref="#/" />}>{navItems}</SideNav>
  );

  // A record route with nothing active falls back to its list.
  let page = section;
  if (page === "kingdom" && !kingdom) page = "kingdoms";
  if (page === "muster" && !muster) page = "musters";

  return (
    <Theme theme={marchesTheme} mode="light">
      <AppShell height="auto" contentPadding={0} variant="wash" sideNav={sideNav} mobileNav={false}>
        <MobileNav isOpen={menuOpen} onOpenChange={setMenuOpen} header="Oathmark">
          {navItems}
        </MobileNav>
        <React.Suspense fallback={null}>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onFile} />

        <FoundKingdom
          isOpen={founding}
          onOpenChange={setFounding}
          onFound={(base) => {
            setStore((s) => save(s, "kingdoms", { ...EMPTY_KINGDOM, ...base }));
            setFounding(false);
            go("kingdom");
          }}
        />
        <MusterNew
          isOpen={mustering}
          onOpenChange={setMustering}
          kingdoms={buildable}
          defaultKingdomId={kingdom?.capitalList ? kingdom.id : undefined}
          onMuster={(base) => {
            setStore((s) => save(s, "musters", { ...EMPTY_MUSTER, ...base }));
            setMustering(false);
            go("muster");
          }}
        />
        {deleting && (
          <AlertDialog
            isOpen
            onOpenChange={(o) => !o && setDeleting(null)}
            title={deleting.kind === "kingdoms" ? "Delete Kingdom" : "Delete Army"}
            description={deleting.rec.name || "Untitled"}
            actionLabel="Delete"
            onAction={confirmDelete}
          />
        )}

        {error && (
          <Section paddingBlockEnd={0}>
            <Banner status="error" title={error} isDismissable onDismiss={() => setError(null)} />
          </Section>
        )}

        {page === "home" && <Landing onOpen={go} />}
        {page === "kingdoms" && (
          <KingdomList store={store} fileActions={fileActions} recordActions={recordActions} {...shell}
                       onOpen={(id) => open("kingdoms", id)} onNew={() => setFounding(true)} />
        )}
        {page === "kingdom" && (
          <KingdomPane value={kingdom} onChange={update("kingdoms")} settings={store.settings ?? {}}
                       onPrint={() => window.print()}
                       onEmblem={(blob) => setEmblem(kingdom, blob)}
                       shell={{ ...shell, actions: recordActions("kingdoms", kingdom) }} />
        )}
        {page === "musters" && (
          <MusterList store={store} fileActions={fileActions} {...shell}
                      onOpen={(id) => open("musters", id)} onNew={() => setMustering(true)} />
        )}
        {page === "muster" && (
          <MusterPane
            kingdom={musterKingdom ?? EMPTY_KINGDOM}
            collection={collection.owned}
            value={muster}
            onChange={update("musters")}
            ready={Boolean(musterKingdom?.capitalList && validateKingdom(musterKingdom).ok)}
            shell={{ ...shell, actions: recordActions("musters", muster),
                     leading: <Emblem emblemKey={musterKingdom?.emblem} name={musterKingdom?.name} size="lg" />,
                     subtitle: musterKingdom ? <Text type="label">{musterKingdom.name}</Text> : null }}
          />
        )}
        {page === "collection" && (
          <CollectionPane
            value={collection.owned}
            onChange={(owned) => setStore((s) => ({ ...s, collections: [{ ...collection, owned }] }))}
            shell={shell}
          />
        )}
        {page === "reference" && <ReferencePane shell={shell} />}
        {page === "options" && (
          <OptionsPane value={store.settings ?? {}} shell={shell}
                       onChange={(settings) => setStore((s) => ({ ...s, settings }))} />
        )}
        </React.Suspense>
      </AppShell>
    </Theme>
  );
}
