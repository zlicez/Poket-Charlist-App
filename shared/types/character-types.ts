import { z } from "zod";
import {
  ABILITY_NAMES,
  type AbilityName,
  SKILLS,
  SIMPLE_WEAPONS,
  MARTIAL_WEAPONS,
} from "../data/d5e-constants";
import { RACE_DATA } from "../data/d5e-races";
import { CLASS_DATA } from "../data/d5e-classes";
import type {
  ArmorData,
  ArmorType,
  BaseEquipmentItem,
} from "../data/d5e-equipment";

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

export const weaponSchema = z.object({
  id: z.string(),
  name: z.string(),
  attackBonus: z.number(),
  damage: z.string(),
  damageType: z.string(),
  properties: z.string().optional(),
  abilityMod: z.enum(["str", "dex"]).default("str"),
  isFinesse: z.boolean().optional(),
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
  damageType: z.string().optional(),
  weaponProperties: z.string().optional(),
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
  background: z.string().optional(),
  alignment: z.string().optional(),
  experience: z.number().min(0).default(0),
  abilityScores: abilityScoresSchema,
  customAbilityBonuses: abilityBonusesSchema.optional(),
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
  notes: z.string().optional(),
  appearance: z.string().optional(),
  allies: z.string().optional(),
  factions: z.string().optional(),
  equipmentLocked: z.boolean().default(false),
  weaponsLocked: z.boolean().default(false),
  featuresLocked: z.boolean().default(false),
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
): Partial<Record<AbilityName, number>> {
  const raceData = RACE_DATA[race];
  if (!raceData) return {};

  const bonuses = { ...raceData.abilityBonuses };

  if (subrace && raceData.subraces && raceData.subraces[subrace]) {
    const subraceData = raceData.subraces[subrace];
    for (const ability of ABILITY_NAMES) {
      if (subraceData.abilityBonuses[ability]) {
        bonuses[ability] =
          (bonuses[ability] || 0) + subraceData.abilityBonuses[ability]!;
      }
    }
  }

  return bonuses;
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
): boolean {
  const weaponProfs = proficiencies.weapons || [];

  if (weaponProfs.includes(weaponName)) return true;

  const isSimpleWeapon = (SIMPLE_WEAPONS as readonly string[]).includes(
    weaponName,
  );
  const isMartialWeapon = (MARTIAL_WEAPONS as readonly string[]).includes(
    weaponName,
  );

  if (weaponProfs.includes("Простое оружие") && isSimpleWeapon) return true;
  if (weaponProfs.includes("Воинское оружие") && isMartialWeapon) return true;
  if (weaponProfs.includes("Воинское оружие") && isSimpleWeapon) return true;

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
  darkvision: number | null;
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
    darkvision: null,
  };

  if (raceData) {
    result.languages = [...raceData.languages];
    result.weapons = [...(raceData.weaponProficiencies || [])];
    result.armor = [...(raceData.armorProficiencies || [])];
    result.tools = [...(raceData.toolProficiencies || [])];
    result.darkvision = raceData.darkvision || null;

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
      if (subraceData.darkvision) {
        result.darkvision = subraceData.darkvision;
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

  return result;
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
    damageType: baseItem.damageType,
    weaponProperties: baseItem.weaponProperties,
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
}): ClassEntry[] {
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
  const defaultConMod = 0;
  const defaultMaxHp = calculateMaxHp(defaultClass, 1, defaultConMod);

  return {
    name: "Новый персонаж",
    class: defaultClass,
    race: "Человек",
    level: 1,
    classes: [{ name: defaultClass, level: 1 }],
    background: "",
    alignment: "Истинно нейтральный",
    experience: 0,
    abilityScores: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    customAbilityBonuses: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
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
    notes: "",
    appearance: "",
    allies: "",
    factions: "",
    equipmentLocked: false,
    weaponsLocked: false,
    featuresLocked: false,
  };
}
