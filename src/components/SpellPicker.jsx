import React from "react";
import {
  Dialog, DialogHeader, Layout, LayoutContent, Text, CheckboxList, CheckboxListItem,
} from "@astryxdesign/core";
import { spellsFor, spellsKnown } from "../rules/magic.mjs";

// A spellcaster knows its level plus two (p83), chosen before the battle from
// its own race's list and the General list.
export default function SpellPicker({ isOpen, onOpenChange, race, level, magicItem, chosen = [], onChange }) {
  const knows = spellsKnown(level, magicItem);
  const full = chosen.length >= knows;

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange} width="min(820px, 94vw)" maxHeight="88dvh">
      <Layout
        header={<DialogHeader title={`Spells ${chosen.length} of ${knows}`} onOpenChange={onOpenChange} />}
        content={
          <LayoutContent>
            {/* A checkbox per spell, so every one chosen shows its tick; once the
                caster knows all it can, the rest wait. */}
            <CheckboxList label="Spells" isLabelHidden value={chosen}
                          onChange={(next) => { if (next.length <= knows) onChange(next); }}>
              {spellsFor(race).map((s) => (
                <CheckboxListItem
                  key={`${s.group}-${s.name}`}
                  value={s.name}
                  label={`${s.name}, CN${s.cn}`}
                  isDisabled={full && !chosen.includes(s.name)}
                  description={<Text color="secondary">{s.text}</Text>}
                  endContent={<Text type="label">{s.group}</Text>}
                />
              ))}
            </CheckboxList>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}
