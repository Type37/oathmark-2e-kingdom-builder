import React from "react";
import { Token } from "@astryxdesign/core";
import { hueOf } from "../race.mjs";

// The kingdom's Region 1 territory, in its race colour.
export default function Capital({ kingdom }) {
  const cap = kingdom?.territories?.find((t) => t.region === 1);
  if (!cap) return null;
  return <Token label={cap.name} size="sm" color={hueOf(cap.list)} />;
}
