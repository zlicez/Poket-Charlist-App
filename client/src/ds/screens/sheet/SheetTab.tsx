/**
 * PLACEHOLDER — Phase D routing wire-up. Реальный экран — Phase E2.
 */
import { AbilityTile, formatModifier } from "@/ds/hero";
import { typeClass } from "@/ds/tokens";
import { useCharacterState } from "@/hooks/character/useCharacterState";
import {
  ABILITY_NAMES,
  ABILITY_LABELS,
  calculateModifier,
  getRacialBonuses,
} from "@shared/schema";

export function SheetTab({ characterId }: { characterId: string }) {
  const { character } = useCharacterState(characterId);

  if (!character) {
    return <div className="p-5 text-ink-500">Загрузка…</div>;
  }

  const racialBonuses = getRacialBonuses(
    character.race,
    character.subrace,
    character.selectedRacialAbilityBonuses,
  );

  return (
    <div className="p-3 space-y-3">
      <div className={`${typeClass("label")} text-ink-500`}>PHASE D · PLACEHOLDER</div>
      <div className="grid grid-cols-3 gap-1.5">
        {ABILITY_NAMES.map((a) => {
          const score =
            character.abilityScores[a] +
            (racialBonuses[a] ?? 0) +
            (character.customAbilityBonuses?.[a] ?? 0);
          const mod = calculateModifier(score);
          return (
            <AbilityTile
              key={a}
              label={a}
              modifier={mod}
              score={score}
              hasSaveProficiency={Boolean(character.savingThrows[a])}
              onPress={() =>
                alert(`${ABILITY_LABELS[a].ru}: d20${formatModifier(mod)}`)
              }
            />
          );
        })}
      </div>
      <div className="rounded-ds-md border border-dashed border-ink-300 p-4 text-center text-ink-600 text-[13px]">
        Далее (Phase E2): навыки (dot-list), skill expand sheet, features.
      </div>
    </div>
  );
}
