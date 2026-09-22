import React from "react";
import {
  Layout, LayoutHeader, LayoutContent, Section, List, ListItem,
  VStack, HStack, Text, Heading, Button, Banner, TabList, Tab,
} from "@astryxdesign/core";
import Ico from "../components/Ico.jsx";
import Mark from "../components/Mark.jsx";
import { FRAME, GAP, DENSITY } from "../layout.mjs";
import { list as listOf, remove, duplicate, setActive } from "../rules/store.mjs";
import { parseImport } from "../rules/schema.mjs";

const KINDS = [
  { id: "kingdoms", label: "Kingdoms" },
  { id: "collections", label: "Collections" },
  { id: "musters", label: "Musters" },
];

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Saves({ store, onStore, onLoad }) {
  const [kind, setKind] = React.useState("kingdoms");
  const [error, setError] = React.useState(null);
  const fileRef = React.useRef(null);
  const rows = listOf(store, kind);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const { kind: k, value } = parseImport(await file.text());
      if (k === "store") onStore({ ...store, ...value });
      else onStore({ ...store, [k]: [...(store[k] ?? []), { ...value, id: undefined }] });
    } catch (err) {
      setError(err.message);
    }
    e.target.value = "";
  }

  return (
    <Layout
      padding={FRAME.padding}
      defaultHasDividers
      height="auto"
      contentWidth={FRAME.contentWidth}
      header={
        <LayoutHeader>
          <HStack gap={4} align="center" justify="between" wrap="wrap">
            <Heading level={1}>Saves</Heading>
            <HStack gap={2}>
              <Button
                label="Export all"
                size="md"
                variant="secondary"
                icon={<Ico name="arrow-down" size={20} />}
                onClick={() => download("oathmark.json", JSON.stringify(store, null, 2))}
              />
              <Button
                label="Import"
                size="md"
                variant="secondary"
                icon={<Ico name="arrow-up" size={20} />}
                onClick={() => fileRef.current?.click()}
              />
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={0}>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={onFile}
            />
            {error && (
              <Section paddingBlockEnd={3}>
                <Banner status="error" title={error} isDismissable onDismiss={() => setError(null)} />
              </Section>
            )}
            <Section paddingBlockEnd={0}>
              <TabList value={kind} onChange={setKind} hasDivider isFullBleed>
                {KINDS.map((k) => (
                  <Tab key={k.id} value={k.id} label={`${k.label} ${(store[k.id] ?? []).length}`} />
                ))}
              </TabList>
            </Section>
            <Section padding={0}>
              <List hasDividers density={DENSITY.choice}>
                {rows.map((r) => (
                  <ListItem
                    key={r.id}
                    label={r.name || "Untitled"}
                    description={new Date(r.saved).toLocaleString()}
                    startContent={<Mark name="sunwheel" size={22} />}
                    isSelected={store.active?.[kind] === r.id}
                    onClick={() => onLoad(kind, r.id)}
                    endContent={
                      <HStack gap={1}>
                        <Button
                          label="Export"
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          icon={<Ico name="arrow-down" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            download(`${(r.name || "untitled").toLowerCase().replace(/\W+/g, "-")}.json`,
                              JSON.stringify(r, null, 2));
                          }}
                        />
                        <Button
                          label="Duplicate"
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          icon={<Ico name="duplicate" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStore(duplicate(store, kind, r.id));
                          }}
                        />
                        <Button
                          label="Delete"
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          icon={<Ico name="trash" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStore(remove(store, kind, r.id));
                          }}
                        />
                      </HStack>
                    }
                  />
                ))}
              </List>
            </Section>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
