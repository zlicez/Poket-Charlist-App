import {
  ABILITY_NAMES,
  ABILITY_LABELS,
  createEmptyAbilityBonuses,
  type AbilityName,
} from "@shared/schema";

export type FlexibleBonusMode = "split" | "spread";

export function formatAbilityBonuses(
  bonuses: Partial<Record<AbilityName, number>>,
): string {
  return ABILITY_NAMES.filter((ability) => (bonuses[ability] || 0) !== 0)
    .map((ability) => `${ABILITY_LABELS[ability].ru} +${bonuses[ability]}`)
    .join(", ");
}

export function hasAssignedAbilityBonuses(
  bonuses?: Partial<Record<AbilityName, number>>,
): boolean {
  return ABILITY_NAMES.some((ability) => (bonuses?.[ability] || 0) > 0);
}

export function detectFlexibleBonusMode(
  bonuses?: Partial<Record<AbilityName, number>>,
): FlexibleBonusMode | null {
  const appliedBonuses = ABILITY_NAMES.map((ability) => bonuses?.[ability] || 0)
    .filter((bonus) => bonus > 0)
    .sort((a, b) => b - a);

  if (appliedBonuses.includes(2)) {
    return "split";
  }

  if (
    appliedBonuses.length === 3 &&
    appliedBonuses.every((bonus) => bonus === 1)
  ) {
    return "spread";
  }

  return null;
}

export function buildSplitAbilityBonuses(
  primary?: AbilityName,
  secondary?: AbilityName,
) {
  const bonuses = createEmptyAbilityBonuses();

  if (primary) {
    bonuses[primary] = 2;
  }

  if (secondary && secondary !== primary) {
    bonuses[secondary] = 1;
  }

  return bonuses;
}

export function buildSpreadAbilityBonuses(selectedAbilities: AbilityName[]) {
  const bonuses = createEmptyAbilityBonuses();

  for (const ability of selectedAbilities.slice(0, 3)) {
    bonuses[ability] = 1;
  }

  return bonuses;
}
