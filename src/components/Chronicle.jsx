import React from "react";
import { Heading, VStack, HStack, StackItem, Button } from "@astryxdesign/core";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Markdown } from "@astryxdesign/core/Markdown";

// The kingdom's annals (p27): one document, written as the kingdom's story
// unfolds. It reads as formatted text; Edit turns it into a text box that
// takes Markdown, which Astryx renders (it has no rich text editor yet).
export default function Chronicle({ text = "", onChange }) {
  // An empty chronicle opens ready to write, and stays a text box while you
  // write in it; Done is what turns it into the formatted page.
  const [editing, setEditing] = React.useState(() => !text.trim());
  const writing = editing || !text.trim();
  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill"><Heading level={2}>Chronicle</Heading></StackItem>
        {text.trim() && (
          <Button label={editing ? "Done" : "Edit"} variant="secondary" onClick={() => setEditing(!editing)} />
        )}
      </HStack>
      {writing
        ? <TextArea label="Chronicle" isLabelHidden rows={8} value={text} onChange={(v) => onChange(v)} />
        : <Markdown headingLevelStart={3} density="compact">{text}</Markdown>}
    </VStack>
  );
}
