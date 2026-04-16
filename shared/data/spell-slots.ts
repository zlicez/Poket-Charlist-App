import {
  getPactMagicForLevel,
  getSpellSlotsForProgression,
  getMulticlassCasterLevel,
  resolveSpellcastingProgression as resolveSpellcastingProgressionFromSelections,
  type PactMagicProgression,
} from "./class-progressions";
import { getClassDefinitionByName } from "./d5e-classes";

export type SpellcastingProgression = {
  spellSlots: number[] | null;
  pactMagic: PactMagicProgression | null;
};

export type CasterType = "full" | "half" | "third" | "artificer" | "warlock";

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

function getDefinition(className: string) {
  return getClassDefinitionByName(className);
}

export function getSpellSlotsForClass(
  className: string,
  level: number,
): number[] | null {
  const definition = getDefinition(className);
  const progression = definition?.spellcasting?.progression ?? "none";
  return getSpellSlotsForProgression(progression, level);
}

export function getPactMagicForClass(
  className: string,
  level: number,
): PactMagicProgression | null {
  const definition = getDefinition(className);
  if (definition?.spellcasting?.progression !== "pact") {
    return null;
  }
  return getPactMagicForLevel(level);
}

export function getMulticlassSpellSlots(
  classes: { name: string; level: number }[],
): number[] | null {
  const casterLevel = getMulticlassCasterLevel(
    classes.map((characterClass) => ({
      level: characterClass.level,
      definition: getDefinition(characterClass.name),
    })),
  );

  return casterLevel > 0
    ? getSpellSlotsForProgression("full", casterLevel)
    : null;
}

export function getSpellcastingProgression(
  classes: { name: string; level: number }[],
): SpellcastingProgression {
  const resolved = resolveSpellcastingProgressionFromSelections(
    classes.map((characterClass) => ({
      level: characterClass.level,
      definition: getDefinition(characterClass.name),
    })),
  );
  return {
    spellSlots: resolved.spellSlots,
    pactMagic: resolved.pactMagic,
  };
}
