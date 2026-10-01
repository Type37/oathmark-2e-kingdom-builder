import React from "react";
import { TextInput } from "@astryxdesign/core";
import { InputGroup, InputGroupText } from "@astryxdesign/core/InputGroup";
import RollButton from "./RollButton.jsx";
import { randomName } from "../names.mjs";

// A name field with its roll inside it, as one Astryx InputGroup. The roll
// draws from one of the name pools; onRoll replaces the plain draw, for rolls
// that fill more than this field.
export default function NameField({ label, value, onChange, pool, onRoll, isOptional, size }) {
  const field = (
    <TextInput label={label} value={value ?? ""} isOptional={isOptional} size={size}
               onChange={(v) => onChange(v)} />
  );
  if (!onRoll && !(pool?.length > 0)) return field;
  return (
    <InputGroup label={label} isOptional={isOptional} size={size}>
      <TextInput label={label} isLabelHidden value={value ?? ""} onChange={(v) => onChange(v)} />
      <InputGroupText>
        <RollButton label={`Roll ${label}`} variant="ghost" isIconOnly
                    onClick={() => (onRoll ? onRoll() : onChange(randomName(pool, value)))} />
      </InputGroupText>
    </InputGroup>
  );
}
