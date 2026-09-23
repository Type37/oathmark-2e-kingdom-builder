import React from "react";
import { HStack, Text, TextInput } from "@astryxdesign/core";
import Ico from "./Ico.jsx";

// "Region 3" is the book's label; the name you give it is yours. It reads as a
// heading until you point at it, and the pencil says it will take a name.
export default function RegionName({ region, value, onChange }) {
  const [editing, setEditing] = React.useState(false);
  const named = (value ?? "").trim();

  if (editing) {
    return (
      <TextInput
        label={`Name for Region ${region}`}
        isLabelHidden
        autoFocus
        size="sm"
        width={220}
        className="om-region-input"
        value={named}
        placeholder={`Region ${region}`}
        onChange={(e) => onChange(e.target?.value ?? e)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditing(false); }}
      />
    );
  }

  return (
    <button type="button" className="om-region-name" onClick={() => setEditing(true)}
            aria-label={named ? `Rename ${named}` : `Name Region ${region}`}>
      <HStack gap={1} align="center">
        <Text type="label">{named || `Region ${region}`}</Text>
        {named && <Text type="label" className="om-region-ord">Region {region}</Text>}
        <Ico name="pen" size={14} />
      </HStack>
    </button>
  );
}
