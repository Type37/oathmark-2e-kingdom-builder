import React from "react";
import {
  Layout, LayoutHeader, LayoutContent, LayoutPanel,
  VStack, HStack, Text, Heading, Button, List, ListItem, useMediaQuery, Dialog, DialogHeader,
} from "@astryxdesign/core";
import Ico from "./components/Ico.jsx";
import { BREAK, FRAME, PANEL, GAP, DENSITY } from "./layout.mjs";

// One frame for the whole app, scaffolded outside-in from the dual-panel
// template. Only the content region changes between sections, so nothing
// structural moves when the user clicks.
export default function Shell({
  title, subtitle, meta,
  library, content, detail, detailTitle,
  onNew, onImport, onSave, saved, onBack,
}) {
  const noPanels = useMediaQuery(BREAK.panel);
  const narrow = useMediaQuery(BREAK.narrow);
  const [libOpen, setLibOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const header = (
    <LayoutHeader>
      <HStack gap={GAP.group} align="center" justify="between" wrap="wrap">
        <HStack gap={GAP.item} align="center">
          {onBack && (
            <Button
              label="Back"
              size="sm"
              variant="ghost"
              isIconOnly
              icon={<Ico name="arrow-left" size={20} />}
              onClick={onBack}
            />
          )}
          {noPanels && (
            <Button
              label="Menu"
              size="sm"
              variant="ghost"
              isIconOnly
              icon={<Ico name="menu" size={20} />}
              onClick={() => setLibOpen(true)}
            />
          )}
          <Heading level={1}>{title}</Heading>
          {subtitle}
        </HStack>

        {/* File actions sit beside the name they act on, not across the page. */}
        <HStack gap={GAP.item} align="center" wrap="wrap">
          {meta}
          {saved && <Text type="label">Saved</Text>}
          <Button label="Save" size="md" isIconOnly={narrow} variant="primary"
                  icon={<Ico name="floppy-disk" size={18} />} onClick={onSave} />
          <Button label="New" size="md" isIconOnly={narrow} variant="secondary"
                  icon={<Ico name="plus" size={18} />} onClick={onNew} />
          <Button label="Import" size="md" isIconOnly={narrow} variant="secondary"
                  icon={<Ico name="arrow-up" size={18} />} onClick={onImport} />
          {noPanels && detail && (
            <Button label={detailTitle ?? "Details"} size="md" variant="secondary"
                    onClick={() => setDetailOpen(true)} />
          )}
        </HStack>
      </HStack>
    </LayoutHeader>
  );

  return (
    <>
      <Layout
        padding={FRAME.padding}
        height="auto"
        header={header}
        start={noPanels ? undefined : <LayoutPanel width={PANEL.library} hasDivider>{library}</LayoutPanel>}
        content={<LayoutContent padding={narrow ? 4 : undefined}>{content}</LayoutContent>}
        end={noPanels || !detail ? undefined : <LayoutPanel width={PANEL.detail} hasDivider className="om-sticky">{detail}</LayoutPanel>}
      />

      {noPanels && (
        <Dialog isOpen={libOpen} onOpenChange={setLibOpen} width={360}
                header={<DialogHeader title="Library" />}>
          {library}
        </Dialog>
      )}
      {noPanels && detail && (
        <Dialog isOpen={detailOpen} onOpenChange={setDetailOpen} width={420}
                header={<DialogHeader title={detailTitle ?? "Details"} />}>
          {detail}
        </Dialog>
      )}
    </>
  );
}

// The library column: sections, then the saved records for each.
export function Library({ section, onSection, store, activeIds, onLoad, counts }) {
  const sections = [
    { id: "home", label: "Home", icon: "map" },
    { id: "kingdom", label: "Kingdom", icon: "map" },
    { id: "collection", label: "Collection", icon: "cube" },
    { id: "muster", label: "Muster", icon: "sword" },
    { id: "reference", label: "Reference", icon: "skill" },
  ];
  return (
    <VStack gap={GAP.group}>
      <List density={DENSITY.dense}>
        {sections.map((s) => (
          <ListItem
            key={s.id}
            label={s.label}
            isSelected={section === s.id}
            onClick={() => onSection(s.id)}
            endContent={counts?.[s.id] ? <Text type="supporting">{counts[s.id]}</Text> : undefined}
          />
        ))}
      </List>


      {["kingdoms", "musters"].map((kind) => {
        const rows = store[kind] ?? [];
        if (!rows.length) return null;
        return (
          <VStack key={kind} gap={GAP.tight}>
            <Text type="supporting">{kind === "kingdoms" ? "Kingdoms" : "Musters"}</Text>
            <List density={DENSITY.dense}>
              {rows.map((r) => (
                <ListItem
                  key={r.id}
                  label={r.name || "Untitled"}
                  isSelected={activeIds?.[kind] === r.id}
                  onClick={() => onLoad(kind, r.id)}
                />
              ))}
            </List>
          </VStack>
        );
      })}
    </VStack>
  );
}
