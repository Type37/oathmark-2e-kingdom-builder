import React from "react";
import {
  VStack, HStack, Text, Section, TabList, Tab, TextInput, List, ListItem, Token,
} from "@astryxdesign/core";
import Shell from "../Shell.jsx";
import { attributes } from "../rules/kingdom.mjs";
import { spells, magicItems } from "../rules/magic.mjs";
import { GAP, DENSITY } from "../layout.mjs";

// Everything in the book's own words, from Appendices A, B and C.
export default function ReferencePane({ shell }) {
  const [kind, setKind] = React.useState("attributes");
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();

  const rows =
    kind === "attributes"
      ? Object.values(attributes)
          .filter((a) => !q || a.name.toLowerCase().includes(q) || a.text.toLowerCase().includes(q))
          .map((a) => ({ key: a.name, label: a.name, badge: `p${a.page}`, text: a.text }))
      : kind === "spells"
        ? spells
            .filter((s) => !q || s.name.toLowerCase().includes(q) || s.text.toLowerCase().includes(q))
            .map((s) => ({ key: `${s.group}-${s.name}`, label: s.name, badge: `CN${s.cn}`, meta: `${s.group} · p${s.page}`, text: s.text }))
        : magicItems
            .filter((i) => !q || i.name.toLowerCase().includes(q) || i.text.toLowerCase().includes(q))
            .map((i) => ({ key: i.name, label: i.name, badge: `${i.pts}pts`, meta: `p${i.page}`, text: i.text }));

  return (
    <Shell
      {...shell}
      title="Reference"
      content={
        <VStack gap={0}>
          <Section paddingBlockEnd={GAP.item}>
            <TextInput label="Search" value={query} size="sm"
                       onChange={(e) => setQuery(e.target?.value ?? e)} />
          </Section>
          <Section paddingBlockEnd={0}>
            <TabList value={kind} onChange={setKind}>
              <Tab value="attributes" label="Attributes" />
              <Tab value="spells" label="Spells" />
              <Tab value="items" label="Magic Items" />
            </TabList>
          </Section>
          <Section padding={0}>
            <List density={DENSITY.data}>
              {rows.map((r) => (
                <ListItem
                  key={r.key}
                  label={r.label}
                  description={
                    <VStack gap={0}>
                      {r.meta && <Text type="supporting">{r.meta}</Text>}
                      <Text>{r.text}</Text>
                    </VStack>
                  }
                  endContent={<Token label={r.badge} size="sm" />}
                />
              ))}
            </List>
          </Section>
        </VStack>
      }
    />
  );
}
