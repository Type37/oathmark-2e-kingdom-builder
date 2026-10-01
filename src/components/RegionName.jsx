import React from "react";
import { HStack, Text } from "@astryxdesign/core";
import InlineName from "./InlineName.jsx";

// "Region 3" is the book's label; the name you give it is yours, renamed by
// clicking it like every other name in the app.
export default function RegionName({ region, value, onChange }) {
  const named = (value ?? "").trim();
  return (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <InlineName label={`Name for Region ${region}`} value={value} placeholder={`Region ${region}`}
                  onChange={onChange} size="sm" type="label" />
      {named && <Text type="label" color="secondary">Region {region}</Text>}
    </HStack>
  );
}
