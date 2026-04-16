import type { AbilityName } from "../data/d5e-constants";
import {
  resolveSpellcastingProgression,
  type SpellcastingProgressionSummary,
} from "../data/class-progressions";
import type {
  ClassChoiceDefinition,
  ClassDefinition,
  ClassFeatureDefinition,
  ClassProficiencyBlock,
  ClassResourceDefinition,
  SubclassDefinition,
} from "../data/class-types";
import {
  CLASS_DEFINITIONS,
  CLASS_DEFINITIONS_BY_NAME,
  getFallbackClassDefinition,
} from "../data/d5e-classes";
import {
  buildClassSelectionsFromLegacy,
  projectLegacyClassState,
  type ClassSelectionLike,
  type LegacyClassStateLike,
} from "./class-compat";

export interface ResolvedClassChoiceDiagnostic {
  selectionId: string;
  classId: string;
  groupId: string;
  label: string;
  kind: ClassChoiceDefinition["kind"];
  requiredCount: number;
  currentCount: number;
  options: string[] | "any";
}

export interface ResolvedClassResource {
  selectionId: string;
  classId: string;
  resourceId: string;
  name: string;
  max: number;
  resetOn: ClassResourceDefinition["resetOn"];
}

export interface ResolvedClassHitDicePool {
  selectionId: string;
  classId: string;
  className: string;
  dice: string;
  value: number;
  total: number;
  remaining: number;
}

export interface ResolvedClassFeature {
  id: string;
  name: string;
  description: string;
  source: string;
  level: number;
  selectionId: string;
  classId: string;
  subclassId?: string;
  optional?: boolean;
}

export interface ResolvedClassSelection {
  selection: ClassSelectionLike;
  definition: ClassDefinition;
  subclassDefinition?: SubclassDefinition;
}

export interface ResolvedClassSpellcasting {
  hasSpellcasting: boolean;
  ability?: AbilityName;
  progression: SpellcastingProgressionSummary;
  mode?: string;
  casterClassNames: string[];
  pactCasterLevel: number;
}

export interface ResolvedClassState {
  selections: ResolvedClassSelection[];
  totalLevel: number;
  primarySelection: ResolvedClassSelection | null;
  savingThrowProficiencies: AbilityName[];
  grantedProficiencies: {
    languages: string[];
    weapons: string[];
    armor: string[];
    tools: string[];
    skills: string[];
  };
  activeFeatures: ResolvedClassFeature[];
  resources: ResolvedClassResource[];
  hitDicePools: ResolvedClassHitDicePool[];
  hitDiceRemaining: number;
  spellcasting: ResolvedClassSpellcasting;
  pendingChoices: ResolvedClassChoiceDiagnostic[];
  invalidChoices: string[];
  legacyProjection: ReturnType<typeof projectLegacyClassState>;
}

export interface CharacterClassStatePatch {
  classSelections: ClassSelectionLike[];
  classSelectionSchemaVersion: number;
  classes: Array<{ name: string; level: number; subclass?: string }>;
  class: string;
  subclass?: string;
  level: number;
  savingThrows: Record<AbilityName, boolean>;
  proficiencyBonus: number;
  hitDice: string;
  hitDiceRemaining: number;
  hitDicePools: Array<{
    selectionId: string;
    classId: string;
    className: string;
    dice: string;
    total: number;
    remaining: number;
  }>;
  spellcasting?: {
    ability: AbilityName;
    spellSlots: Array<{ max: number; used: number }>;
    pactMagic: { slotLevel: number; max: number; used: number };
    spells: Array<{
      id: string;
      name: string;
      level: number;
      castingTime: string;
      range: string;
      components: string;
      duration: string;
      concentration: boolean;
      ritual: boolean;
      description: string;
      prepared: boolean;
    }>;
  };
}

function getDefinitionByName(name: string): ClassDefinition | undefined {
  return CLASS_DEFINITIONS_BY_NAME[name];
}

function getDefinitionFromSelection(selection: ClassSelectionLike): ClassDefinition {
  return (
    CLASS_DEFINITIONS[selection.classId] ??
    CLASS_DEFINITIONS_BY_NAME[selection.className] ??
    getFallbackClassDefinition(selection.className)
  );
}

