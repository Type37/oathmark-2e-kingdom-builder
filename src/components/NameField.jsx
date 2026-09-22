import React from "react";
import { HStack, TextInput } from "@astryxdesign/core";
import RollButton from "./RollButton.jsx";
import { randomName } from "../names.mjs";

// A text field with a roll button that draws from one of the name pools.
// onRoll replaces the plain draw, for rolls that fill more than this field.
export default function NameField({ label, value, onChange, pool, onRoll, isOptional, size, width = "100%" }) {
  return (
    <HStack gap={2} align="end">
      <TextInput label={label} value={value ?? ""} isOptional={isOptional} size={size} width={width}
                 onChange={(e) => onChange(e.target?.value ?? e)} />
      {(onRoll || pool?.length > 0) && (
        <RollButton label={`Roll ${label}`} size={size} isIconOnly
                    onClick={() => (onRoll ? onRoll() : onChange(randomName(pool, value)))} />
      )}
    </HStack>
  );
}
