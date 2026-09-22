import React from "react";
import {
  Layout, LayoutHeader, LayoutContent, LayoutPanel,
  HStack, Text, Heading, Button, useMediaQuery, Dialog, DialogHeader,
} from "@astryxdesign/core";
import Ico from "./components/Ico.jsx";
import { BREAK, FRAME, PANEL, GAP } from "./layout.mjs";

// Per-section header + content + optional detail panel. Navigation lives in
// the AppShell's SideNav / MobileNav (App.jsx), so this frame only owns the
// page: its title, file actions, and the sheet panel on the side.
export default function Shell({
  title, subtitle, meta,
  content, detail, detailTitle,
  onNew, onImport, onSave, saved, onBack, onMenu,
}) {
  const noPanels = useMediaQuery(BREAK.panel);
  const narrow = useMediaQuery(BREAK.narrow);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const header = (
    <LayoutHeader>
      <HStack gap={GAP.group} align="center" justify="between" wrap="wrap">
        <HStack gap={GAP.item} align="center">
          {onMenu && (
            <Button className="om-menu-btn" label="Menu" size="sm" variant="ghost" isIconOnly
                    icon={<Ico name="menu" size={20} />} onClick={onMenu} />
          )}
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
        content={<LayoutContent padding={narrow ? 4 : undefined}>{content}</LayoutContent>}
        end={noPanels || !detail ? undefined : <LayoutPanel width={PANEL.detail} hasDivider className="om-sticky">{detail}</LayoutPanel>}
      />

      {noPanels && detail && (
        <Dialog isOpen={detailOpen} onOpenChange={setDetailOpen} width={420}
                header={<DialogHeader title={detailTitle ?? "Details"} />}>
          {detail}
        </Dialog>
      )}
    </>
  );
}
