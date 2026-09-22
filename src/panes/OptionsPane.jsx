import React from "react";
import { VStack, Section, Switch } from "@astryxdesign/core";
import Shell from "../Shell.jsx";
import { hasLore } from "../lore.mjs";
import { GAP } from "../layout.mjs";

export default function OptionsPane({ value, onChange, shell }) {
  return (
    <Shell
      {...shell}
      title="Options"
      content={
        <Section>
          <VStack gap={GAP.group} align="start">
            <Switch label="Lore and Detail" isSelected={Boolean(value.lore)} isDisabled={!hasLore}
                    onChange={(lore) => onChange({ ...value, lore })} />
          </VStack>
        </Section>
      }
    />
  );
}
