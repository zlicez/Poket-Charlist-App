/**
 * Чистые helper-функции для расчёта навыков и характеристик.
 * Вынесены отдельно — используются и в SkillsList, и в SkillDetailSheet,
 * и покрываются unit-тестами.
 */

import {
  calculateModifier,
  getRacialBonuses,
  type AbilityName,
  type Character,
  type SkillProficiency,
} from "@shared/schema";

export interface AbilityComputation {
  total: number;
  mod: number;
}

/**
 * Итоговое значение характеристики с учётом расовых и кастомных бонусов
 * + модификатор.
 */
export function computeAbility(
  character: Character,
  ability: AbilityName,
): AbilityComputation {
  const racialBonuses = getRacialBonuses(
    character.race,
    character.subrace,
    character.selectedRacialAbilityBonuses,
  );
  const total =
    character.abilityScores[ability] +
    (racialBonuses[ability] || 0) +
    (character.customAbilityBonuses?.[ability] || 0);
  return { total, mod: calculateModifier(total) };
}

/**
 * Бонус к броску навыка с учётом профицента/мастерства.
 *   expertise → +profBonus ×2
 *   proficient → +profBonus
 *   иначе — только мод характеристики
 */
export function computeSkillBonus(
  abilityMod: number,
  proficiency: SkillProficiency,
  profBonus: number,
): number {
  if (proficiency.expertise) return abilityMod + profBonus * 2;
  if (proficiency.proficient) return abilityMod + profBonus;
  return abilityMod;
}

/**
 * Бонус к спасброску — mod + (прошёл ли прохождение прокачки profBonus).
 */
export function computeSaveBonus(
  abilityMod: number,
  isProficient: boolean,
  profBonus: number,
): number {
  return abilityMod + (isProficient ? profBonus : 0);
}

/**
 * «Уровень» профиценции одним числом — для sort / icon pick.
 *   0 — без, 1 — proficient, 2 — expertise.
 */
export function proficiencyTier(p: SkillProficiency | undefined): 0 | 1 | 2 {
  if (!p) return 0;
  if (p.expertise) return 2;
  if (p.proficient) return 1;
  return 0;
}
