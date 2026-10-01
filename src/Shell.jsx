import React from "react";
import {
  Icon, Layout, LayoutHeader, LayoutContent, LayoutPanel, LayoutFooter, HStack, VStack, StackItem,
  Heading, Button, TextInput, useMediaQuery, Dialog, DialogHeader, SizeProvider, Breadcrumbs,
  BreadcrumbItem,
} from "@astryxdesign/core";
import { MoreMenu } from "@astryxdesign/core/MoreMenu";
import { VisuallyHidden } from "@astryxdesign/core/VisuallyHidden";
import Footer from "./components/Footer.jsx";
import { BREAK, FRAME, PANEL, GAP } from "./layout.mjs";

// Per-page frame, after Astryx's detail-page template: a fixed header with the
// way back, the record's name and every action; the content and the sheet
// panel scroll on their own; the credits sit in the footer. Below the panel
// breakpoint the sheet opens as a full-screen dialog.
export default function Shell({
  title, titleAction, leading, subtitle, crumbs, meta, actions, appActions, onOptions, onPrint, onRename,
  content, detail, detailTitle, inlineDetail, width,
  onBack, backLabel,
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

  // An editable name is a field, not a heading, so the page's h1 is said once
  // for screen readers beside it.
  const titleNode = onRename ? (
    <>
      <VisuallyHidden as="h1">{title}</VisuallyHidden>
      <TextInput label="Name" isLabelHidden value={title === "Untitled" ? "" : title}
                 placeholder="Untitled" width={narrow ? "100%" : 280}
                 onChange={(v) => onRename(v)} />
    </>
  ) : (
    <Heading level={1}>{title}</Heading>
  );
  const titleBlock = titleAction
    ? <HStack gap={GAP.tight} vAlign="center">{titleNode}{titleAction}</HStack>
    : titleNode;
  // On a phone an editable name cannot share the bar with Back and the trail
  // without running off the edge, so it takes the full width underneath.
  const titleBelow = narrow && Boolean(onRename);

  const lead = (
    <HStack gap={GAP.item} vAlign="center" wrap="wrap">
      {/* Back is always the first thing in the bar, so it never moves between pages. */}
      {onBack && (
        <Button label={backLabel ?? "Back"} variant="ghost" icon={<Icon icon="app:back" />} onClick={onBack} />
      )}
      {leading}
      {/* Where the record lives, then the record. */}
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
    <HStack gap={GAP.item} vAlign="center" wrap="wrap">
      {meta}
      {onPrint && !narrow && (
        <Button label="Print" variant="secondary" icon={<Icon icon="app:print" />} onClick={onPrint} />
      )}
      {noPanels && detail && (
        <Button label={detailTitle ?? "Details"} variant="secondary" onClick={() => setDetailOpen(true)} />
      )}
      {menuItems.length > 0 && <MoreMenu alignment="end" items={menuItems} />}
    </HStack>
  );

  const header = (
    <LayoutHeader hasDivider padding={narrow ? 4 : 6}>
      <SizeProvider value="lg">
        {titleBelow ? (
          <VStack gap={GAP.item}>{lead}{titleBlock}{tools}</VStack>
        ) : (
          <HStack gap={GAP.group} vAlign="center" wrap="wrap">
            <StackItem size="fill">{lead}</StackItem>
            {tools}
          </HStack>
        )}
      </SizeProvider>
    </LayoutHeader>
  );

  // Below the panel breakpoint, a page can keep part of its sheet in view above the content.
  const body = noPanels && inlineDetail ? <>{inlineDetail}{content}</> : content;

  return (
    <>
      <Layout
        height="fill"
        contentWidth={width ?? FRAME.contentWidth}
        header={header}
        content={(
          <LayoutContent padding={narrow ? 4 : 6}>
            {body}
            {/* A phone has no room to keep the credits pinned, so they close the page. */}
            {narrow && <Footer />}
          </LayoutContent>
        )}
        end={noPanels || !detail ? undefined : (
          <LayoutPanel width={PANEL.detail} padding={6} hasDivider>{detail}</LayoutPanel>
        )}
        footer={narrow ? undefined : <LayoutFooter hasDivider><Footer /></LayoutFooter>}
      />

      {noPanels && detail && (
        <Dialog variant="fullscreen" isOpen={detailOpen} onOpenChange={setDetailOpen}>
          <Layout
            header={<DialogHeader title={detailTitle ?? "Details"} onOpenChange={setDetailOpen} />}
            content={<LayoutContent padding={4}>{detail}</LayoutContent>}
          />
        </Dialog>
      )}
    </>
  );
}
