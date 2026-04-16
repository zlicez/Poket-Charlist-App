import type {
  ClassDefinition,
  ClassSpellcastingProgressionKind,
} from "./class-types";

const FULL_CASTER: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 0, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 0, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 0],
  [4, 3, 3, 3, 2, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 1, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

const HALF_CASTER: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
];

const ARTIFICER: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
  [4, 3, 3, 3, 2, 0, 0, 0, 0],
];

const THIRD_CASTER: number[][] = FULL_CASTER.map((_, index) => {
  const effectiveLevel = Math.max(0, Math.floor((index + 1) / 3));
  return effectiveLevel > 0 ? FULL_CASTER[effectiveLevel - 1] : FULL_CASTER[0].map(() => 0);
});

export interface PactMagicProgression {
  slotLevel: number;
  max: number;
}

export interface SpellcastingProgressionSummary {
  spellSlots: number[] | null;
  pactMagic: PactMagicProgression | null;
  casterLevel: number;
}

const WARLOCK_PACT_MAGIC: PactMagicProgression[] = [
  { slotLevel: 1, max: 1 },
  { slotLevel: 1, max: 2 },
  { slotLevel: 2, max: 2 },
  { slotLevel: 2, max: 2 },
  { slotLevel: 3, max: 2 },
  { slotLevel: 3, max: 2 },
  { slotLevel: 4, max: 2 },
  { slotLevel: 4, max: 2 },
  { slotLevel: 5, max: 2 },
  { slotLevel: 5, max: 2 },
  { slotLevel: 5, max: 3 },
  { slotLevel: 5, max: 3 },
  { slotLevel: 5, max: 3 },
  { slotLevel: 5, max: 3 },
  { slotLevel: 5, max: 3 },
  { slotLevel: 5, max: 3 },
  { slotLevel: 5, max: 4 },
  { slotLevel: 5, max: 4 },
  { slotLevel: 5, max: 4 },
  { slotLevel: 5, max: 4 },
];

const TABLE_BY_KIND: Record<
  Exclude<ClassSpellcastingProgressionKind, "none" | "pact">,
  number[][]
> = {
  full: FULL_CASTER,
  half: HALF_CASTER,
  third: THIRD_CASTER,
  artificer: ARTIFICER,
};

function clampLevel(level: number): number {
  return Math.max(1, Math.min(20, level));
}

function getCasterContribution(
  kind: ClassSpellcastingProgressionKind,
  level: number,
): number {
  switch (kind) {
    case "full":
      return level;
    case "half":
      return Math.floor(level / 2);
    case "artificer":
      return Math.ceil(level / 2);
    case "third":
      return Math.floor(level / 3);
    default:
      return 0;
  }
}

export function getSpellSlotsForProgression(
  kind: ClassSpellcastingProgressionKind,
  level: number,
): number[] | null {
  if (kind === "none" || kind === "pact") {
    return null;
  }

  return TABLE_BY_KIND[kind][clampLevel(level) - 1];
}

export function getPactMagicForLevel(level: number): PactMagicProgression | null {
  return WARLOCK_PACT_MAGIC[clampLevel(level) - 1] ?? null;
}

export function getMulticlassCasterLevel(
  selections: Array<{ level: number; definition?: ClassDefinition | null }>,
): number {
  return selections.reduce((total, selection) => {
    const progression = selection.definition?.spellcasting?.progression ?? "none";
    return total + getCasterContribution(progression, selection.level);
  }, 0);
}

export function resolveSpellcastingProgression(
  selections: Array<{ level: number; definition?: ClassDefinition | null }>,
): SpellcastingProgressionSummary {
  const standardSelections = selections.filter((selection) => {
    const progression = selection.definition?.spellcasting?.progression ?? "none";
    return progression !== "none" && progression !== "pact";
  });

  const pactLevel = selections.reduce((total, selection) => {
    const progression = selection.definition?.spellcasting?.progression ?? "none";
    return progression === "pact" ? total + selection.level : total;
  }, 0);

  const casterLevel = getMulticlassCasterLevel(standardSelections);

  let spellSlots: number[] | null = null;
  if (standardSelections.length === 1) {
    const progression = standardSelections[0].definition?.spellcasting?.progression ?? "none";
    spellSlots = getSpellSlotsForProgression(progression, standardSelections[0].level);
  } else if (standardSelections.length > 1 && casterLevel > 0) {
    spellSlots = FULL_CASTER[clampLevel(casterLevel) - 1];
  }

  return {
    spellSlots,
    pactMagic: pactLevel > 0 ? getPactMagicForLevel(pactLevel) : null,
    casterLevel,
  };
}
