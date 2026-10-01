import React from "react";
import {
  Icon, Heading, VStack, HStack, StackItem, Button, NumberInput,
} from "@astryxdesign/core";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";

// The kingdom's annals (p27), dated the way a medieval chronicle dates them:
// by the year of the reign. A new entry is written under the current ruler,
// one year on from their last; a new ruler starts again at year one, and the
// entries already written keep whoever reigned then.
export default function Chronicle({ entries = [], ruler = "", onChange }) {
  const set = (i, next) => onChange(entries.map((e, j) => (j === i ? { ...e, ...next } : e)));
  const add = () => {
    const reign = entries.filter((e) => (e.ruler ?? "") === ruler);
    const year = reign.reduce((m, e) => Math.max(m, e.year ?? 0), 0) + 1;
    onChange([...entries, { year, ruler, title: "", body: "" }]);
  };

  return (
    <VStack gap={4}>
      <Heading level={2}>Chronicle</Heading>
      {entries.map((e, i) => (
        <VStack key={i} gap={2}>
          <HStack gap={2} vAlign="end">
            <NumberInput label="Year" width={88} min={1} value={e.year}
                         onChange={(y) => set(i, { year: Math.max(1, y || 1) })} />
            <StackItem size="fill">
              <TextInput label="Of" width="100%" value={e.ruler ?? ""}
                         onChange={(r) => set(i, { ruler: r })} />
            </StackItem>
            <Button label="Remove entry" variant="ghost" isIconOnly
                    icon={<Icon icon="close" />} onClick={() => onChange(entries.filter((_, j) => j !== i))} />
          </HStack>
          <TextInput label="Event" width="100%" value={e.title}
                     onChange={(title) => set(i, { title })} />
          <TextArea label={regnalYear(e)} isLabelHidden rows={3} value={e.body ?? ""}
                    onChange={(body) => set(i, { body })} />
        </VStack>
      ))}
      <Button label="Add Entry" variant="secondary" icon={<Icon icon="app:plus" />} onClick={add} />
    </VStack>
  );
}

// "Year 3 of Barrok IV", or plain "Year 3" for an entry with no ruler.
export const regnalYear = (e) => (e.ruler?.trim() ? `Year ${e.year} of ${e.ruler.trim()}` : `Year ${e.year}`);
