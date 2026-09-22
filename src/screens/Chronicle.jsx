import React from "react";
import {
  VStack, HStack, Text, Heading, Button, TextInput, TextArea,
  Section, NumberInput,
} from "@astryxdesign/core";
import Ico from "../components/Ico.jsx";

// A campaign turn is about one year in the life of a kingdom, p37.
export default function Chronicle({ entries = [], ruler, onChange, onRulerChange }) {
  const [draft, setDraft] = React.useState(null);
  const nextYear = entries.length ? Math.max(...entries.map((e) => e.year)) + 1 : 1;

  const save = () => {
    if (!draft?.title?.trim()) return;
    onChange([...entries, { ...draft, title: draft.title.trim() }].sort((a, b) => a.year - b.year));
    setDraft(null);
  };

  return (
    <VStack gap={4}>
      <HStack gap={3} align="center" justify="between" wrap="wrap">
        <Heading level={2}>Chronicle</Heading>
        {!draft && (
          <Button
            label="Add"
            size="sm"
            variant="ghost"
            icon={<Ico name="plus" />}
            onClick={() => setDraft({ year: nextYear, title: "", body: "" })}
          />
        )}
      </HStack>

      <TextInput
        label="Ruler"
        value={ruler ?? ""}
        onChange={(e) => onRulerChange(e.target?.value ?? e)}
        size="sm"
      />

      {draft && (
        <Section padding={3}>
          <VStack gap={2}>
            <HStack gap={2} align="end">
              <NumberInput
                label="Year"
                value={draft.year}
                onChange={(year) => setDraft({ ...draft, year: year || 1 })}
                min={1}
                size="sm"
              />
              <TextInput
                label="Event"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target?.value ?? e })}
                size="sm"
              />
            </HStack>
            <TextArea
              label="Account"
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target?.value ?? e })}
              rows={4}
            />
            <HStack gap={2} justify="between">
              <Button label="Discard" size="sm" variant="ghost" onClick={() => setDraft(null)} />
              <Button label="Save" size="sm" variant="primary" onClick={save} />
            </HStack>
          </VStack>
        </Section>
      )}

      <VStack gap={0}>
        {entries.map((e, i) => (
          <React.Fragment key={`${e.year}-${i}`}>
            <Section padding={0} paddingBlock={3}>
              <VStack gap={1}>
                <HStack gap={3} align="baseline" justify="between">
                  <HStack gap={2} align="baseline">
                    <Text color="secondary">{e.year}</Text>
                    <Text type="label">{e.title}</Text>
                  </HStack>
                  <Button
                    label="Remove"
                    size="sm"
                    variant="ghost"
                    isIconOnly
                    icon={<Ico name="minus" />}
                    onClick={() => onChange(entries.filter((_, j) => j !== i))}
                  />
                </HStack>
                {e.body && <Text className="om-prose">{e.body}</Text>}
              </VStack>
            </Section>
          </React.Fragment>
        ))}
      </VStack>
    </VStack>
  );
}
