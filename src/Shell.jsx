import React from "react";
import {
  Layout, LayoutHeader, LayoutContent, LayoutPanel,
  HStack, Heading, Button, useMediaQuery, Dialog, DialogHeader,
} from "@astryxdesign/core";
import { MoreMenu } from "@astryxdesign/core/MoreMenu";
import Ico from "./components/Ico.jsx";
import { BREAK, FRAME, PANEL, GAP } from "./layout.mjs";

// Per-page frame: title, record actions, content, and the sheet panel.
// Navigation lives in App (SideNav / MobileNav); edits autosave.
export default function Shell({
  title, leading, subtitle, meta, actions, appActions,
  content, detail, detailTitle, inlineDetail,
  onBack, onMenu,
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
            <Button label="Back" size="sm" variant="ghost" isIconOnly
                    icon={<Ico name="arrow-left" size={20} />} onClick={onBack} />
          )}
          {appActions?.length > 0 && <MoreMenu items={appActions} label="Oathmark" alignment="start" />}
          {leading}
          <Heading level={1}>{title}</Heading>
          {subtitle}
        </HStack>
        <HStack gap={GAP.item} align="center" wrap="wrap">
          {meta}
          {noPanels && detail && (
            <Button label={detailTitle ?? "Details"} size="md" variant="secondary"
                    onClick={() => setDetailOpen(true)} />
          )}
          {actions?.length > 0 && <MoreMenu items={actions} alignment="end" />}
        </HStack>
      </HStack>
    </LayoutHeader>
  );

  // Below the panel breakpoint, a page can keep part of its sheet in view above the content.
  const body = noPanels && inlineDetail ? <>{inlineDetail}{content}</> : content;

  return (
    <>
      <Layout
        padding={narrow ? 4 : 6}
        height="auto"
        contentWidth={FRAME.contentWidth}
        header={header}
        content={<LayoutContent padding={narrow ? 4 : 6}>{body}</LayoutContent>}
        end={noPanels || !detail ? undefined : <LayoutPanel width={PANEL.detail} hasDivider className="om-sticky">{detail}</LayoutPanel>}
      />

      {noPanels && detail && (
        <Dialog isOpen={detailOpen} onOpenChange={setDetailOpen} width={420}>
          <Layout
            header={<DialogHeader title={detailTitle ?? "Details"} onOpenChange={setDetailOpen} />}
            content={<LayoutContent>{detail}</LayoutContent>}
          />
        </Dialog>
      )}
    </>
  );
}
