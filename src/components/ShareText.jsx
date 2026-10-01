import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, VStack, Button,
} from "@astryxdesign/core";
import { TextArea } from "@astryxdesign/core/TextArea";
import { GAP } from "../layout.mjs";

// The roster as text to copy, or to hand to the phone's share sheet where there is one.
export default function ShareText({ isOpen, onOpenChange, text, title }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => { if (isOpen) setCopied(false); }, [isOpen]);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard blocked: the text is selectable in the field below.
    }
  }

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={520} purpose="form">
      <Layout
        header={<DialogHeader title="Share as Text" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={GAP.group}>
              <TextArea label="Roster" isLabelHidden isReadOnly rows={14} value={text}
                        onFocus={(e) => e.target?.select?.()} />
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            {canShare && (
              <Button label="Share" variant="secondary"
                      onClick={() => navigator.share({ title, text }).catch(() => {})} />
            )}
            <Button label={copied ? "Copied" : "Copy"} variant="primary" onClick={copy} />
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