function getSubclassDefinition(
  selection: ClassSelectionLike,
  definition: ClassDefinition,
): SubclassDefinition | undefined {
  if (!selection.subclassName && !selection.subclassId) {
    return undefined;
  }

  if (!definition.subclasses) {
    return undefined;
  }

  return (
    (selection.subclassId ? definition.subclasses[selection.subclassId] : undefined) ??
    Object.values(definition.subclasses).find(
      (subclass) =>
        subclass.name === selection.subclassName || subclass.id === selection.subclassId,
    )
  );
}

function pushUnique(target: string[], values?: string[]) {
  if (!values) return;
  for (const value of values) {
    if (value && !target.includes(value)) {
      target.push(value);
    }
  }
}

function resolveChoiceValues(
  selection: ClassSelectionLike,
  choiceId: string,
): string[] {
  const rawValue = selection.choices?.[choiceId];
  if (Array.isArray(rawValue)) {
    return rawValue.filter((value): value is string => typeof value === "string");
  }
  if (typeof rawValue === "string" && rawValue.trim()) {
    return [rawValue];
  }
  return [];
}

function applyProficiencyBlock(
  result: ResolvedClassState["grantedProficiencies"],
  selection: ClassSelectionLike,
  block?: ClassProficiencyBlock,
  pendingChoices?: ResolvedClassChoiceDiagnostic[],
  invalidChoices?: string[],
  classId?: string,
) {
  if (!block) return;

  pushUnique(result.languages, block.languages);
  pushUnique(result.weapons, block.weapons);
  pushUnique(result.armor, block.armor);
  pushUnique(result.tools, block.tools);
  pushUnique(result.skills, block.skills);

  for (const choice of block.choices ?? []) {
    const values = resolveChoiceValues(selection, choice.id);
    const allowed =
      choice.options === "any"
        ? values
        : values.filter((value) => choice.options.includes(value));

    if (allowed.length !== values.length) {
      invalidChoices?.push(
        `${selection.className}: выбор "${choice.label}" содержит неподдерживаемые значения`,
      );
    }

    if (allowed.length < choice.count) {
      pendingChoices?.push({
        selectionId: selection.id,
        classId: classId ?? selection.classId,
        groupId: choice.id,
        label: choice.label,
        kind: choice.kind,
        requiredCount: choice.count,
        currentCount: allowed.length,
        options: choice.options,
      });
    }

    if (choice.kind === "skill") {
      pushUnique(result.skills, allowed);
    } else if (choice.kind === "tool") {
      pushUnique(result.tools, allowed);
    } else if (choice.kind === "language") {
      pushUnique(result.languages, allowed);
    }
  }
}

function buildFeatureList(
  selection: ClassSelectionLike,
  definition: ClassDefinition,
  subclassDefinition?: SubclassDefinition,
): ResolvedClassFeature[] {
  const features: ResolvedClassFeature[] = [];

  for (const grant of definition.levelGrants ?? []) {
    if (grant.level > selection.level) continue;
    for (const featureId of grant.featureIds ?? []) {
      const feature = definition.featureDefinitions?.[featureId];
      if (!feature) continue;
      features.push({
        id: `${selection.id}:${feature.id}`,
        name: feature.name,
        description: feature.description,
        source: definition.name,
        level: grant.level,
        selectionId: selection.id,
        classId: definition.id,
        optional: feature.optional,
      });
    }
  }

  if (selection.subclassName) {
    const activeSubclass = subclassDefinition;
    const unlockLevel = definition.subclassRule?.unlockLevel ?? activeSubclass?.unlockLevel ?? 1;
    if (selection.level >= unlockLevel) {
      features.push({
        id: `${selection.id}:subclass:${selection.subclassId ?? selection.subclassName}`,
        name: activeSubclass?.name ?? `Подкласс: ${selection.subclassName}`,
        description:
          activeSubclass?.description ??
          `Выбранный подкласс для класса ${definition.name}.`,
        source: definition.name,
        level: unlockLevel,
        selectionId: selection.id,
        classId: definition.id,
        subclassId: activeSubclass?.id ?? selection.subclassId,
      });
    }

    for (const grant of activeSubclass?.levelGrants ?? []) {
      if (grant.level > selection.level) continue;
      for (const featureId of grant.featureIds ?? []) {
        if (!activeSubclass) continue;
        const feature = activeSubclass.featureDefinitions?.[featureId];
        if (!feature) continue;
        features.push({
          id: `${selection.id}:${feature.id}`,
          name: feature.name,
          description: feature.description,
          source: activeSubclass.name,
          level: grant.level,
          selectionId: selection.id,
          classId: definition.id,
          subclassId: activeSubclass.id,
          optional: feature.optional,
        });
      }
    }
  }

  return features;
}

