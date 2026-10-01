import React from "react";
import { HStack, Heading, Icon, Link, Text, TextInput } from "@astryxdesign/core";

// A name you rename by clicking it: it reads as the title, with a pen to say
// it takes a name, and turns into a field in place. Enter, Escape or leaving
// the field puts the title back.
export default function InlineName({ label, value, placeholder, onChange, size = "lg", type = "large", heading }) {
  const [editing, setEditing] = React.useState(false);
  const shown = (value ?? "").trim() || placeholder;

  if (editing) {
    return (
      <TextInput label={label} isLabelHidden size={size} width="100%" hasAutoFocus
                 value={value ?? ""} placeholder={placeholder} onChange={(v) => onChange(v)}
                 onEnter={() => setEditing(false)} onBlur={() => setEditing(false)}
                 onKeyDown={(e) => { if (e.key === "Escape") setEditing(false); }} />
    );
  }
  // A link, not a ghost button: it carries no inner padding, so the name sits
  // on the same left line as everything under it.
  return (
    <Link color="inherit" label={`Rename ${shown}`} onClick={() => setEditing(true)}>
      <HStack gap={2} vAlign="center">
        {heading ? <Heading level={heading}>{shown}</Heading> : <Text type={type}>{shown}</Text>}
        <Icon icon="app:pen" size="sm" color="secondary" />
      </HStack>
    </Link>
  );
}
