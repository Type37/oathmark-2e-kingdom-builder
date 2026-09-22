import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, FormLayout, Field,
  TextInput, RadioList, RadioListItem, HStack, Button,
} from "@astryxdesign/core";
import Emblem from "./Emblem.jsx";
import EmblemDialog from "./EmblemDialog.jsx";
import { saveEmblem } from "../emblem.mjs";

const SIZES = [
  { value: "beginner", label: "Beginner", regions: "Regions 1 & 2" },
  { value: "moderate", label: "Moderate", regions: "Regions 1, 2 & 3" },
  { value: "expert", label: "Expert", regions: "Regions 1, 2, 3 & 4" },
];

export default function FoundKingdom({ isOpen, onOpenChange, onFound }) {
  const [name, setName] = React.useState("");
  const [ruler, setRuler] = React.useState("");
  const [level, setLevel] = React.useState("moderate");
  const [emblem, setEmblem] = React.useState(null);
  const [cropping, setCropping] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) { setName(""); setRuler(""); setLevel("moderate"); setEmblem(null); setBusy(false); }
  }, [isOpen]);

  async function found() {
    setBusy(true);
    const key = emblem ? await saveEmblem(emblem) : null;
    onFound({ name: name.trim(), ruler: ruler.trim(), level, emblem: key });
  }

  return (
    <>
      <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={520} purpose="form">
        <Layout
          header={<DialogHeader title="Found a Kingdom" onOpenChange={onOpenChange} />}
          content={
            <LayoutContent>
              <FormLayout>
                <TextInput label="Kingdom Name" value={name}
                           onChange={(e) => setName(e.target?.value ?? e)} />
                <TextInput label="Current Ruler" value={ruler}
                           onChange={(e) => setRuler(e.target?.value ?? e)} />
                <RadioList label="Oathmark Experience" value={level} onChange={setLevel}>
                  {SIZES.map((s) => (
                    <RadioListItem key={s.value} value={s.value} label={s.label} description={s.regions} />
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
