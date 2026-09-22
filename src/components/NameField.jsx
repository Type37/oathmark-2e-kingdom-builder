import React from "react";
import { HStack, TextInput, Button } from "@astryxdesign/core";
import { Icon } from "@iconify/react";
import { DICE } from "../icons/game.mjs";
import { randomName } from "../names.mjs";

// A text field with a roll button that draws from one of the name pools.
export default function NameField({ label, value, onChange, pool, isOptional, size }) {
  return (
    <HStack gap={2} align="end">
      <TextInput label={label} value={value ?? ""} isOptional={isOptional} size={size} width="100%"
                 onChange={(e) => onChange(e.target?.value ?? e)} />
      {pool?.length > 0 && (
        <Button label={`Roll ${label}`} variant="secondary" size={size} isIconOnly
                icon={<Icon icon={DICE} width={18} height={18} />}
                onClick={() => onChange(randomName(pool, value))} />
      )}
    </HStack>
  );
}
