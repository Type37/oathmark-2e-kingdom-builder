import React from "react";
import { FormLayout } from "@astryxdesign/core/FormLayout";
import {
  Dialog, DialogHeader, Layout, LayoutContent, LayoutFooter, Grid,
  Selector, NumberInput, HStack, VStack, Button, Text, Switch, Token, SelectableCard, Banner, Heading, StackItem, useMediaQuery,
} from "@astryxdesign/core";
import { rollPoints, battleScale } from "../rules/muster.mjs";
import {
  BATTLE_TYPES, battleTypeById, rollBattleType, rollLabel,
  beginnerAdvice, rollPointsModifier, applyModifier,
} from "../rules/battle.mjs";
import NameField from "./NameField.jsx";
import RollButton from "./RollButton.jsx";
import { rulerPool } from "../names.mjs";
import { GAP, BREAK } from "../layout.mjs";

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

  const narrow = useMediaQuery(BREAK.narrow);
  const armyName = name.trim() || (commander.trim() ? `Army of ${commander.trim()}` : "");
  const pct = (n) => `${n > 0 ? "+" : ""}${n}%`;

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width="min(1100px, 94vw)" maxHeight="92dvh"
            variant={narrow ? "fullscreen" : "standard"}>
      <Layout
        header={<DialogHeader title="Muster an Army" onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            {/* Three groups in the book's order: whose army, the battle, its
                size. Tight inside a group, generous between them. */}
            <VStack gap={8}>
              <FormLayout direction={narrow ? "vertical" : "horizontal"}>
                <Selector label="Kingdom" value={kingdomId} onChange={setKingdomId}
                          options={kingdoms.map((k) => ({ value: k.id, label: k.name || "Untitled" }))} />
                <NameField label="Army Commander" value={commander} onChange={setCommander}
                           pool={rulerPool(kingdom?.culture)} />
                <NameField label="Army Name" value={name} onChange={setName} />
              </FormLayout>

              <VStack gap={3}>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill"><Heading level={3}>Battle Type</Heading></StackItem>
                  <RollButton label="Roll for Battle Type" size="sm"
                              onClick={() => setBattle(rollBattleType(d10()).id)} />
                </HStack>
                {advice && <Banner status="info" title={advice} />}
                <Grid columns={{ minWidth: 300, repeat: "fill" }} gap={3}>
                  {BATTLE_TYPES.map((b) => (
                    <SelectableCard key={b.id} label={b.name} padding={3}
                                    isSelected={b.id === battle} onChange={() => setBattle(b.id)}>
                      <VStack gap={1}>
                        <HStack gap={2} vAlign="center" wrap="wrap">
                          <Text weight="semibold">{b.name}</Text>
                          <Token label={rollLabel(b)} size="sm" />
                        </HStack>
                        <Text type="supporting">{b.text}</Text>
                      </VStack>
                    </SelectableCard>
                  ))}
                </Grid>
              </VStack>

              <VStack gap={3}>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill"><Heading level={3}>Points Value</Heading></StackItem>
                  <RollButton label="Roll for Points Value" size="sm" onClick={rollSize} />
                </HStack>
                <HStack gap={3} vAlign="center" wrap="wrap">
                  <NumberInput label="Points Value" isLabelHidden width={150} units="pts"
                               value={points} min={0} step={50}
                               onChange={(p) => { setPoints(p || 0); setPointsRoll(null); setSides(null); }} />
                  {(scale || pointsRoll) && (
                    <Text color="secondary">
                      {[scale, pointsRoll && `rolled ${pointsRoll.die}`].filter(Boolean).join(", ")}
                    </Text>
                  )}
                </HStack>
                <HStack gap={3} vAlign="center" wrap="wrap">
                  <Switch label="Uneven Battles" value={uneven}
                          onChange={(on) => { setUneven(on); setSides(on ? rollSides(points) : null); }} />
                  {uneven && sides && (
                    <>
                      <Text color="secondary">
                        Attacker rolled {sides.attacker.die}: {pct(sides.attacker.modifier)}, {sides.attacker.points}pts.
                        {" "}Defender rolled {sides.defender.die}: {pct(sides.defender.modifier)}, {sides.defender.points}pts.
                      </Text>
                      <Button label="Reroll sides" size="sm" variant="ghost" onClick={() => setSides(rollSides(points))} />
                    </>
                  )}
                </HStack>
              </VStack>
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
