import React from "react";
import { VStack, HStack, Text, Button, NumberInput } from "@astryxdesign/core";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import Ico from "./Ico.jsx";
import { GAP } from "../layout.mjs";

// The kingdom's annals, year by year (p27): a back story before the first
// battle, or year one at the founding, then a line for each war as it is fought.
export default function Chronicle({ entries = [], onChange }) {
  const set = (i, next) => onChange(entries.map((e, j) => (j === i ? { ...e, ...next } : e)));
  const add = () => {
    const year = entries.reduce((m, e) => Math.max(m, e.year ?? 0), 0) + 1;
    onChange([...entries, { year, title: "", body: "" }]);
  };

  return (
    <VStack gap={GAP.group}>
      <HStack justify="center" className="om-plate"><Text type="label">Chronicle</Text></HStack>
      {entries.map((e, i) => (
        <VStack key={i} gap={GAP.tight}>
          <HStack gap={GAP.item} align="end">
            <NumberInput label="Year" size="sm" width={88} min={1} value={e.year}
                         onChange={(y) => set(i, { year: Math.max(1, y || 1) })} />
            <TextInput label="Event" size="sm" width="100%" value={e.title}
                       onChange={(title) => set(i, { title })} />
            <Button className="om-remove" label="Remove entry" size="sm" variant="destructive" isIconOnly
                    icon={<Ico name="times" />} onClick={() => onChange(entries.filter((_, j) => j !== i))} />
          </HStack>
          <TextArea label={`Year ${e.year}`} isLabelHidden size="sm" rows={3} value={e.body ?? ""}
                    onChange={(body) => set(i, { body })} />
        </VStack>
      ))}
      <Button label="Add Entry" variant="secondary" size="sm" icon={<Ico name="plus" />} onClick={add} />
    </VStack>
  );
}
