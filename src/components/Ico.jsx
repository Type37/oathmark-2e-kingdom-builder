import React from "react";
import { Icon, addCollection } from "@iconify/react";
import pepicons from "@iconify-json/pepicons-print/icons.json";

addCollection(pepicons);

export default function Ico({ name, size = 16 }) {
  return <Icon icon={`pepicons-print:${name}`} width={size} height={size} />;
}
