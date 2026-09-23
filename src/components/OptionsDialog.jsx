import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, VStack, Switch,
} from "@astryxdesign/core";
import { hasLore } from "../lore.mjs";
import { GAP } from "../layout.mjs";

export default function OptionsDialog({ isOpen, onOpenChange, value = {}, onChange }) {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={480} purpose="form">
      <Layout
        header={<DialogHeader title="Options" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={GAP.group} align="start">
              {/* Without the tables in the build there is nothing to switch on,
                  so the switch is absent rather than dead. */}
              {hasLore && (
                <Switch label="Lore and Detail" value={Boolean(value.lore)}
                        onChange={(lore) => onChange({ ...value, lore })} />
              )}
              <Switch label="Muster from my collection" value={Boolean(value.useCollection)}
                      onChange={(useCollection) => onChange({ ...value, useCollection })} />
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}
