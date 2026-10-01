import React from "react";
import {
  Icon, Heading, VStack, HStack, Text, Button, NumberInput,
} from "@astryxdesign/core";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";

// The kingdom's annals, year by year (p27): a back story before the first
// battle, or year one at the founding, then a line for each war as it is fought.
export default function Chronicle({ entries = [], onChange }) {
  const set = (i, next) => onChange(entries.map((e, j) => (j === i ? { ...e, ...next } : e)));
  const add = () => {
    const year = entries.reduce((m, e) => Math.max(m, e.year ?? 0), 0) + 1;
    onChange([...entries, { year, title: "", body: "" }]);
  };

  return (
    <VStack gap={4}>
      <Heading level={2}>Chronicle</Heading>
      {entries.map((e, i) => (
        <VStack key={i} gap={2}>
          <HStack gap={2} vAlign="end">
            <NumberInput label="Year" width={88} min={1} value={e.year}
                         onChange={(y) => set(i, { year: Math.max(1, y || 1) })} />
            <TextInput label="Event" width="100%" value={e.title}
                       onChange={(title) => set(i, { title })} />
            <Button label="Remove entry" variant="ghost" isIconOnly
                    icon={<Icon icon="close" />} onClick={() => onChange(entries.filter((_, j) => j !== i))} />
          </HStack>
          <TextArea label={`Year ${e.year}`} isLabelHidden rows={3} value={e.body ?? ""}
                    onChange={(body) => set(i, { body })} />
        </VStack>
      ))}
      <Button label="Add Entry" variant="secondary" icon={<Icon icon="app:plus" />} onClick={add} />
    </VStack>
  );
}
