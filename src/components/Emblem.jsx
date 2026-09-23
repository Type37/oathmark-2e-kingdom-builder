import React from "react";
import { Avatar } from "@astryxdesign/core/Avatar";
import { useEmblem, useObjectUrl } from "../emblem.mjs";

// A kingdom's heraldry. Pass a stored key, or a draft blob not yet saved.
export default function Emblem({ emblemKey, blob, name, size = "md", fallback = true }) {
  const stored = useEmblem(blob ? null : emblemKey);
  const draft = useObjectUrl(blob);
  const src = draft ?? stored;
  // With no emblem set, Avatar stands in with the kingdom's initials; the bar
  // asks for nothing instead, since the sheet carries the labelled control.
  if (!src && !fallback) return null;
  return (
    <Avatar src={src ?? undefined} name={name || "Emblem"}
            alt={name ? `${name} emblem` : "Emblem"} shape="square" size={size} />
  );
}
