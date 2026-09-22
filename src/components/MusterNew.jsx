import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, FormLayout,
  Selector, NumberInput, HStack, VStack, Button, Text, Heading, Switch, Token, Card,
} from "@astryxdesign/core";
import { rollPoints, battleScale } from "../rules/muster.mjs";
import {
  BATTLE_TYPES, battleTypeById, rollBattleType, rollLabel,
  beginnerAdvice, rollPointsModifier, applyModifier,
} from "../rules/battle.mjs";
import NameField from "./NameField.jsx";
import { Icon } from "@iconify/react";
import { DICE } from "../icons/game.mjs";
import { rulerPool } from "../names.mjs";
import { GAP } from "../layout.mjs";

// The campaign turn's first steps in the book's order: Battle Type (p29),
// Points Value (p33), then the army itself (p35).
export default function MusterNew({ isOpen, onOpenChange, kingdoms, defaultKingdomId, onMuster }) {
  const [name, setName] = React.useState("");
  const [commander, setCommander] = React.useState("");
  const [kingdomId, setKingdomId] = React.useState(defaultKingdomId ?? kingdoms[0]?.id ?? "");
  const [battle, setBattle] = React.useState(null);
  const [points, setPoints] = React.useState(1000);
  const [uneven, setUneven] = React.useState(false);
  const [modifier, setModifier] = React.useState(null);

  React.useEffect(() => {
    if (!isOpen) return;
    setName(""); setCommander(""); setPoints(1000);
    setBattle(null); setUneven(false); setModifier(null);
    setKingdomId(defaultKingdomId ?? kingdoms[0]?.id ?? "");
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const kingdom = kingdoms.find((k) => k.id === kingdomId);
  const advice = beginnerAdvice(kingdom);
  const chosen = battle ? battleTypeById.get(battle) : null;
  const scale = battleScale(points);
  const attackerPoints = uneven && modifier != null ? applyModifier(points, modifier) : null;

  const rollBattle = () => setBattle(rollBattleType().id);
  const rollSize = () => setPoints(rollPoints(1 + Math.floor(Math.random() * 10), kingdom?.level));

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width="min(1100px, 94vw)" maxHeight="92dvh">
      <Layout
        header={<DialogHeader title="Muster an Army" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={GAP.group}>
              <HStack gap={GAP.item} align="center" justify="between" wrap="wrap">
                <HStack justify="center" className="om-plate"><Text type="label">Battle Type</Text></HStack>
                <Button label="Roll 1d10 for Battle Type" variant="secondary" onClick={rollBattle}
                        icon={<Icon icon={DICE} width={18} height={18} />} />
              </HStack>
              {advice && <HStack className="om-callout"><Text>{advice}</Text></HStack>}
              <div className="om-battle-grid">
                {BATTLE_TYPES.map((b) => (
                  <Card key={b.id} variant={b.id === battle ? "pink" : undefined}
                        className="om-card" onClick={() => setBattle(b.id)}>
                    <VStack gap={GAP.item}>
                      <HStack gap={GAP.item} align="baseline" justify="between" wrap="wrap">
                        <Heading level={3}>{b.name}</Heading>
                        <HStack gap={1} align="center">
                          <Token label={rollLabel(b)} size="sm" />
                          {b.attacker && <Token label="Attacker" size="sm" color="red" />}
                        </HStack>
                      </HStack>
                      <Text>{b.text}</Text>
                      <Text type="label" color="secondary">p{b.page}</Text>
                    </VStack>
                  </Card>
                ))}
              </div>

              <FormLayout>
                <Selector label="Kingdom" value={kingdomId} onChange={setKingdomId}
                          options={kingdoms.map((k) => ({ value: k.id, label: k.name || "Untitled" }))} />
                <NameField label="Army Name" value={name} onChange={setName} />
                <NameField label="Army Commander" value={commander} onChange={setCommander}
                           pool={rulerPool(kingdom?.culture)} isOptional />
                <HStack gap={2} align="end" wrap="wrap">
                  <NumberInput label="Total Points" value={points} min={0} step={50} isOptional
                               onChange={(p) => setPoints(p || 0)} />
                  <Button label="Roll Total Points" variant="secondary" isIconOnly onClick={rollSize}
                          icon={<Icon icon={DICE} width={18} height={18} />} />
                  {scale && <Text type="label">{scale}</Text>}
                </HStack>
                <VStack gap={GAP.tight} align="start">
                  <Switch label="Uneven Battles, super optional" isSelected={uneven}
                          onChange={(on) => { setUneven(on); if (!on) setModifier(null); }} />
                  {uneven && (
                    <HStack gap={2} align="center" wrap="wrap">
                      <Button label="Roll Points Modifier" size="sm" variant="secondary"
                              onClick={() => setModifier(rollPointsModifier())}
                              icon={<Icon icon={DICE} width={18} height={18} />} />
                      {modifier != null && (
                        <Text>{modifier > 0 ? `+${modifier}` : modifier}% to the attacker: {attackerPoints}pts</Text>
                      )}
                    </HStack>
                  )}
                </VStack>
              </FormLayout>
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} justify="end">
              <Button label="Cancel" variant="secondary" onClick={() => onOpenChange(false)} />
              <Button label="Muster an Army" variant="primary" isDisabled={!kingdomId}
                      onClick={() => onMuster({
                        name: name.trim(),
                        commander: commander.trim(),
                        kingdomId,
                        points,
                        battleType: chosen?.id ?? null,
                        uneven: uneven ? { modifier, attackerPoints } : null,
                      })} />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
