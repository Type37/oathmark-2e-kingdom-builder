import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, FormLayout,
  TextInput, Selector, NumberInput, HStack, Button, Text,
} from "@astryxdesign/core";
import { rollPoints, battleScale } from "../rules/muster.mjs";

// The Army Roster header (p218): Army Name, Army Commander, Total Points,
// plus the kingdom the army is drawn from (p35).
export default function MusterNew({ isOpen, onOpenChange, kingdoms, defaultKingdomId, onMuster }) {
  const [name, setName] = React.useState("");
  const [commander, setCommander] = React.useState("");
  const [kingdomId, setKingdomId] = React.useState(defaultKingdomId ?? kingdoms[0]?.id ?? "");
  const [points, setPoints] = React.useState(1000);

  React.useEffect(() => {
    if (!isOpen) return;
    setName(""); setCommander(""); setPoints(1000);
    setKingdomId(defaultKingdomId ?? kingdoms[0]?.id ?? "");
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const kingdom = kingdoms.find((k) => k.id === kingdomId);
  const roll = () => setPoints(rollPoints(1 + Math.floor(Math.random() * 10), kingdom?.level));
  const scale = battleScale(points);

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width={520} purpose="form">
      <Layout
        header={<DialogHeader title="Muster an Army" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <FormLayout>
              <TextInput label="Army Name" value={name} onChange={(e) => setName(e.target?.value ?? e)} />
              <TextInput label="Army Commander" value={commander} isOptional
                         onChange={(e) => setCommander(e.target?.value ?? e)} />
              <Selector label="Kingdom" value={kingdomId} onChange={setKingdomId}
                        options={kingdoms.map((k) => ({ value: k.id, label: k.name || "Untitled" }))} />
              <HStack gap={2} align="end" wrap="wrap">
                <NumberInput label="Total Points" value={points} min={0} step={50}
                             onChange={(p) => setPoints(p || 0)} />
                <Button label="Roll" variant="secondary" onClick={roll} />
                {scale && <Text type="label">{scale}</Text>}
              </HStack>
            </FormLayout>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} justify="end">
              <Button label="Cancel" variant="secondary" onClick={() => onOpenChange(false)} />
              <Button label="Muster an Army" variant="primary" isDisabled={!kingdomId}
                      onClick={() => onMuster({ name: name.trim(), commander: commander.trim(), kingdomId, points })} />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
