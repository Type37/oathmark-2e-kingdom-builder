import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, Grid,
  Selector, NumberInput, HStack, VStack, Button, Text, Switch, Token, SelectableCard, Banner,
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

const d10 = () => 1 + Math.floor(Math.random() * 10);

// The campaign turn's opening steps, in the book's order: Battle Type (p29),
// then Points Value (p33) and, if you want it, the uneven-battle roll (p34).
export default function MusterNew({ isOpen, onOpenChange, kingdoms, defaultKingdomId, onMuster }) {
  const [name, setName] = React.useState("");
  const [commander, setCommander] = React.useState("");
  const [kingdomId, setKingdomId] = React.useState(defaultKingdomId ?? kingdoms[0]?.id ?? "");
  const [battle, setBattle] = React.useState(null);
  const [points, setPoints] = React.useState(2000);
  const [pointsRoll, setPointsRoll] = React.useState(null);
  const [uneven, setUneven] = React.useState(false);
  const [sides, setSides] = React.useState(null);

  React.useEffect(() => {
    if (!isOpen) return;
    setName(""); setCommander(""); setPoints(2000); setPointsRoll(null);
    setBattle(null); setUneven(false); setSides(null);
    setKingdomId(defaultKingdomId ?? kingdoms[0]?.id ?? "");
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const kingdom = kingdoms.find((k) => k.id === kingdomId);
  const advice = beginnerAdvice(kingdom);
  const chosen = battle ? battleTypeById.get(battle) : null;
  const scale = battleScale(points);

  // Each side rolls its own modifier when the players want an uneven battle.
  function rollSides(total) {
    const side = () => {
      const die = d10();
      const modifier = rollPointsModifier(die);
      return { die, modifier, points: applyModifier(total, modifier) };
    };
    return { attacker: side(), defender: side() };
  }

  function rollSize() {
    const die = d10();
    const value = rollPoints(die, kingdom?.level);
    setPointsRoll({ die, value });
    setPoints(value);
    setSides(uneven ? rollSides(value) : null);
  }

  const armyName = name.trim() || (commander.trim() ? `Army of ${commander.trim()}` : "");
  const pct = (n) => `${n > 0 ? "+" : ""}${n}%`;

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width="min(1100px, 94vw)" maxHeight="92dvh">
      <Layout
        header={<DialogHeader title="Muster an Army" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            <VStack gap={GAP.group}>
              <HStack gap={GAP.item} align="center" justify="between" className="om-plate">
                <Text type="label">Battle Type</Text>
                <RollButton label="Roll for Battle Type" size="sm"
                            onClick={() => setBattle(rollBattleType(d10()).id)} />
              </HStack>
              {advice && <Banner status="info" title={advice} />}
              <Grid columns={{ minWidth: 320, repeat: "fill" }} gap={GAP.group}>
                {BATTLE_TYPES.map((b) => (
                  <SelectableCard key={b.id} label={b.name} padding={3}
                                  isSelected={b.id === battle} onChange={() => setBattle(b.id)}>
                    <VStack gap={GAP.tight}>
                      <HStack gap={GAP.tight} align="baseline" wrap="wrap">
                        <Text weight="semibold">{b.name}</Text>
                        <Token label={rollLabel(b)} size="sm" />
                      </HStack>
                      <Text type="supporting">{b.text}</Text>
                    </VStack>
                  </SelectableCard>
                ))}
              </Grid>

              <HStack gap={GAP.group} align="end" wrap="wrap">
                <Selector label="Kingdom" width={200} value={kingdomId} onChange={setKingdomId}
                          options={kingdoms.map((k) => ({ value: k.id, label: k.name || "Untitled" }))} />
                <NameField label="Army Commander" width={230} value={commander} onChange={setCommander}
                           pool={rulerPool(kingdom?.culture)} />
                <NameField label="Army Name" width={260} value={name} onChange={setName} />
              </HStack>

              <HStack gap={GAP.group} align="end" wrap="wrap">
                <NumberInput label="Total Points" size="lg" width={150} value={points} min={0} step={50}
                             onChange={(p) => { setPoints(p || 0); setPointsRoll(null); setSides(null); }} />
                <Button label="Roll for Random Points Value" variant="secondary" onClick={rollSize} />
                {pointsRoll && <Token label={`Rolled ${pointsRoll.die}`} color="pink" />}
                {scale && <Token label={scale} />}
                <Switch label="Uneven Battles" value={uneven}
                        onChange={(on) => { setUneven(on); setSides(on ? rollSides(points) : null); }} />
              </HStack>

              {uneven && sides && (
                <HStack gap={GAP.group} align="center" wrap="wrap">
                  <Token color="red" label={`Attacker rolled ${sides.attacker.die}: ${pct(sides.attacker.modifier)}, ${sides.attacker.points}pts`} />
                  <Token color="blue" label={`Defender rolled ${sides.defender.die}: ${pct(sides.defender.modifier)}, ${sides.defender.points}pts`} />
                  <Button label="Reroll sides" size="sm" variant="ghost" onClick={() => setSides(rollSides(points))} />
                </HStack>
              )}
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} justify="end">
              <Button label="Cancel" variant="secondary" onClick={() => onOpenChange(false)} />
              <Button label="Muster an Army" variant="primary" isDisabled={!kingdomId}
                      onClick={() => onMuster({
                        name: armyName,
                        commander: commander.trim(),
                        kingdomId,
                        points,
                        battleType: chosen?.id ?? null,
                        uneven: uneven ? sides : null,
                      })} />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
