import { z } from "zod";
import {
  ABILITY_NAMES,
  type AbilityName,
  SKILLS,
  SIMPLE_WEAPONS,
  MARTIAL_WEAPONS,
} from "../data/d5e-constants";
import { RACE_DATA } from "../data/d5e-races";
import type { DamageType, RaceSpellGrant } from "../data/race-types";
import { CLASS_DATA, getClassDefinitionByName } from "../data/d5e-classes";
import type {
  ArmorData,
  ArmorType,
  BaseEquipmentItem,
} from "../data/d5e-equipment";
import {
  buildClassSelectionsFromLegacy,
  projectLegacyClassState,
} from "../lib/class-compat";
import { resolveClassState } from "../lib/class-engine";

export const skillProficiencySchema = z.object({
  proficient: z.boolean().default(false),
  expertise: z.boolean().default(false),
});

export type SkillProficiency = z.infer<typeof skillProficiencySchema>;

export const abilityScoresSchema = z.object({
  STR: z.number().min(1).max(30).default(10),
  DEX: z.number().min(1).max(30).default(10),
  CON: z.number().min(1).max(30).default(10),
  INT: z.number().min(1).max(30).default(10),
  WIS: z.number().min(1).max(30).default(10),
  CHA: z.number().min(1).max(30).default(10),
});

export type AbilityScores = z.infer<typeof abilityScoresSchema>;

export const abilityBonusesSchema = z.object({
  STR: z.number().default(0),
  DEX: z.number().default(0),
  CON: z.number().default(0),
  INT: z.number().default(0),
  WIS: z.number().default(0),
  CHA: z.number().default(0),
});

export type AbilityBonuses = z.infer<typeof abilityBonusesSchema>;

export function createEmptyAbilityBonuses(): AbilityBonuses {
  return {
    STR: 0,
    DEX: 0,
    CON: 0,
    INT: 0,
    WIS: 0,
    CHA: 0,
  };
}

export const savingThrowsSchema = z.object({
  STR: z.boolean().default(false),
  DEX: z.boolean().default(false),
  CON: z.boolean().default(false),
  INT: z.boolean().default(false),
  WIS: z.boolean().default(false),
  CHA: z.boolean().default(false),
});

export type SavingThrows = z.infer<typeof savingThrowsSchema>;

export const deathSavesSchema = z.object({
  successes: z.number().min(0).max(3).default(0),
  failures: z.number().min(0).max(3).default(0),
});

export type DeathSaves = z.infer<typeof deathSavesSchema>;

export const WEAPON_ABILITY_MODS = ["str", "dex"] as const;
export type WeaponAbilityMod = (typeof WEAPON_ABILITY_MODS)[number];
export const WEAPON_GRIP_MODES = ["oneHand", "twoHand"] as const;
export type WeaponGripMode = (typeof WEAPON_GRIP_MODES)[number];

export const weaponSchema = z.object({
  id: z.string(),
  name: z.string(),
  attackBonus: z.number(),
  damage: z.string(),
  versatileDamage: z.string().optional(),
  damageType: z.string(),
  properties: z.string().optional(),
  gripMode: z.enum(WEAPON_GRIP_MODES).optional(),
  abilityMod: z.enum(["str", "dex"]).default("str"),
  isFinesse: z.boolean().optional(),
  weaponCategory: z.enum(["simple", "martial", "exotic"]).optional(),
});

export type Weapon = z.infer<typeof weaponSchema>;

export const featureSchema = z.object({
  id: z.string(),
  name: z.string(),
  source: z.string(),
  description: z.string(),
});

export type Feature = z.infer<typeof featureSchema>;

