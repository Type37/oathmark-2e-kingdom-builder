import React from "react";
import {
  Layout, LayoutHeader, LayoutContent, LayoutPanel,
  HStack, VStack, Heading, Button, TextInput, useMediaQuery, Dialog, DialogHeader, SizeProvider,
  Breadcrumbs, BreadcrumbItem,
} from "@astryxdesign/core";
import { MoreMenu } from "@astryxdesign/core/MoreMenu";
import Ico from "./components/Ico.jsx";
import { BREAK, FRAME, PANEL, GAP } from "./layout.mjs";

// Per-page frame: one bar holding the way back, the record's name, and every
// action in a single menu. Navigation lives in App (SideNav / MobileNav).
export default function Shell({
  title, titleAction, leading, subtitle, crumbs, meta, actions, appActions, onOptions, onPrint, onRename,
  content, detail, detailTitle, inlineDetail, width,
  onBack, backLabel, onMenu,
}) {
  const noPanels = useMediaQuery(BREAK.panel);
  const narrow = useMediaQuery(BREAK.narrow);
  const [detailOpen, setDetailOpen] = React.useState(false);

  // One menu, in the order you reach for it: this record, then the app.
  const menuItems = [
    ...(narrow && onPrint ? [{ label: "Print", onClick: onPrint }] : []),
    ...(actions ?? []),
    ...(actions?.length && (onOptions || appActions?.length) ? [{ type: "divider" }] : []),
    ...(onOptions ? [{ label: "Options", onClick: onOptions }] : []),
    ...(appActions ?? []),
  ];

  const titleNode = onRename ? (
    <TextInput label="Name" isLabelHidden value={title === "Untitled" ? "" : title}
               placeholder="Untitled" width={narrow ? "100%" : 260} className="om-title-input"
               onChange={(e) => onRename(e.target?.value ?? e)} />
  ) : (
    <Heading level={1}>{title}</Heading>
  );
  const titleBlock = titleAction
    ? <HStack gap={GAP.tight} align="center">{titleNode}{titleAction}</HStack>
    : titleNode;
  // On a phone an editable name cannot share the bar with Back and the trail
  // without running off the edge, so it takes the full width underneath.
  const titleBelow = narrow && Boolean(onRename);

  const lead = (
    <HStack gap={GAP.item} align="center">
      {/* Back is always the first thing in the bar, so it never moves between pages. */}
      {onBack && (
        <Button className="om-back" label={backLabel ?? "Back"} variant="ghost"
                icon={<Ico name="arrow-left" size={20} />} onClick={onBack} />
      )}
      {onMenu && (
        <Button className="om-menu-btn" label="Menu" variant="ghost" isIconOnly
                icon={<Ico name="menu" size={20} />} onClick={onMenu} />
      )}
      {leading}
      {/* Where the record lives, then the record. The parent carries its own
          emblem, so nothing in the bar is an unlabelled stray word. */}
      {crumbs?.length ? (
        <Breadcrumbs label="Trail">
          {crumbs.map((c) => (
            <BreadcrumbItem key={c.label} startIcon={c.icon} onClick={c.onClick}>{c.label}</BreadcrumbItem>
          ))}
          {!titleBelow && <BreadcrumbItem isCurrent>{titleBlock}</BreadcrumbItem>}
        </Breadcrumbs>
      ) : !titleBelow && titleBlock}
      {subtitle}
    </HStack>
  );
  const tools = (
    <HStack gap={GAP.item} align="center" wrap="wrap">
      {meta}
      {onPrint && !narrow && (
        <Button label="Print" variant="secondary"
                icon={<Ico name="printer" size={20} />} onClick={onPrint} />
      )}
      {noPanels && detail && (
        <Button label={detailTitle ?? "Details"} variant="secondary"
                onClick={() => setDetailOpen(true)} />
      )}
      {menuItems.length > 0 && <MoreMenu alignment="end" items={menuItems} />}
    </HStack>
  );

  const header = (
    <LayoutHeader>
      <SizeProvider value="lg">
      {titleBelow ? (
        <VStack gap={GAP.item}>{lead}{titleBlock}{tools}</VStack>
      ) : (
        <HStack gap={GAP.group} align="center" justify="between" wrap="wrap">{lead}{tools}</HStack>
      )}
      </SizeProvider>
    </LayoutHeader>
  );

  // Below the panel breakpoint, a page can keep part of its sheet in view above the content.
  const body = noPanels && inlineDetail ? <>{inlineDetail}{content}</> : content;

  return (
    <>
      <Layout
        padding={narrow ? 4 : 6}
        height="auto"
        contentWidth={width ?? FRAME.contentWidth}
        header={<div className="om-topbar">{header}</div>}
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
