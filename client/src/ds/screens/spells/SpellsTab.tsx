/**
 * S-03 + S-04 — Spells tab. Handoff 03-screens.jsx SpellsScreen.
 * Показывается только для кастеров (проверка в CharacterScreen →
 * hasSpellcasting = resolveClassState(character).spellcasting.hasSpellcasting).
 *
 * Layout:
 *   [SC header: class · DC X · attack +N]
 *   [SlotsPanel — per-level slots + pact + reset all]
 *   [PreparedSpellsList — accordion by level + cast/toggle/remove]
 *   [Button: Открыть библиотеку → SpellLibrarySheet]
 */
import { BookOpen } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useCharacterState } from "@/hooks/character/useCharacterState";
import {
  ABILITY_LABELS,
  calculateModifier,
  calculateSpellAttackBonus,
  calculateSpellSaveDC,
  formatModifier,
  getCharacterClasses,
  getProficiencyBonus,
  getRacialBonuses,
  getTotalLevel,
} from "@shared/schema";

import { PreparedSpellsList } from "./PreparedSpellsList";
import { SlotsPanel } from "./SlotsPanel";
import { SpellLibrarySheet } from "./SpellLibrarySheet";

export function SpellsTab({ characterId }: { characterId: string }) {
  const { character } = useCharacterState(characterId);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const sc = character?.spellcasting;

  const stats = useMemo(() => {
    if (!character || !sc) return null;
    const racialBonuses = getRacialBonuses(
      character.race,
      character.subrace,
      character.selectedRacialAbilityBonuses,
    );
    const abilityScore =
      character.abilityScores[sc.ability] +
      (racialBonuses[sc.ability] || 0) +
      (character.customAbilityBonuses?.[sc.ability] || 0);
    const abilityMod = calculateModifier(abilityScore);
    const profBonus = getProficiencyBonus(getTotalLevel(getCharacterClasses(character)));
    return {
      abilityName: ABILITY_LABELS[sc.ability].ru,
      saveDC: calculateSpellSaveDC(abilityMod, profBonus),
      attackBonus: calculateSpellAttackBonus(abilityMod, profBonus),
    };
  }, [character, sc]);

  if (!character) {
    return <div className="p-6 text-center text-ink-500 font-ds-sans">Загрузка…</div>;
  }

  if (!sc) {
    return (
      <div className="p-6 font-ds-sans text-center">
        <div className={cn(typeClass("body"), "text-ink-500")}>
          Этот персонаж не владеет заклинаниями.
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 font-ds-sans">
      {/* Spellcasting stats row */}
      {stats && (
        <div className="rounded-ds-md border border-ink-200 bg-paper-card p-3 flex items-center gap-4">
          <StatMini label="Осн. хар." value={stats.abilityName} />
          <StatMini label="DC" value={stats.saveDC} color="ruby" />
          <StatMini label="Атака" value={formatModifier(stats.attackBonus)} color="violet" />
        </div>
      )}

      <SlotsPanel character={character} />

      <PreparedSpellsList character={character} />

      <Button
        variant="outline"
        className="w-full"
        onClick={() => setLibraryOpen(true)}
        data-testid="open-spell-library"
      >
        <BookOpen className="w-4 h-4" />
        Библиотека заклинаний
      </Button>

      <SpellLibrarySheet
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        character={character}
      />
    </div>
  );
}

function StatMini({
  label,
  value,
  color,
}: {
  label: string;
  value: React.ReactNode;
  color?: "ruby" | "violet" | "ink";
}) {
  const valueColor =
    color === "ruby" ? "text-ruby" : color === "violet" ? "text-violet" : "text-ink-900";
  return (
    <div className="flex-1 min-w-0">
      <div className={cn(typeClass("label"), "text-ink-500")}>{label}</div>
      <div
        className={cn(
          "font-ds-serif text-[18px] font-medium tabular-nums truncate",
          valueColor,
        )}
      >
        {value}
      </div>
    </div>
  );
}