function buildResources(
  selection: ClassSelectionLike,
  definition: ClassDefinition,
): ResolvedClassResource[] {
  const resources: ResolvedClassResource[] = [];

  for (const resource of Object.values(definition.resourceDefinitions ?? {})) {
    const levels = Object.keys(resource.maxByLevel)
      .map(Number)
      .filter((level) => level <= selection.level)
      .sort((a, b) => a - b);
    const resolvedLevel = levels[levels.length - 1];
    const max = resolvedLevel ? resource.maxByLevel[resolvedLevel] ?? 0 : 0;
    if (max <= 0) continue;
    resources.push({
      selectionId: selection.id,
      classId: definition.id,
      resourceId: resource.id,
      name: resource.name,
      max,
      resetOn: resource.resetOn,
    });
  }

  return resources;
}

function allocateHitDicePools(
  selections: ResolvedClassSelection[],
  totalRemaining: number,
): ResolvedClassHitDicePool[] {
  let remaining = Math.max(0, totalRemaining);

  return selections.map(({ selection, definition }) => {
    const poolRemaining = Math.min(selection.level, remaining);
    remaining -= poolRemaining;
    return {
      selectionId: selection.id,
      classId: definition.id,
      className: definition.name,
      dice: definition.hitDie.dice,
      value: definition.hitDie.value,
      total: selection.level,
      remaining: poolRemaining,
    };
  });
}

function getPrimarySpellcastingAbility(
  selections: ResolvedClassSelection[],
): AbilityName | undefined {
  const firstCaster = selections.find((entry) => entry.definition.spellcasting);
  return firstCaster?.definition.spellcasting?.ability;
}

export function resolveClassState(
  character: LegacyClassStateLike & {
    hitDiceRemaining?: number;
  },
): ResolvedClassState {
  const selections = buildClassSelectionsFromLegacy(character, getDefinitionByName).map(
    (selection) => {
      const definition = getDefinitionFromSelection(selection);
      const subclassDefinition = getSubclassDefinition(selection, definition);
      return {
        selection,
        definition,
        subclassDefinition,
      };
    },
  );

  const legacyProjection = projectLegacyClassState(selections.map(({ selection }) => selection));
  const totalLevel = legacyProjection.level;
  const primarySelection = selections[0] ?? null;
  const grantedProficiencies = {
    languages: [] as string[],
    weapons: [] as string[],
    armor: [] as string[],
    tools: [] as string[],
    skills: [] as string[],
  };
  const pendingChoices: ResolvedClassChoiceDiagnostic[] = [];
  const invalidChoices: string[] = [];
  const activeFeatures: ResolvedClassFeature[] = [];
  const resources: ResolvedClassResource[] = [];

  selections.forEach(({ selection, definition, subclassDefinition }, index) => {
    const proficiencyBlock =
      index === 0
        ? definition.startingProficiencies
        : definition.multiclassProficiencies;

    applyProficiencyBlock(
      grantedProficiencies,
      selection,
      proficiencyBlock,
      pendingChoices,
      invalidChoices,
      definition.id,
    );

    if (
      selection.subclassName &&
      definition.subclassRule &&
      selection.level < definition.subclassRule.unlockLevel
    ) {
      invalidChoices.push(
        `${selection.className}: подкласс "${selection.subclassName}" недоступен до ${definition.subclassRule.unlockLevel} уровня`,
      );
    }

    activeFeatures.push(...buildFeatureList(selection, definition, subclassDefinition));
    resources.push(...buildResources(selection, definition));
  });

  const spellcastingSelections = selections.filter(({ definition }) => Boolean(definition.spellcasting));
  const spellcasting = resolveSpellcastingProgression(
    spellcastingSelections.map(({ selection, definition }) => ({
      level: selection.level,
      definition,
    })),
  );

  const pactCasterLevel = spellcastingSelections.reduce((total, entry) => {
    return entry.definition.spellcasting?.progression === "pact"
      ? total + entry.selection.level
      : total;
  }, 0);

  const hitDiceRemaining = Math.max(0, Math.min(totalLevel, character.hitDiceRemaining ?? totalLevel));

  return {
    selections,
    totalLevel,
    primarySelection,
    savingThrowProficiencies: primarySelection?.definition.savingThrows ?? [],
    grantedProficiencies,
    activeFeatures,
    resources,
    hitDicePools: allocateHitDicePools(selections, hitDiceRemaining),
    hitDiceRemaining,
    spellcasting: {
      hasSpellcasting:
        Boolean(spellcasting.spellSlots) || Boolean(spellcasting.pactMagic) || spellcastingSelections.length > 0,
      ability: getPrimarySpellcastingAbility(spellcastingSelections),
      progression: spellcasting,
      mode: spellcastingSelections[0]?.definition.spellcasting?.mode,
      casterClassNames: spellcastingSelections.map(({ definition }) => definition.name),
      pactCasterLevel,
    },
    pendingChoices,
    invalidChoices,
    legacyProjection,
  };
}

