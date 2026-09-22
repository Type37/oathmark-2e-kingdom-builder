import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter,
  Selector, NumberInput, HStack, VStack, Button, Text, Switch, Token, SelectableCard, Tooltip,
} from "@astryxdesign/core";
import { rollPoints, battleScale } from "../rules/muster.mjs";
import {
  BATTLE_TYPES, battleTypeById, rollBattleType, rollLabel,
  beginnerAdvice, rollPointsModifier, applyModifier,
} from "../rules/battle.mjs";
import NameField from "./NameField.jsx";
import RollButton from "./RollButton.jsx";
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
  const [rolled, setRolled] = React.useState(null);

  React.useEffect(() => {
    if (!isOpen) return;
    setName(""); setCommander(""); setPoints(1000);
    setBattle(null); setUneven(false); setModifier(null); setRolled(null);
    setKingdomId(defaultKingdomId ?? kingdoms[0]?.id ?? "");
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const kingdom = kingdoms.find((k) => k.id === kingdomId);
  const advice = beginnerAdvice(kingdom);
  const chosen = battle ? battleTypeById.get(battle) : null;
  const scale = battleScale(points);
  const attackerPoints = uneven && modifier != null ? applyModifier(points, modifier) : null;

  const rollBattle = () => {
    const d10 = 1 + Math.floor(Math.random() * 10);
    setRolled(d10);
    setBattle(rollBattleType(d10).id);
  };
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
                <HStack gap={GAP.item} align="center">
                  {rolled != null && <Token label={`Rolled ${rolled}`} color="pink" />}
                  <RollButton label="Roll 1d10" onClick={rollBattle} />
                </HStack>
              </HStack>
              {advice && <HStack className="om-callout"><Text type="supporting">{advice}</Text></HStack>}
              <div className="om-battle-grid">
                {BATTLE_TYPES.map((b) => (
                  <SelectableCard key={b.id} label={b.name} padding={3}
                                  isSelected={b.id === battle} onChange={() => setBattle(b.id)}>
                    <VStack gap={GAP.tight}>
                      <HStack gap={GAP.tight} align="baseline" wrap="wrap">
                        <Text weight="semibold">{b.name}</Text>
                        <Token label={rollLabel(b)} size="sm" />
                        {b.attacker && (
                          <Tooltip content="Both players roll a die; the higher roll takes the attacker's role (p29).">
                            <Token label="One side attacks" size="sm" color="red" />
                          </Tooltip>
                        )}
                        <Text type="supporting" color="secondary">p{b.page}</Text>
                      </HStack>
                      <Text type="supporting">{b.text}</Text>
                    </VStack>
                  </SelectableCard>
                ))}
              </div>

              <HStack gap={GAP.group} align="end" wrap="wrap">
                <Selector label="Kingdom" width={200} value={kingdomId} onChange={setKingdomId}
                          options={kingdoms.map((k) => ({ value: k.id, label: k.name || "Untitled" }))} />
                <NameField label="Army Name" width={240} value={name} onChange={setName} />
                <NameField label="Army Commander" width={230} value={commander} onChange={setCommander}
                           pool={rulerPool(kingdom?.culture)} />
              </HStack>
              <HStack gap={GAP.group} align="end" wrap="wrap">
                <NumberInput label="Total Points" size="lg" width={150} value={points} min={0} step={50}
                             onChange={(p) => setPoints(p || 0)} />
                <RollButton label="Roll 1d10" onClick={rollSize} />
                {scale && <Token label={scale} />}
                <Switch label="Uneven Battles, super optional" isSelected={uneven}
                        onChange={(on) => { setUneven(on); if (!on) setModifier(null); }} />
                {uneven && (
                  <>
                    <RollButton label="Roll Modifier" onClick={() => setModifier(rollPointsModifier())} />
                    {modifier != null && (
                      <Token color="red" label={`${modifier > 0 ? "+" : ""}${modifier}% attacker: ${attackerPoints}pts`} />
                    )}
                  </>
                )}
              </HStack>
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
