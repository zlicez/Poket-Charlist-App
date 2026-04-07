/**
 * D&D 5e spell slot tables.
 * Index: [characterLevel - 1] -> [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th]
 */

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

export interface PactMagicProgression {
  slotLevel: number;
  max: number;
}

const WARLOCK_PACT_MAGIC: PactMagicProgression[] = [
  { slotLevel: 1, max: 1 }, // 1
  { slotLevel: 1, max: 2 }, // 2
  { slotLevel: 2, max: 2 }, // 3
  { slotLevel: 2, max: 2 }, // 4
  { slotLevel: 3, max: 2 }, // 5
  { slotLevel: 3, max: 2 }, // 6
  { slotLevel: 4, max: 2 }, // 7
  { slotLevel: 4, max: 2 }, // 8
  { slotLevel: 5, max: 2 }, // 9
  { slotLevel: 5, max: 2 }, // 10
  { slotLevel: 5, max: 3 }, // 11
  { slotLevel: 5, max: 3 }, // 12
  { slotLevel: 5, max: 3 }, // 13
  { slotLevel: 5, max: 3 }, // 14
  { slotLevel: 5, max: 3 }, // 15
  { slotLevel: 5, max: 3 }, // 16
  { slotLevel: 5, max: 4 }, // 17
  { slotLevel: 5, max: 4 }, // 18
  { slotLevel: 5, max: 4 }, // 19
  { slotLevel: 5, max: 4 }, // 20
];

export interface SpellcastingProgression {
  spellSlots: number[] | null;
  pactMagic: PactMagicProgression | null;
}

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

const TABLE_BY_TYPE: Record<Exclude<CasterType, "warlock">, number[][]> = {
  full: FULL_CASTER,
  half: HALF_CASTER,
  artificer: ARTIFICER,
};

function clampLevel(level: number): number {
  return Math.max(1, Math.min(20, level));
}

/**
 * Returns regular Spellcasting slots for a single-class caster.
 * Warlock uses Pact Magic and therefore returns null here.
 */
export function getSpellSlotsForClass(
  className: string,
  level: number,
): number[] | null {
  const casterType = CLASS_CASTER_TYPE[className];
  if (!casterType || casterType === "warlock") return null;

  return TABLE_BY_TYPE[casterType][clampLevel(level) - 1];
}

export function getPactMagicForClass(
  className: string,
  level: number,
): PactMagicProgression | null {
  if (CLASS_CASTER_TYPE[className] !== "warlock") return null;
  return WARLOCK_PACT_MAGIC[clampLevel(level) - 1];
}

/**
 * Computes regular Spellcasting slots per D&D 5e multiclass rules.
 * - Full casters count their full class level
 * - Half casters count floor(level / 2)
 * - Artificer counts ceil(level / 2)
 * - Warlock Pact Magic stays separate and does not contribute here
 */
export function getMulticlassSpellSlots(
  classes: { name: string; level: number }[],
): number[] | null {
  let effectiveCasterLevel = 0;

  for (const characterClass of classes) {
    const type = CLASS_CASTER_TYPE[characterClass.name];
    if (!type || type === "warlock") continue;

    if (type === "full") {
      effectiveCasterLevel += characterClass.level;
      continue;
    }

    if (type === "half") {
      effectiveCasterLevel += Math.floor(characterClass.level / 2);
      continue;
    }

    effectiveCasterLevel += Math.ceil(characterClass.level / 2);
  }

  if (effectiveCasterLevel === 0) return null;
  return FULL_CASTER[clampLevel(effectiveCasterLevel) - 1];
}

export function getSpellcastingProgression(
  classes: { name: string; level: number }[],
): SpellcastingProgression {
  const standardCasterClasses = classes.filter((characterClass) => {
    const casterType = CLASS_CASTER_TYPE[characterClass.name];
    return casterType && casterType !== "warlock";
  });

  const warlockLevel = classes.reduce((total, characterClass) => {
    return CLASS_CASTER_TYPE[characterClass.name] === "warlock"
      ? total + characterClass.level
      : total;
  }, 0);

  const spellSlots =
    standardCasterClasses.length === 0
      ? null
      : standardCasterClasses.length === 1
        ? getSpellSlotsForClass(
            standardCasterClasses[0].name,
            standardCasterClasses[0].level,
          )
        : getMulticlassSpellSlots(classes);

  return {
    spellSlots,
    pactMagic:
      warlockLevel > 0 ? getPactMagicForClass("Колдун", warlockLevel) : null,
  };
}