export const equipmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().default(1),
  weight: z.number().optional(),
  description: z.string().optional(),
  category: z
    .enum(["weapon", "armor", "food", "potion", "tool", "misc"])
    .default("misc"),
  isArmor: z.boolean().optional(),
  armorType: z.enum(["none", "light", "medium", "heavy", "shield"]).optional(),
  armorBaseAC: z.number().optional(),
  armorMaxDexBonus: z.number().nullable().optional(),
  isWeapon: z.boolean().optional(),
  damage: z.string().optional(),
  versatileDamage: z.string().optional(),
  damageType: z.string().optional(),
  weaponProperties: z.string().optional(),
  gripMode: z.enum(WEAPON_GRIP_MODES).optional(),
  weaponCategory: z.enum(["simple", "martial", "exotic"]).optional(),
  attackBonus: z.number().optional(),
  abilityMod: z.enum(["str", "dex"]).optional(),
  isFinesse: z.boolean().optional(),
  equipped: z.boolean().optional(),
});

export type Equipment = z.infer<typeof equipmentSchema>;

export const moneySchema = z.object({
  cp: z.number().min(0).default(0),
  sp: z.number().min(0).default(0),
  ep: z.number().min(0).default(0),
  gp: z.number().min(0).default(0),
  pp: z.number().min(0).default(0),
});

export type Money = z.infer<typeof moneySchema>;

export const proficienciesSchema = z.object({
  languages: z.array(z.string()).default([]),
  weapons: z.array(z.string()).default([]),
  armor: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
});

export type Proficiencies = z.infer<typeof proficienciesSchema>;

export const spellSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number().min(0).max(9),
  castingTime: z.string().default("1 действие"),
  range: z.string().default(""),
  components: z.string().default(""),
  duration: z.string().default(""),
  concentration: z.boolean().default(false),
  ritual: z.boolean().default(false),
  description: z.string().default(""),
  prepared: z.boolean().default(true),
});

export type Spell = z.infer<typeof spellSchema>;

export const spellSlotSchema = z.object({
  max: z.number().min(0).default(0),
  used: z.number().min(0).default(0),
});

export type SpellSlot = z.infer<typeof spellSlotSchema>;

export const pactMagicSchema = z.object({
  slotLevel: z.number().min(1).max(5).default(1),
  max: z.number().min(0).default(0),
  used: z.number().min(0).default(0),
});

export type PactMagic = z.infer<typeof pactMagicSchema>;

