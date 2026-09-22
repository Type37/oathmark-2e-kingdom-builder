import React from "react";
import { Popover, Button, Text, Heading, VStack, HStack } from "@astryxdesign/core";
import { lookupAttribute, stats } from "../rules/kingdom.mjs";

// Every definition is the book's own wording, Appendix A p183 and Figure Stats p42.
function Entry({ title, note, text, page }) {
  return (
    <VStack gap={2}>
      <HStack gap={2} align="baseline" justify="between">
        <Heading level={4}>{title}</Heading>
        <Text type="supporting" color="secondary">p{page}</Text>
      </HStack>
      <Text>{text}</Text>
      {note && <Text color="secondary">{note}</Text>}
    </VStack>
  );
}

export function AttributeChip({ label, size = "sm" }) {
  const def = lookupAttribute(label);
  if (!def) return <Text color="secondary">{label}</Text>;
  return (
    <Popover
      width={320}
      label={def.name}
      placement="below"
      content={
        <Entry
          title={def.level ? `${def.name} (${def.level})` : def.name}
          text={def.text}
          page={def.page}
        />
      }
    >
      <Button label={label} size={size} variant="ghost" />
    </Popover>
  );
}

export function StatChip({ statKey, value }) {
  const def = stats[statKey];
  const label = statKey === "pts" ? "Pts" : statKey;
  if (!def) return null;
  return (
    <Popover
      width={320}
      label={def.name}
      placement="below"
      content={<Entry title={def.name} text={def.text} note={def.note} page={def.page} />}
    >
      <Button label={`${label} ${value}`} size="sm" variant="ghost" />
    </Popover>
  );
}
