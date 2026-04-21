/**
 * Чистые helper'ы для level-up wizard. Вынесены отдельно — покрываются
 * unit-тестами, не зависят от React.
 */
import {
  buildClassStatePatch,
  calculateModifier,
  getClassDefinitionById,
  getClassDefinitionByName,
  getRacialBonuses,
  type Character,
  type ClassDefinition,
  type ClassFeatureDefinition,
  type ClassSelection,
} from "@shared/schema";

export type HpChoice = "average" | "roll" | "manual";

/** Среднее по 5e: ceil(die/2) + 1. d6 → 4, d8 → 5, d10 → 6, d12 → 7. */
export function averageHpGain(hitDieValue: number): number {
  return Math.floor(hitDieValue / 2) + 1;
}

/** Итоговый прирост HP = hit die result + CON mod (мин 1, всегда). */
export function computeHpGain(
  hitDieResult: number,
  conMod: number,
): number {
  return Math.max(1, hitDieResult + conMod);
}

/** Бросить d{dieValue}. Pure-module — чтобы линтер не флагал render. */
export function rollHitDie(dieValue: number): number {
  return Math.floor(Math.random() * dieValue) + 1;
}

/**
 * Primary class selection — ту, у которой index=0. Мульти-класс level-up
 * через wizard не поддерживается (handoff §13.2 — решается в edit-mode
 * через MulticlassEditor). Wizard bump'ит ТОЛЬКО primary.
 */
export function getPrimarySelection(
  character: Character,
): ClassSelection | null {
  if (!character.classSelections || character.classSelections.length === 0) {
    return null;
  }
  return character.classSelections[0];
}

/** Hit die в числах из class definition. Для rouge d8, fighter d10, и т.д. */
export function getPrimaryHitDieValue(character: Character): number {
  const selection = getPrimarySelection(character);
  if (!selection) return 8;
  const def =
    getClassDefinitionById(selection.classId) ??
    getClassDefinitionByName(selection.className);
  return def?.hitDie.value ?? 8;
}

/**
 * Вычисляем CON mod (итоговый с учётом race + custom) для прибавки к HP.
 */
export function computeConMod(character: Character): number {
  const racialBonuses = getRacialBonuses(
    character.race,
    character.subrace,
    character.selectedRacialAbilityBonuses,
  );
  const totalCon =
    character.abilityScores.CON +
    (racialBonuses.CON || 0) +
    (character.customAbilityBonuses?.CON || 0);
  return calculateModifier(totalCon);
}

/**
 * Фичи, которые персонаж получит при повышении primary класса до newLevel.
 * Использует ClassDefinition.levelGrants[].featureIds + featureDefinitions map.
 * Сабкласс — если выбран и unlock≤newLevel.
 */
export function getLevelUpFeatures(
  classDef: ClassDefinition | null,
  newLevel: number,
  selection: ClassSelection | null,
): ClassFeatureDefinition[] {
  if (!classDef) return [];
  const grants = classDef.levelGrants ?? [];
  const grantAtLevel = grants.find((g) => g.level === newLevel);
  const featureIds = grantAtLevel?.featureIds ?? [];

  const features: ClassFeatureDefinition[] = [];
  for (const id of featureIds) {
    const def = classDef.featureDefinitions?.[id];
    if (def) features.push(def);
  }

  // Subclass features at newLevel (если подкласс выбран).
  if (selection?.subclassId) {
    const sub = classDef.subclasses?.[selection.subclassId];
    if (sub && sub.unlockLevel <= newLevel) {
      const subGrant = sub.levelGrants?.find((g) => g.level === newLevel);
      for (const id of subGrant?.featureIds ?? []) {
        const def = sub.featureDefinitions?.[id];
        if (def) features.push(def);
      }
    }
  }

  return features;
}

/**
 * Собрать финальный patch для level-up. Вызывается на step 3 Apply.
 *
 * Что меняется:
 *   - classSelections[0].level += 1
 *   - всё остальное через buildClassStatePatch (class, subclass, level,
 *     savingThrows, profBonus, hitDice, spellSlots, hitDicePools)
 *   - maxHp += hpGain
 *   - currentHp += hpGain (сохраняем % текущего HP, игрок будет happy)
 *   - hitDiceRemaining возрастает на 1 (через buildClassStatePatch.hitDicePools)
 */
export function buildLevelUpPatch(
  character: Character,
  hpGain: number,
): Partial<Character> {
  const selections = character.classSelections ?? [];
  if (selections.length === 0) return {};
  const nextSelections: ClassSelection[] = selections.map((s, i) =>
    i === 0 ? { ...s, level: s.level + 1 } : s,
  );
  const patch = buildClassStatePatch(character, nextSelections);
  return {
    ...patch,
    maxHp: character.maxHp + hpGain,
    currentHp: character.currentHp + hpGain,
  };
}
