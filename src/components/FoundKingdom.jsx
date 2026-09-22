import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, FormLayout, Field,
  RadioList, RadioListItem, HStack, Button, Tooltip,
} from "@astryxdesign/core";
import Emblem from "./Emblem.jsx";
import NameField from "./NameField.jsx";
import { LevelIcon } from "./Level.jsx";
import { rollKingdom, rulerPool, cultureOf } from "../names.mjs";
import { knaveRealm } from "../knave-names.mjs";
import EmblemDialog from "./EmblemDialog.jsx";
import { saveEmblem } from "../emblem.mjs";

// The book's advice on where to start, p17.
const SIZES = [
  { value: "beginner", label: "Beginner", regions: "Regions 1 & 2",
    help: "If you are completely new to the game, and just starting out with collecting miniature armies, you should probably only fill in the territories in Regions 1 and 2." },
  { value: "moderate", label: "Moderate", regions: "Regions 1, 2 & 3",
    help: "If you have a bit more experience, and have an army ready to go, then fill out Regions 1–3." },
  { value: "expert", label: "Expert", regions: "Regions 1, 2, 3 & 4",
    help: "If you are a long-time player and more interested in one-off games with large armies than you are chronicling you kingdom, fill out Regions 1–4." },
];

export default function FoundKingdom({ isOpen, onOpenChange, onFound }) {
  const [name, setName] = React.useState("");
  const [ruler, setRuler] = React.useState("");
  const [culture, setCulture] = React.useState(null);
  const [level, setLevel] = React.useState("moderate");
  const [emblem, setEmblem] = React.useState(null);
  const [cropping, setCropping] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) { setName(""); setRuler(""); setCulture(null); setLevel("moderate"); setEmblem(null); setBusy(false); }
  }, [isOpen]);

  async function found() {
    setBusy(true);
    const key = emblem ? await saveEmblem(emblem) : null;
    // An unnamed kingdom falls back to a Knave 2e roll (pp60-61).
    const filled = name.trim() || ruler.trim() ? { name: name.trim(), ruler: ruler.trim() } : knaveRealm();
    onFound({ name: filled.name, ruler: filled.ruler || ruler.trim(), culture, level, emblem: key });
  }

  return (
    <>
      <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={520} purpose="form">
        <Layout
          header={<DialogHeader title="Found a Kingdom" onOpenChange={onOpenChange} />}
          content={
            <LayoutContent>
              <FormLayout>
                <NameField label="Kingdom Name" value={name}
                           onChange={(n) => { setName(n); setCulture((c) => cultureOf(n) ?? c); }}
                           onRoll={() => { const k = rollKingdom(name); setName(k.name); setCulture(k.culture); setRuler(k.ruler); }} />
                <NameField label="Current Ruler" value={ruler} onChange={setRuler} pool={rulerPool(culture)} />
                <RadioList label="Oathmark Experience" value={level} onChange={setLevel}>
                  {SIZES.map((s) => (
                    <RadioListItem key={s.value} value={s.value} label={s.label} description={s.regions}
                                   endContent={<Tooltip content={s.help}><LevelIcon level={s.value} /></Tooltip>} />
                  ))}
                </RadioList>
                <Field label="Emblem" isOptional>
                  <HStack gap={3} align="center">
                    <Emblem blob={emblem} name={name} size={96} />
                    <Button label={emblem ? "Change" : "Add Emblem"} variant="secondary"
                            onClick={() => setCropping(true)} />
                    {emblem && <Button label="Remove" variant="ghost" onClick={() => setEmblem(null)} />}
                  </HStack>
                </Field>
              </FormLayout>
            </LayoutContent>
          }
          footer={
            <LayoutFooter>
              <HStack gap={2} justify="end">
                <Button label="Cancel" variant="secondary" onClick={() => onOpenChange(false)} />
                <Button label="Found a Kingdom" variant="primary" isLoading={busy} onClick={found} />
              </HStack>
            </LayoutFooter>
          }
        />
      </Dialog>
      <EmblemDialog isOpen={cropping} onOpenChange={setCropping}
                    onDone={(blob) => { setEmblem(blob); setCropping(false); }} />
    </>
  );
}
