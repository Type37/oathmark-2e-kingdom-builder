import React from "react";
import { HStack, Text } from "@astryxdesign/core";
import InlineName from "./InlineName.jsx";
import { rollPlace } from "../names.mjs";

// "Region 3" is the book's label; the name you give it is yours, renamed by
// clicking it or rolled from the kingdom's own homelands.
export default function RegionName({ region, value, onChange, culture, taken }) {
  const named = (value ?? "").trim();
  return (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <InlineName label={`Name for Region ${region}`} value={value} placeholder={`Region ${region}`}
                  onChange={onChange} onRoll={() => onChange(rollPlace(culture, taken))}
                  size="sm" type="label" />
      {named && <Text type="label" color="secondary">Region {region}</Text>}
    </HStack>
  );
}
