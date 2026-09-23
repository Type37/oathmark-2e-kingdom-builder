import React from "react";
import { Avatar } from "@astryxdesign/core/Avatar";
import { useEmblem, useObjectUrl } from "../emblem.mjs";

// A kingdom's heraldry. Pass a stored key, or a draft blob not yet saved.
export default function Emblem({ emblemKey, blob, name, size = "md" }) {
  const stored = useEmblem(blob ? null : emblemKey);
  const draft = useObjectUrl(blob);
  const src = draft ?? stored;
  // No emblem yet: Avatar falls back to the kingdom's initials, so the button
  // you click to add one is never an empty square.
  return (
    <Avatar src={src ?? undefined} name={name || "Emblem"}
            alt={name ? `${name} emblem` : "Emblem"} shape="square" size={size} />
  );
}
