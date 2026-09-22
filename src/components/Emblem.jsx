import React from "react";
import { Thumbnail } from "@astryxdesign/core";
import { useEmblem } from "../emblem.mjs";

export default function Emblem({ emblemKey, name }) {
  const url = useEmblem(emblemKey);
  if (!url) return null;
  return <Thumbnail src={url} alt={name ? `${name} emblem` : "Emblem"} />;
}
