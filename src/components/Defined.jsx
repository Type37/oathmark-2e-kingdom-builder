import React from "react";
import { VStack, HStack, Text, Popover, Button } from "@astryxdesign/core";

// The book's own definition, with its page, hung off whatever you click.
export function Definition({ title, text, note, page, extra }) {
  return (
    <VStack gap={2}>
      <HStack gap={2} align="baseline" justify="between">
        <Text type="large">{title}</Text>
        {page && <Text color="secondary">p{page}</Text>}
      </HStack>
      <Text>{text}</Text>
      {note && <Text type="label">{note}</Text>}
      {extra}
    </VStack>
  );
}

// Tokens carry their own button, so they anchor the popover directly.
export default function Defined({ def, label, children, bare, width = 340 }) {
  if (!def) return children;
  return (
    <Popover width={width} label={def.title} placement="below"
             content={<Definition {...def} />}>
      {bare
        ? <span className="om-defined">{children}</span>
        : <Button variant="ghost" size="sm" label={label ?? def.title}>{children}</Button>}
    </Popover>
  );
}