function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

function toSavingThrowMap(
  proficiencies: AbilityName[],
): Record<AbilityName, boolean> {
  return {
    STR: proficiencies.includes("STR"),
    DEX: proficiencies.includes("DEX"),
    CON: proficiencies.includes("CON"),
    INT: proficiencies.includes("INT"),
    WIS: proficiencies.includes("WIS"),
    CHA: proficiencies.includes("CHA"),
  };
}

function syncSpellSlots(
  existing:
    | Array<{ max: number; used: number }>
    | undefined,
  calculated: number[] | null,
): Array<{ max: number; used: number }> {
  return Array.from({ length: 9 }, (_, index) => {
    const max = calculated?.[index] ?? 0;
    const used = Math.min(existing?.[index]?.used ?? 0, max);
    return { max, used };
  });
}

export function buildClassStatePatch(
  character: LegacyClassStateLike & {
    hitDiceRemaining?: number;
    spellcasting?: {
      ability?: AbilityName;
      spellSlots?: Array<{ max: number; used: number }>;
      pactMagic?: { slotLevel: number; max: number; used: number };
      spells?: Array<{
        id: string;
        name: string;
        level: number;
        castingTime: string;
        range: string;
        components: string;
        duration: string;
        concentration: boolean;
        ritual: boolean;
        description: string;
        prepared: boolean;
      }>;
    };
  },
  nextSelections?: ClassSelectionLike[],
): CharacterClassStatePatch {
  const nextLegacyProjection = nextSelections
    ? projectLegacyClassState(nextSelections)
    : null;
  const baseCharacter = nextSelections
    ? {
        ...character,
        classSelections: nextSelections,
        classes: nextLegacyProjection?.classes,
        class: nextLegacyProjection?.class ?? character.class,
        subclass: nextLegacyProjection?.subclass,
        level: nextLegacyProjection?.level ?? character.level,
      }
    : character;
  const resolved = resolveClassState(baseCharacter);
  const primary = resolved.primarySelection;
  const primaryDie = primary?.definition.hitDie.dice ?? "d10";
  const existingSpellcasting = character.spellcasting;

  const patch: CharacterClassStatePatch = {
    classSelections: resolved.selections.map(({ selection }) => selection),
    classSelectionSchemaVersion: 1,
    classes: resolved.legacyProjection.classes,
    class: resolved.legacyProjection.class,
    subclass: resolved.legacyProjection.subclass,
    level: resolved.legacyProjection.level,
    savingThrows: toSavingThrowMap(resolved.savingThrowProficiencies),
    proficiencyBonus: getProficiencyBonus(resolved.totalLevel),
    hitDice: `1${primaryDie}`,
    hitDiceRemaining: resolved.hitDiceRemaining,
    hitDicePools: resolved.hitDicePools.map((pool) => ({
      selectionId: pool.selectionId,
      classId: pool.classId,
      className: pool.className,
      dice: pool.dice,
      total: pool.total,
      remaining: pool.remaining,
    })),
  };

  if (resolved.spellcasting.hasSpellcasting || existingSpellcasting) {
    const ability =
      resolved.spellcasting.ability ??
      existingSpellcasting?.ability ??
      "INT";
    const spellSlots = syncSpellSlots(
      existingSpellcasting?.spellSlots,
      resolved.spellcasting.progression.spellSlots,
    );
    const pactMagicProgression = resolved.spellcasting.progression.pactMagic;
    const existingPactMagic = existingSpellcasting?.pactMagic;

    patch.spellcasting = {
      ability,
      spellSlots,
      pactMagic: pactMagicProgression
        ? {
            slotLevel: pactMagicProgression.slotLevel,
            max: pactMagicProgression.max,
            used: Math.min(existingPactMagic?.used ?? 0, pactMagicProgression.max),
          }
        : {
            slotLevel: 1,
            max: 0,
            used: 0,
          },
      spells: existingSpellcasting?.spells ?? [],
    };
  }

  return patch;
}
