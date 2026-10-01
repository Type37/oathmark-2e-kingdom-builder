import React from "react";
import { HStack, Text, TextInput } from "@astryxdesign/core";

// "Region 3" is the book's label; the name you give it is yours. It is a
// field like every other name in the app, with the book's label beside it.
export default function RegionName({ region, value, onChange }) {
  const named = (value ?? "").trim();
  return (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <TextInput label={`Name for Region ${region}`} isLabelHidden size="sm" width={220}
                 value={value ?? ""} placeholder={`Region ${region}`} onChange={(v) => onChange(v)} />
      {named && <Text type="label" color="secondary">Region {region}</Text>}
    </HStack>
  );
}
