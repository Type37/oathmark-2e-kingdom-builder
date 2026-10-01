import React from "react";
import {
  Icon, Heading, VStack, HStack, StackItem, Button, NumberInput,
} from "@astryxdesign/core";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import { FormLayout } from "@astryxdesign/core/FormLayout";
import { Divider } from "@astryxdesign/core/Divider";

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

  // Laid out like every section here: its heading with its action at the right,
  // then one form per entry, divided from the next. FormLayout owns the fields' spacing; year and
  // ruler are a natural pair, so they share a row.
  return (
    <VStack gap={4}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill"><Heading level={2}>Chronicle</Heading></StackItem>
        <Button label="Add Entry" variant="secondary" icon={<Icon icon="app:plus" />} onClick={add} />
      </HStack>
      {entries.map((e, i) => (
        <VStack key={i} gap={2}>
          {i > 0 && <Divider />}
          <FormLayout>
            <FormLayout direction="horizontal">
              <NumberInput label="Year" min={1} value={e.year}
                           onChange={(y) => set(i, { year: Math.max(1, y || 1) })} />
              <TextInput label="Ruler" value={e.ruler ?? ""} onChange={(r) => set(i, { ruler: r })} />
            </FormLayout>
            <TextInput label="Event" value={e.title} onChange={(title) => set(i, { title })} />
            <TextArea label="Account" rows={3} value={e.body ?? ""} onChange={(body) => set(i, { body })} />
          </FormLayout>
          <HStack hAlign="end">
            <Button label="Remove entry" variant="ghost" onClick={() => onChange(entries.filter((_, j) => j !== i))} />
          </HStack>
        </VStack>
      ))}
    </VStack>
  );
}

// "Year 3 of Barrok IV", or plain "Year 3" for an entry with no ruler.
export const regnalYear = (e) => (e.ruler?.trim() ? `Year ${e.year} of ${e.ruler.trim()}` : `Year ${e.year}`);
