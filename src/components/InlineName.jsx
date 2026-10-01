import React from "react";
import { Button, Icon, Text, TextInput } from "@astryxdesign/core";

// A name you rename by clicking it: it reads as the title, with a pen to say
// it takes a name, and turns into a field in place. Enter, Escape or leaving
// the field puts the title back.
export default function InlineName({ label, value, placeholder, onChange, size = "lg", type = "large" }) {
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
  return (
    <Button variant="ghost" size={size} label={`Rename ${shown}`} onClick={() => setEditing(true)}
            endContent={<Icon icon="app:pen" size="sm" color="secondary" />}>
      <Text type={type}>{shown}</Text>
    </Button>
  );
}
