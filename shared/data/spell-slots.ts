/**
 * D&D 5e Spell Slot Tables
 * Index: [characterLevel - 1] → [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th]
 */

// Full Casters: Бард, Волшебник, Друид, Жрец, Чародей
const FULL_CASTER: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // 1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // 2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // 3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // 4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // 5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // 6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // 7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // 8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // 9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // 10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // 20
];

// Half Casters: Паладин, Следопыт (spell slots start at class level 2)
const HALF_CASTER: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // 2
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // 3
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // 4
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // 5
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // 6
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // 7
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // 8
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // 9
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // 10
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // 11
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // 12
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // 13
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // 14
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // 15
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // 16
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // 17
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // 18
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // 19
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // 20
];

// Изобретатель (Artificer) — half-caster, but spell slots start at class level 1
const ARTIFICER: number[][] = [
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // 1
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // 2
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // 3
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // 4
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // 5
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // 6
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // 7
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // 8
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // 9
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // 10
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // 11
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // 12
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // 13
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // 14
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // 15
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // 16
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // 17
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // 18
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // 19
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // 20
];

// Колдун (Warlock) — Pact Magic, stored in 9-slot format.
// All pact slots are the same level; represented as N slots at the appropriate level index.
const WARLOCK: number[][] = [
  [1, 0, 0, 0, 0, 0, 0, 0, 0], // 1: 1×1st
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // 2: 2×1st
  [0, 2, 0, 0, 0, 0, 0, 0, 0], // 3: 2×2nd
  [0, 2, 0, 0, 0, 0, 0, 0, 0], // 4: 2×2nd
  [0, 0, 2, 0, 0, 0, 0, 0, 0], // 5: 2×3rd
  [0, 0, 2, 0, 0, 0, 0, 0, 0], // 6: 2×3rd
  [0, 0, 0, 2, 0, 0, 0, 0, 0], // 7: 2×4th
  [0, 0, 0, 2, 0, 0, 0, 0, 0], // 8: 2×4th
  [0, 0, 0, 0, 2, 0, 0, 0, 0], // 9: 2×5th
  [0, 0, 0, 0, 2, 0, 0, 0, 0], // 10: 2×5th
  [0, 0, 0, 0, 3, 0, 0, 0, 0], // 11: 3×5th
  [0, 0, 0, 0, 3, 0, 0, 0, 0], // 12
  [0, 0, 0, 0, 3, 0, 0, 0, 0], // 13
  [0, 0, 0, 0, 3, 0, 0, 0, 0], // 14
  [0, 0, 0, 0, 3, 0, 0, 0, 0], // 15
  [0, 0, 0, 0, 3, 0, 0, 0, 0], // 16
  [0, 0, 0, 0, 4, 0, 0, 0, 0], // 17: 4×5th
  [0, 0, 0, 0, 4, 0, 0, 0, 0], // 18
  [0, 0, 0, 0, 4, 0, 0, 0, 0], // 19
  [0, 0, 0, 0, 4, 0, 0, 0, 0], // 20
];

type CasterType = "full" | "half" | "artificer" | "warlock";

export const CLASS_CASTER_TYPE: Record<string, CasterType> = {
  Бард: "full",
  Волшебник: "full",
  Друид: "full",
  Жрец: "full",
  Чародей: "full",
  Паладин: "half",
  Следопыт: "half",
  Изобретатель: "artificer",
  Колдун: "warlock",
};

const TABLE_BY_TYPE: Record<CasterType, number[][]> = {
  full: FULL_CASTER,
  half: HALF_CASTER,
  artificer: ARTIFICER,
  warlock: WARLOCK,
};

/**
 * Returns the max spell slots (array of 9) for a single-class caster at the given level,
 * or null if the class has no spellcasting.
 */
export function getSpellSlotsForClass(
  className: string,
  level: number
): number[] | null {
  const casterType = CLASS_CASTER_TYPE[className];
  if (!casterType) return null;
  const safeLevel = Math.max(1, Math.min(20, level));
  return TABLE_BY_TYPE[casterType][safeLevel - 1];
}

/**
 * Computes multiclass spell slots per D&D 5e rules.
 * - Full casters count their full class level
 * - Half casters count floor(level / 2)
 * - Artificer counts ceil(level / 2)
 * - Warlocks (Pact Magic) do not contribute to multiclass spell slots
 *
 * The resulting effective caster level indexes into the full-caster table.
 * Returns null if there are no caster classes.
 */
export function getMulticlassSpellSlots(
  classes: { name: string; level: number }[]
): number[] | null {
  let effectiveCasterLevel = 0;

  for (const c of classes) {
    const type = CLASS_CASTER_TYPE[c.name];
    if (!type || type === "warlock") continue;
    if (type === "full") effectiveCasterLevel += c.level;
    else if (type === "half") effectiveCasterLevel += Math.floor(c.level / 2);
    else if (type === "artificer") effectiveCasterLevel += Math.ceil(c.level / 2);
  }

  if (effectiveCasterLevel === 0) return null;
  const safeLevel = Math.max(1, Math.min(20, effectiveCasterLevel));
  return FULL_CASTER[safeLevel - 1];
}