export const spellcastingSchema = z.object({
  ability: z.enum(["STR", "DEX", "CON", "INT", "WIS", "CHA"]).default("INT"),
  spellSlots: z
    .array(spellSlotSchema)
    .length(9)
    .default([
      { max: 0, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
      { max: 0, used: 0 },
    ]),
  pactMagic: pactMagicSchema.default({ slotLevel: 1, max: 0, used: 0 }),
  spells: z.array(spellSchema).default([]),
});

export type Spellcasting = z.infer<typeof spellcastingSchema>;

export const classEntrySchema = z.object({
  name: z.string(),
  level: z.number().min(1).max(20),
  subclass: z.string().optional(),
});

export type ClassEntry = z.infer<typeof classEntrySchema>;

export const classSelectionSchema = z.object({
  id: z.string(),
  classId: z.string(),
  className: z.string(),
  source: z.string().default("PHB"),
  contentVersion: z.string().optional(),
  level: z.number().min(1).max(20),
  subclassId: z.string().optional(),
  subclassName: z.string().optional(),
  choices: z.record(z.string(), z.unknown()).default({}),
  optionalFeatureIds: z.array(z.string()).default([]),
  resourceState: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional(),
});

export type ClassSelection = z.infer<typeof classSelectionSchema>;

export const classHitDicePoolSchema = z.object({
  selectionId: z.string(),
  classId: z.string(),
  className: z.string(),
  dice: z.string(),
  total: z.number().min(0),
  remaining: z.number().min(0),
});

export type ClassHitDicePool = z.infer<typeof classHitDicePoolSchema>;

export const classResourceStateSchema = z.object({
  selectionId: z.string(),
  resourceId: z.string(),
  current: z.number().min(0).default(0),
  max: z.number().min(0).default(0),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ClassResourceState = z.infer<typeof classResourceStateSchema>;

export const characterSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  name: z.string().min(1),
  avatar: z.string().optional(),
  class: z.string(),
  subclass: z.string().optional(),
  race: z.string(),
  subrace: z.string().optional(),
  level: z.number().min(1).max(20).default(1),
  classes: z.array(classEntrySchema).optional(),
  classSelections: z.array(classSelectionSchema).optional(),
  classSelectionSchemaVersion: z.number().int().min(1).optional(),
  hitDicePools: z.array(classHitDicePoolSchema).optional(),
  classResourceStates: z.array(classResourceStateSchema).optional(),
  background: z.string().optional(),
  alignment: z.string().optional(),
  experience: z.number().min(0).default(0),
  abilityScores: abilityScoresSchema,
  selectedRacialAbilityBonuses: abilityBonusesSchema.optional(),
  customAbilityBonuses: abilityBonusesSchema.optional(),
  // Опциональные поля для обогащённой race-системы (additive, backward compat)
  raceSource: z.string().optional(),   // "PHB" | "VGM" | "MPMM" и т.д.
  raceRef: z.string().optional(),      // стабильный slug: "elf", "tiefling-mpmm"
  // Выборы пользователя внутри racial features: skill-choice, language-choice, dragon-ancestry и т.д.
  raceSelections: z.record(z.string(), z.unknown()).optional(),
  savingThrows: savingThrowsSchema,
  skills: z.record(z.string(), skillProficiencySchema),
  armorClass: z.number().min(0).default(10),
  customACBonus: z.number().default(0),
  customMaxHpBonus: z.number().default(0),
  initiative: z.number().default(0),
  customInitiativeBonus: z.number().default(0),
  speed: z.number().min(0).default(30),
  maxHp: z.number().min(0).default(10),
  currentHp: z.number().default(10),
  tempHp: z.number().min(0).default(0),
  hitDice: z.string().default("1d10"),
  hitDiceRemaining: z.number().min(0).default(1),
  deathSaves: deathSavesSchema,
  weapons: z.array(weaponSchema).default([]),
  features: z.array(featureSchema).default([]),
  equipment: z.array(equipmentSchema).default([]),
  money: moneySchema.default({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }),
  proficiencies: proficienciesSchema.default({
    languages: [],
    weapons: [],
    armor: [],
    tools: [],
  }),
  spellcasting: spellcastingSchema.optional(),
  proficiencyBonus: z.number().default(2),
  inspiration: z.boolean().default(false),
  notes: z.string().optional(),
  personalityTraits: z.string().optional(),
  ideals: z.string().optional(),
  bonds: z.string().optional(),
  flaws: z.string().optional(),
  appearance: z.string().optional(),
  age: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  eyes: z.string().optional(),
  skin: z.string().optional(),
  hair: z.string().optional(),
  allies: z.string().optional(),
  factions: z.string().optional(),
  equipmentLocked: z.boolean().default(false),
  weaponsLocked: z.boolean().default(false),
  featuresLocked: z.boolean().default(false),
  spellSlotsLocked: z.boolean().default(false),
});

export type Character = z.infer<typeof characterSchema>;

export const insertCharacterSchema = characterSchema.omit({ id: true });
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

// Allowlist for public character sharing — explicitly omit private fields.
// Adding a new private field? Omit it here too.
export const publicCharacterSchema = characterSchema.omit({
  userId: true,
});
export type PublicCharacter = z.infer<typeof publicCharacterSchema>;

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getRacialBonuses(
  race: string,
  subrace?: string,
  selectedRacialAbilityBonuses?: Partial<Record<AbilityName, number>>,
): Partial<Record<AbilityName, number>> {
  const raceData = RACE_DATA[race];
  if (!raceData) return {};

  const bonuses = { ...raceData.abilityBonuses };
  const selectedBonuses = raceData.abilityBonusSelection
    ? getValidatedSelectedRacialBonuses(race, selectedRacialAbilityBonuses)
    : {};

  if (subrace && raceData.subraces && raceData.subraces[subrace]) {
    const subraceData = raceData.subraces[subrace];
    for (const ability of ABILITY_NAMES) {
      if (subraceData.abilityBonuses[ability]) {
        bonuses[ability] =
          (bonuses[ability] || 0) + subraceData.abilityBonuses[ability]!;
      }
    }
  }

  for (const ability of ABILITY_NAMES) {
    if (selectedBonuses[ability]) {
      bonuses[ability] = (bonuses[ability] || 0) + selectedBonuses[ability]!;
    }
  }

  return bonuses;
}

export function getValidatedSelectedRacialBonuses(
  race: string,
  selectedRacialAbilityBonuses?: Partial<Record<AbilityName, number>>,
): Partial<Record<AbilityName, number>> {
  const raceData = RACE_DATA[race];
  if (!raceData?.abilityBonusSelection || !selectedRacialAbilityBonuses) {
    return {};
  }

  const normalized = createEmptyAbilityBonuses();
  for (const ability of ABILITY_NAMES) {
    const bonus = selectedRacialAbilityBonuses[ability];
    normalized[ability] =
      typeof bonus === "number" && bonus > 0 ? Math.trunc(bonus) : 0;
  }

  const appliedValues = Object.values(normalized)
    .filter((bonus) => bonus > 0)
    .sort((a, b) => b - a);

  const hasMatchingPattern = raceData.abilityBonusSelection.patterns.some(
    (pattern) => {
      const expected = [...pattern.bonuses].sort((a, b) => b - a);
      return (
        expected.length === appliedValues.length &&
        expected.every((value, index) => value === appliedValues[index])
      );
    },
  );

  return hasMatchingPattern ? normalized : {};
}

export function getTotalAbilityScore(
  baseScore: number,
  racialBonus: number,
  customBonus: number,
): number {
  return baseScore + racialBonus + customBonus;
}

export function getClassHitDice(className: string): {
  dice: string;
  value: number;
} {
  const classData = CLASS_DATA[className];
  if (!classData) return { dice: "d10", value: 10 };
  return { dice: classData.hitDice, value: classData.hitDiceValue };
}

export function calculateMaxHp(
  className: string,
  level: number,
  conModifier: number,
): number {
  const hitDice = getClassHitDice(className);
  const firstLevelHp = hitDice.value + conModifier;
  const avgRollPerLevel = Math.floor(hitDice.value / 2) + 1;
  const additionalLevelsHp = (level - 1) * (avgRollPerLevel + conModifier);
  return Math.max(1, firstLevelHp + additionalLevelsHp);
}

export function getClassSavingThrows(className: string): AbilityName[] {
  const classData = CLASS_DATA[className];
  if (!classData) return [];
  return classData.savingThrows;
}

export function calculateAC(
  dexMod: number,
  equippedArmor: ArmorData | null,
  hasShield: boolean,
  customACBonus: number = 0,
): number {
  let baseAC = 10;
  let dexBonus = dexMod;

  if (equippedArmor && equippedArmor.type !== "shield") {
    baseAC = equippedArmor.baseAC;
    if (equippedArmor.maxDexBonus !== null) {
      dexBonus =
        equippedArmor.maxDexBonus === 0
          ? 0
          : Math.min(dexMod, equippedArmor.maxDexBonus);
    }
  }

  const shieldBonus = hasShield ? 2 : 0;
  return baseAC + dexBonus + shieldBonus + customACBonus;
}

export function isWeaponProficient(
  weaponName: string,
  proficiencies: Proficiencies,
  weaponCategory?: "simple" | "martial" | "exotic",
): boolean {
  const weaponProfs = proficiencies.weapons || [];

  if (weaponProfs.includes(weaponName)) return true;

  // Resolve category: use explicit param if provided, else look up by name
  const cat: "simple" | "martial" | "exotic" | undefined =
    weaponCategory ??
    ((SIMPLE_WEAPONS as readonly string[]).includes(weaponName)
      ? "simple"
      : (MARTIAL_WEAPONS as readonly string[]).includes(weaponName)
        ? "martial"
        : undefined);

  if (cat === "simple") {
    if (
      weaponProfs.includes("Простое оружие") ||
      weaponProfs.includes("Воинское оружие")
    )
      return true;
  }
  if (cat === "martial") {
    if (weaponProfs.includes("Воинское оружие")) return true;
  }

  return false;
}

export function isArmorProficient(
  armorType: ArmorType | undefined,
  proficiencies: Proficiencies,
): boolean {
  const armorProfs = proficiencies.armor || [];

  if (!armorType || armorType === "none") return true;

  if (armorType === "light" && armorProfs.includes("Лёгкие доспехи"))
    return true;
  if (armorType === "medium" && armorProfs.includes("Средние доспехи"))
    return true;
  if (armorType === "heavy" && armorProfs.includes("Тяжёлые доспехи"))
    return true;
  if (armorType === "shield" && armorProfs.includes("Щиты")) return true;

  return false;
}

export interface CombinedProficiencies {
  languages: string[];
  weapons: string[];
  armor: string[];
  tools: string[];
  /** Авто-назначенные профиценции навыков от расы/подрасы */
  skills: string[];
  darkvision: number | null;
  /** Сопротивления урону от расы/подрасы */
  resistances: DamageType[];
  /** Иммунитеты к урону от расы/подрасы */
  immunities: DamageType[];
}

export function getRaceAndClassProficiencies(
  race: string,
  className: string,
  subrace?: string,
): CombinedProficiencies {
  const raceData = RACE_DATA[race];
  const classData = CLASS_DATA[className];

  const result: CombinedProficiencies = {
    languages: [],
    weapons: [],
    armor: [],
    tools: [],
    skills: [],
    darkvision: null,
    resistances: [],
    immunities: [],
  };

  if (raceData) {
    result.languages = [...raceData.languages];
    result.weapons = [...(raceData.weaponProficiencies || [])];
    result.armor = [...(raceData.armorProficiencies || [])];
    result.tools = [...(raceData.toolProficiencies || [])];
    result.skills = [...(raceData.skillProficiencies || [])];
    result.darkvision = raceData.darkvision || null;
    result.resistances = [...(raceData.resistances || [])] as DamageType[];
    result.immunities = [...(raceData.immunities || [])] as DamageType[];

    if (subrace && raceData.subraces && raceData.subraces[subrace]) {
      const subraceData = raceData.subraces[subrace];
      if (subraceData.weaponProficiencies) {
        result.weapons.push(...subraceData.weaponProficiencies);
      }
      if (subraceData.armorProficiencies) {
        result.armor.push(...subraceData.armorProficiencies);
      }
      if (subraceData.toolProficiencies) {
        result.tools.push(...subraceData.toolProficiencies);
      }
      if (subraceData.skillProficiencies) {
        result.skills.push(...subraceData.skillProficiencies);
      }
      if (subraceData.darkvision) {
        result.darkvision = subraceData.darkvision;
      }
      if (subraceData.resistances) {
        result.resistances.push(...(subraceData.resistances as DamageType[]));
      }
      if (subraceData.immunities) {
        result.immunities.push(...(subraceData.immunities as DamageType[]));
      }
    }
  }

  if (classData) {
    result.weapons.push(...classData.weaponProficiencies);
    result.armor.push(...classData.armorProficiencies);
    result.tools.push(...classData.toolProficiencies);
  }

  result.languages = Array.from(new Set(result.languages));
  result.weapons = Array.from(new Set(result.weapons));
  result.armor = Array.from(new Set(result.armor));
  result.tools = Array.from(new Set(result.tools));
  result.skills = Array.from(new Set(result.skills));
  result.resistances = Array.from(new Set(result.resistances)) as DamageType[];
  result.immunities = Array.from(new Set(result.immunities)) as DamageType[];

  return result;
}

export function getCharacterAutoProficiencies(character: {
  race: string;
  class: string;
  level: number;
  subclass?: string;
  subrace?: string;
  classes?: ClassEntry[];
  classSelections?: ClassSelection[];
}): CombinedProficiencies {
  const raceOnly = getRaceAndClassProficiencies(
    character.race,
    "",
    character.subrace,
  );
  const classState = resolveClassState(character);

  return {
    languages: Array.from(
      new Set([
        ...raceOnly.languages,
        ...classState.grantedProficiencies.languages,
      ]),
    ),
    weapons: Array.from(
      new Set([
        ...raceOnly.weapons,
        ...classState.grantedProficiencies.weapons,
      ]),
    ),
    armor: Array.from(
      new Set([
        ...raceOnly.armor,
        ...classState.grantedProficiencies.armor,
      ]),
    ),
    tools: Array.from(
      new Set([...raceOnly.tools, ...classState.grantedProficiencies.tools]),
    ),
    skills: Array.from(
      new Set([...raceOnly.skills, ...classState.grantedProficiencies.skills]),
    ),
    darkvision: raceOnly.darkvision,
    resistances: raceOnly.resistances,
    immunities: raceOnly.immunities,
  };
}

export function calculateSpellSaveDC(
  abilityModifier: number,
  proficiencyBonus: number,
): number {
  return 8 + proficiencyBonus + abilityModifier;
}

export function calculateSpellAttackBonus(
  abilityModifier: number,
  proficiencyBonus: number,
): number {
  return proficiencyBonus + abilityModifier;
}

export function getRaceDarkvision(
  race: string,
  subrace?: string,
): number | null {
  const raceData = RACE_DATA[race];
  if (!raceData) return null;

  if (subrace && raceData.subraces && raceData.subraces[subrace]) {
    const subraceData = raceData.subraces[subrace];
    if (subraceData.darkvision) return subraceData.darkvision;
  }

  return raceData.darkvision || null;
}

export const getDarkvision = getRaceDarkvision;

// ─── Extended race engine functions ──────────────────────────────────────────

/**
 * Возвращает эффективную скорость передвижения с учётом подрасы.
 * Например, Лесной эльф имеет speed=35, переопределяя базовые 30 эльфа.
 */
export function getRaceSpeed(race: string, subrace?: string): number {
  const raceData = RACE_DATA[race];
  if (!raceData) return 30;
  if (subrace && raceData.subraces?.[subrace]?.speed != null) {
    return raceData.subraces[subrace].speed!;
  }
  return raceData.speed;
}

/**
 * Возвращает тип существа расы (напр. "Гуманоид", "Нежить (Гуманоид)").
 * Если раса неизвестна — возвращает "Гуманоид" как дефолт.
 */
export function getRaceCreatureType(race: string): string {
  return RACE_DATA[race]?.creatureType ?? "Гуманоид";
}

/**
 * Возвращает авто-назначенные профиценции навыков от расы и подрасы.
 * Не включает навыки, выбираемые игроком (skillChoices).
 */
export function getRaceSkillGrants(race: string, subrace?: string): string[] {
  const raceData = RACE_DATA[race];
  if (!raceData) return [];

  const skills: string[] = [...(raceData.skillProficiencies || [])];

  if (subrace && raceData.subraces?.[subrace]?.skillProficiencies) {
    skills.push(...raceData.subraces[subrace].skillProficiencies!);
  }

  return Array.from(new Set(skills));
}

/**
 * Возвращает spell grants расы с учётом уровня персонажа и подрасы.
 * Только заклинания с minLevel ≤ characterLevel включаются в результат.
 */
export function getRaceSpellGrants(
  race: string,
  characterLevel: number,
  subrace?: string,
): RaceSpellGrant[] {
  const raceData = RACE_DATA[race];
  if (!raceData) return [];

  const allGrants: RaceSpellGrant[] = [
    ...(raceData.spellGrants || []),
  ];

  if (subrace && raceData.subraces?.[subrace]?.spellGrants) {
    allGrants.push(...raceData.subraces[subrace].spellGrants!);
  }

  return allGrants.filter((g) => g.minLevel <= characterLevel);
}

/**
 * Возвращает сопротивления урону от расы и подрасы (объединённые, без дублей).
 */
export function getRaceResistances(race: string, subrace?: string): DamageType[] {
  const raceData = RACE_DATA[race];
  if (!raceData) return [];

  const res: DamageType[] = [...((raceData.resistances || []) as DamageType[])];

  if (subrace && raceData.subraces?.[subrace]?.resistances) {
    res.push(...(raceData.subraces[subrace].resistances as DamageType[]));
  }

  return Array.from(new Set(res)) as DamageType[];
}

export function createEquipmentFromBase(
  baseItem: BaseEquipmentItem,
  quantity: number = 1,
): Omit<Equipment, "id"> {
  return {
    name: baseItem.name,
    quantity,
    weight: baseItem.weight,
    description: baseItem.description,
    category: baseItem.category,
    isArmor: baseItem.isArmor,
    armorType: baseItem.armorType,
    armorBaseAC: baseItem.armorBaseAC,
    armorMaxDexBonus: baseItem.armorMaxDexBonus,
    isWeapon: baseItem.isWeapon,
    damage: baseItem.damage,
    versatileDamage: baseItem.versatileDamage,
    damageType: baseItem.damageType,
    weaponProperties: baseItem.weaponProperties,
    gripMode: baseItem.isWeapon ? "oneHand" : undefined,
    weaponCategory: baseItem.weaponCategory,
    attackBonus: 0,
    abilityMod: baseItem.abilityMod,
    isFinesse: baseItem.isFinesse,
    equipped: false,
  };
}

export function getCharacterClasses(character: {
  class: string;
  level: number;
  subclass?: string;
  classes?: ClassEntry[];
  classSelections?: ClassSelection[];
}): ClassEntry[] {
  if (character.classSelections && character.classSelections.length > 0) {
    const projected = projectLegacyClassState(character.classSelections);
    const legacyClasses =
      character.classes && character.classes.length > 0
        ? character.classes
        : [
            {
              name: character.class,
              level: character.level,
              subclass: character.subclass,
            },
          ];
    const hasMismatch =
      projected.classes.length !== legacyClasses.length ||
      projected.classes.some((entry, index) => {
        const legacyEntry = legacyClasses[index];
        return (
          entry.name !== legacyEntry?.name ||
          entry.level !== legacyEntry?.level ||
          entry.subclass !== legacyEntry?.subclass
        );
      });

    if (!hasMismatch) {
      return character.classSelections.map((selection) => ({
        name: selection.className,
        level: selection.level,
        subclass: selection.subclassName,
      }));
    }
  }
  if (character.classes && character.classes.length > 0) {
    return character.classes;
  }
  return [
    {
      name: character.class,
      level: character.level,
      subclass: character.subclass,
    },
  ];
}

export function getCharacterClassSelections(character: {
  class: string;
  level: number;
  subclass?: string;
  classes?: ClassEntry[];
  classSelections?: ClassSelection[];
}): ClassSelection[] {
  if (character.classSelections && character.classSelections.length > 0) {
    const projected = projectLegacyClassState(character.classSelections);
    const legacyClasses =
      character.classes && character.classes.length > 0
        ? character.classes
        : [
            {
              name: character.class,
              level: character.level,
              subclass: character.subclass,
            },
          ];
    const hasMismatch =
      projected.classes.length !== legacyClasses.length ||
      projected.classes.some((entry, index) => {
        const legacyEntry = legacyClasses[index];
        return (
          entry.name !== legacyEntry?.name ||
          entry.level !== legacyEntry?.level ||
          entry.subclass !== legacyEntry?.subclass
        );
      });

    if (!hasMismatch) {
      return buildClassSelectionsFromLegacy(
        character,
        getClassDefinitionByName,
      ) as ClassSelection[];
    }
  }
  return buildClassSelectionsFromLegacy(
    {
      class: character.class,
      level: character.level,
      subclass: character.subclass,
      classes: character.classes,
    },
    getClassDefinitionByName,
  ) as ClassSelection[];
}

export function getTotalLevel(classes: ClassEntry[]): number {
  return Math.min(
    20,
    classes.reduce((sum, c) => sum + c.level, 0),
  );
}

export function formatClassesDisplay(classes: ClassEntry[]): string {
  if (classes.length <= 1) {
    return classes[0]?.name || "";
  }
  return classes.map((c) => `${c.name} ${c.level}`).join(" / ");
}

export function getMulticlassHitDice(
  classes: ClassEntry[],
): { dice: string; count: number }[] {
  const result: { dice: string; count: number }[] = [];
  for (const entry of classes) {
    const classData = CLASS_DATA[entry.name];
    const dice = classData?.hitDice || "d10";
    const existing = result.find((r) => r.dice === dice);
    if (existing) {
      existing.count += entry.level;
    } else {
      result.push({ dice, count: entry.level });
    }
  }
  return result;
}

export function hasAnyCasterClass(classes: ClassEntry[]): boolean {
  return classes.some((c) => CLASS_DATA[c.name]?.spellcastingAbility);
}

export const DEFAULT_SKILLS_PROFICIENCY: Record<string, SkillProficiency> =
  Object.fromEntries(
    SKILLS.map((skill) => [
      skill.name,
      { proficient: false, expertise: false },
    ]),
  );

export function createDefaultCharacter(): InsertCharacter {
  const defaultClass = "Воин";
  const classData = CLASS_DATA[defaultClass];
  const classDefinition = getClassDefinitionByName(defaultClass);
  const defaultConMod = 0;
  const defaultMaxHp = calculateMaxHp(defaultClass, 1, defaultConMod);

  return {
    name: "Новый персонаж",
    class: defaultClass,
    race: "Человек",
    level: 1,
    classes: [{ name: defaultClass, level: 1 }],
    classSelections: [
      {
        id: "class-selection-1-fighter",
        classId: classDefinition?.id ?? "fighter",
        className: defaultClass,
        source: classDefinition?.source ?? "PHB",
        contentVersion: classDefinition?.contentVersion ?? "2014",
        level: 1,
        choices: {},
        optionalFeatureIds: [],
      },
    ],
    classSelectionSchemaVersion: 1,
    background: "",
    alignment: "Истинно нейтральный",
    experience: 0,
    abilityScores: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    selectedRacialAbilityBonuses: createEmptyAbilityBonuses(),
    customAbilityBonuses: createEmptyAbilityBonuses(),
    savingThrows: {
      STR: classData.savingThrows.includes("STR"),
      DEX: classData.savingThrows.includes("DEX"),
      CON: classData.savingThrows.includes("CON"),
      INT: classData.savingThrows.includes("INT"),
      WIS: classData.savingThrows.includes("WIS"),
      CHA: classData.savingThrows.includes("CHA"),
    },
    skills: { ...DEFAULT_SKILLS_PROFICIENCY },
    armorClass: 10,
    customACBonus: 0,
    initiative: 0,
    customInitiativeBonus: 0,
    speed: 30,
    maxHp: defaultMaxHp,
    customMaxHpBonus: 0,
    currentHp: defaultMaxHp,
    tempHp: 0,
    hitDice: `1${classData.hitDice}`,
    hitDiceRemaining: 1,
    deathSaves: { successes: 0, failures: 0 },
    weapons: [],
    features: [],
    equipment: [],
    money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    proficiencies: { languages: ["Общий"], weapons: [], armor: [], tools: [] },
    proficiencyBonus: 2,
    inspiration: false,
    notes: "",
    personalityTraits: "",
    ideals: "",
    bonds: "",
    flaws: "",
    appearance: "",
    age: "",
    height: "",
    weight: "",
    eyes: "",
    skin: "",
    hair: "",
    allies: "",
    factions: "",
    equipmentLocked: false,
    weaponsLocked: false,
    featuresLocked: false,
    spellSlotsLocked: false,
  };
}
