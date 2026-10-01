import React from "react";
import { VStack, HStack, StackItem, Text, HoverCard } from "@astryxdesign/core";
import { lookupAttribute } from "../rules/kingdom.mjs";

// The book's own definition, with its page.
export function Definition({ title, text, note, page, extra }) {
  return (
    <VStack gap={2} maxWidth={340}>
      <HStack gap={2} vAlign="baseline">
        <StackItem size="fill"><Text type="large">{title}</Text></StackItem>
        {page && <Text color="secondary">p{page}</Text>}
      </HStack>
      <Text>{text}</Text>
      {note && <Text type="label">{note}</Text>}
      {extra}
    </VStack>
  );
}

// Every rule in the app opens the same way: hover it, focus it, or tap it.
export default function Defined({ def, children }) {
  if (!def) return children;
  return (
    <HoverCard label={def.title} placement="below" touchTrigger="tap" content={<Definition {...def} />}>
      <Text type="inherit" color="inherit">{children}</Text>
    </HoverCard>
  );
}

// A figure's special abilities as running text, each one its own rule.
export function AttributeTerms({ attributes = [] }) {
  if (!attributes.length) return null;
  return (
    <Text type="supporting">
      {attributes.map((a, i) => {
        const def = lookupAttribute(a);
        return (
          <React.Fragment key={a}>
            {i > 0 && ", "}
            <Defined def={def && { title: a, text: def.text, page: def.page }}>{a}</Defined>
          </React.Fragment>
        );
      })}
    </Text>
  );
}
