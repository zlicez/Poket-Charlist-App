import { z } from "zod";

export const ABILITY_NAMES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
export type AbilityName = typeof ABILITY_NAMES[number];

export const ABILITY_LABELS: Record<AbilityName, { en: string; ru: string }> = {
  STR: { en: "Strength", ru: "Сила" },
  DEX: { en: "Dexterity", ru: "Ловкость" },
  CON: { en: "Constitution", ru: "Телосложение" },
  INT: { en: "Intelligence", ru: "Интеллект" },
  WIS: { en: "Wisdom", ru: "Мудрость" },
  CHA: { en: "Charisma", ru: "Харизма" },
};

export const SKILLS = [
  { name: "Акробатика", ability: "DEX" as AbilityName },
  { name: "Анализ", ability: "INT" as AbilityName },
  { name: "Атлетика", ability: "STR" as AbilityName },
  { name: "Восприятие", ability: "WIS" as AbilityName },
  { name: "Выживание", ability: "WIS" as AbilityName },
  { name: "Выступление", ability: "CHA" as AbilityName },
  { name: "Запугивание", ability: "CHA" as AbilityName },
  { name: "История", ability: "INT" as AbilityName },
  { name: "Ловкость рук", ability: "DEX" as AbilityName },
  { name: "Магия", ability: "INT" as AbilityName },
  { name: "Медицина", ability: "WIS" as AbilityName },
  { name: "Обман", ability: "CHA" as AbilityName },
  { name: "Природа", ability: "INT" as AbilityName },
  { name: "Проницательность", ability: "WIS" as AbilityName },
  { name: "Религия", ability: "INT" as AbilityName },
  { name: "Скрытность", ability: "DEX" as AbilityName },
  { name: "Убеждение", ability: "CHA" as AbilityName },
  { name: "Уход за животными", ability: "WIS" as AbilityName },
] as const;

export type SkillName = typeof SKILLS[number]["name"];

export const SKILLS_BY_ABILITY: Record<AbilityName, typeof SKILLS[number][]> = {
  STR: SKILLS.filter(s => s.ability === "STR"),
  DEX: SKILLS.filter(s => s.ability === "DEX"),
  CON: SKILLS.filter(s => s.ability === "CON"),
  INT: SKILLS.filter(s => s.ability === "INT"),
  WIS: SKILLS.filter(s => s.ability === "WIS"),
  CHA: SKILLS.filter(s => s.ability === "CHA"),
};

export interface ClassData {
  name: string;
  hitDice: string;
  hitDiceValue: number;
  savingThrows: AbilityName[];
}

export const CLASS_DATA: Record<string, ClassData> = {
  "Бард": { name: "Бард", hitDice: "d8", hitDiceValue: 8, savingThrows: ["DEX", "CHA"] },
  "Варвар": { name: "Варвар", hitDice: "d12", hitDiceValue: 12, savingThrows: ["STR", "CON"] },
  "Воин": { name: "Воин", hitDice: "d10", hitDiceValue: 10, savingThrows: ["STR", "CON"] },
  "Волшебник": { name: "Волшебник", hitDice: "d6", hitDiceValue: 6, savingThrows: ["INT", "WIS"] },
  "Друид": { name: "Друид", hitDice: "d8", hitDiceValue: 8, savingThrows: ["INT", "WIS"] },
  "Жрец": { name: "Жрец", hitDice: "d8", hitDiceValue: 8, savingThrows: ["WIS", "CHA"] },
  "Изобретатель": { name: "Изобретатель", hitDice: "d8", hitDiceValue: 8, savingThrows: ["CON", "INT"] },
  "Колдун": { name: "Колдун", hitDice: "d8", hitDiceValue: 8, savingThrows: ["WIS", "CHA"] },
  "Монах": { name: "Монах", hitDice: "d8", hitDiceValue: 8, savingThrows: ["STR", "DEX"] },
  "Паладин": { name: "Паладин", hitDice: "d10", hitDiceValue: 10, savingThrows: ["WIS", "CHA"] },
  "Плут": { name: "Плут", hitDice: "d8", hitDiceValue: 8, savingThrows: ["DEX", "INT"] },
  "Следопыт": { name: "Следопыт", hitDice: "d10", hitDiceValue: 10, savingThrows: ["STR", "DEX"] },
  "Чародей": { name: "Чародей", hitDice: "d6", hitDiceValue: 6, savingThrows: ["CON", "CHA"] },
};

export const CLASSES = Object.keys(CLASS_DATA) as (keyof typeof CLASS_DATA)[];

export interface RaceData {
  name: string;
  abilityBonuses: Partial<Record<AbilityName, number>>;
  speed: number;
  subraces?: Record<string, { name: string; abilityBonuses: Partial<Record<AbilityName, number>> }>;
}

export const RACE_DATA: Record<string, RaceData> = {
  "Человек": {
    name: "Человек",
    abilityBonuses: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
    speed: 30,
  },
  "Эльф": {
    name: "Эльф",
    abilityBonuses: { DEX: 2 },
    speed: 30,
    subraces: {
      "Высший эльф": { name: "Высший эльф", abilityBonuses: { INT: 1 } },
      "Лесной эльф": { name: "Лесной эльф", abilityBonuses: { WIS: 1 } },
      "Тёмный эльф": { name: "Тёмный эльф", abilityBonuses: { CHA: 1 } },
    },
  },
  "Дварф": {
    name: "Дварф",
    abilityBonuses: { CON: 2 },
    speed: 25,
    subraces: {
      "Горный дварф": { name: "Горный дварф", abilityBonuses: { STR: 2 } },
      "Холмовой дварф": { name: "Холмовой дварф", abilityBonuses: { WIS: 1 } },
    },
  },
  "Полурослик": {
    name: "Полурослик",
    abilityBonuses: { DEX: 2 },
    speed: 25,
    subraces: {
      "Легконогий": { name: "Легконогий", abilityBonuses: { CHA: 1 } },
      "Коренастый": { name: "Коренастый", abilityBonuses: { CON: 1 } },
    },
  },
  "Драконорождённый": {
    name: "Драконорождённый",
    abilityBonuses: { STR: 2, CHA: 1 },
    speed: 30,
  },
  "Гном": {
    name: "Гном",
    abilityBonuses: { INT: 2 },
    speed: 25,
    subraces: {
      "Лесной гном": { name: "Лесной гном", abilityBonuses: { DEX: 1 } },
      "Скальный гном": { name: "Скальный гном", abilityBonuses: { CON: 1 } },
    },
  },
  "Полуэльф": {
    name: "Полуэльф",
    abilityBonuses: { CHA: 2 },
    speed: 30,
  },
  "Полуорк": {
    name: "Полуорк",
    abilityBonuses: { STR: 2, CON: 1 },
    speed: 30,
  },
  "Тифлинг": {
    name: "Тифлинг",
    abilityBonuses: { INT: 1, CHA: 2 },
    speed: 30,
  },
  "Аасимар": {
    name: "Аасимар",
    abilityBonuses: { CHA: 2 },
    speed: 30,
    subraces: {
      "Защитник": { name: "Защитник", abilityBonuses: { WIS: 1 } },
      "Каратель": { name: "Каратель", abilityBonuses: { STR: 1 } },
      "Падший": { name: "Падший", abilityBonuses: { STR: 1 } },
    },
  },
};

export const RACES = Object.keys(RACE_DATA) as (keyof typeof RACE_DATA)[];

export const ALIGNMENTS = [
  "Законно-добрый", "Нейтрально-добрый", "Хаотично-добрый",
  "Законно-нейтральный", "Истинно нейтральный", "Хаотично-нейтральный",
  "Законно-злой", "Нейтрально-злой", "Хаотично-злой"
] as const;

export const XP_THRESHOLDS: number[] = [
  0,      // Level 1
  300,    // Level 2
  900,    // Level 3
  2700,   // Level 4
  6500,   // Level 5
  14000,  // Level 6
  23000,  // Level 7
  34000,  // Level 8
  48000,  // Level 9
  64000,  // Level 10
  85000,  // Level 11
  100000, // Level 12
  120000, // Level 13
  140000, // Level 14
  165000, // Level 15
  195000, // Level 16
  225000, // Level 17
  265000, // Level 18
  305000, // Level 19
  355000, // Level 20
];

export function getLevelFromXP(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPProgress(xp: number, level: number): { current: number; next: number; progress: number } {
  const currentThreshold = XP_THRESHOLDS[level - 1] || 0;
  const nextThreshold = XP_THRESHOLDS[level] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const progress = level >= 20 ? 100 : Math.min(100, ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
  return { current: currentThreshold, next: nextThreshold, progress };
}

export type ArmorType = "none" | "light" | "medium" | "heavy" | "shield";

export interface ArmorData {
  name: string;
  type: ArmorType;
  baseAC: number;
  maxDexBonus: number | null;
  stealthDisadvantage: boolean;
  strengthRequirement?: number;
}

export const ARMOR_LIST: ArmorData[] = [
  { name: "Без доспехов", type: "none", baseAC: 10, maxDexBonus: null, stealthDisadvantage: false },
  { name: "Стёганый", type: "light", baseAC: 11, maxDexBonus: null, stealthDisadvantage: true },
  { name: "Кожаный", type: "light", baseAC: 11, maxDexBonus: null, stealthDisadvantage: false },
  { name: "Проклёпанная кожа", type: "light", baseAC: 12, maxDexBonus: null, stealthDisadvantage: false },
  { name: "Шкурный", type: "medium", baseAC: 12, maxDexBonus: 2, stealthDisadvantage: false },
  { name: "Кольчужная рубаха", type: "medium", baseAC: 13, maxDexBonus: 2, stealthDisadvantage: false },
  { name: "Чешуйчатый", type: "medium", baseAC: 14, maxDexBonus: 2, stealthDisadvantage: true },
  { name: "Кираса", type: "medium", baseAC: 15, maxDexBonus: 2, stealthDisadvantage: false },
  { name: "Полулаты", type: "medium", baseAC: 15, maxDexBonus: 2, stealthDisadvantage: true },
  { name: "Кольчуга", type: "heavy", baseAC: 16, maxDexBonus: 0, stealthDisadvantage: true, strengthRequirement: 13 },
  { name: "Наборный", type: "heavy", baseAC: 17, maxDexBonus: 0, stealthDisadvantage: true, strengthRequirement: 15 },
  { name: "Латы", type: "heavy", baseAC: 18, maxDexBonus: 0, stealthDisadvantage: true, strengthRequirement: 15 },
  { name: "Щит", type: "shield", baseAC: 2, maxDexBonus: 0, stealthDisadvantage: false },
];

export function calculateAC(
  dexMod: number,
  equippedArmor: ArmorData | null,
  hasShield: boolean,
  customACBonus: number = 0
): number {
  let baseAC = 10;
  let dexBonus = dexMod;
  
  if (equippedArmor && equippedArmor.type !== "shield") {
    baseAC = equippedArmor.baseAC;
    if (equippedArmor.maxDexBonus !== null) {
      dexBonus = Math.min(dexMod, equippedArmor.maxDexBonus);
    }
  }
  
  const shieldBonus = hasShield ? 2 : 0;
  return baseAC + dexBonus + shieldBonus + customACBonus;
}

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

export const weaponSchema = z.object({
  id: z.string(),
  name: z.string(),
  attackBonus: z.number(),
  damage: z.string(),
  damageType: z.string(),
  properties: z.string().optional(),
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
  isArmor: z.boolean().optional(),
  armorType: z.enum(["none", "light", "medium", "heavy", "shield"]).optional(),
  armorBaseAC: z.number().optional(),
  armorMaxDexBonus: z.number().nullable().optional(),
  equipped: z.boolean().optional(),
});

export type Equipment = z.infer<typeof equipmentSchema>;

export const characterSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  avatar: z.string().optional(),
  class: z.string(),
  subclass: z.string().optional(),
  race: z.string(),
  subrace: z.string().optional(),
  level: z.number().min(1).max(20).default(1),
  background: z.string().optional(),
  alignment: z.string().optional(),
  experience: z.number().min(0).default(0),
  abilityScores: abilityScoresSchema,
  customAbilityBonuses: abilityBonusesSchema.optional(),
  savingThrows: savingThrowsSchema,
  skills: z.record(z.string(), skillProficiencySchema),
  armorClass: z.number().min(0).default(10),
  customACBonus: z.number().default(0),
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
  proficiencyBonus: z.number().default(2),
  notes: z.string().optional(),
  appearance: z.string().optional(),
  allies: z.string().optional(),
  factions: z.string().optional(),
});

export type Character = z.infer<typeof characterSchema>;

export const insertCharacterSchema = characterSchema.omit({ id: true });
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getRacialBonuses(race: string, subrace?: string): Partial<Record<AbilityName, number>> {
  const raceData = RACE_DATA[race];
  if (!raceData) return {};
  
  const bonuses = { ...raceData.abilityBonuses };
  
  if (subrace && raceData.subraces && raceData.subraces[subrace]) {
    const subraceData = raceData.subraces[subrace];
    for (const ability of ABILITY_NAMES) {
      if (subraceData.abilityBonuses[ability]) {
        bonuses[ability] = (bonuses[ability] || 0) + subraceData.abilityBonuses[ability]!;
      }
    }
  }
  
  return bonuses;
}

export function getTotalAbilityScore(
  baseScore: number,
  racialBonus: number,
  customBonus: number
): number {
  return baseScore + racialBonus + customBonus;
}

export function getClassHitDice(className: string): { dice: string; value: number } {
  const classData = CLASS_DATA[className];
  if (!classData) return { dice: "d10", value: 10 };
  return { dice: classData.hitDice, value: classData.hitDiceValue };
}

export function getClassSavingThrows(className: string): AbilityName[] {
  const classData = CLASS_DATA[className];
  if (!classData) return [];
  return classData.savingThrows;
}

export const DEFAULT_SKILLS_PROFICIENCY: Record<string, SkillProficiency> = Object.fromEntries(
  SKILLS.map(skill => [skill.name, { proficient: false, expertise: false }])
);

export function createDefaultCharacter(): InsertCharacter {
  const defaultClass = "Воин";
  const classData = CLASS_DATA[defaultClass];
  
  return {
    name: "Новый персонаж",
    class: defaultClass,
    race: "Человек",
    level: 1,
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
      CHA: classData.savingThrows.includes("CHA") 
    },
    skills: { ...DEFAULT_SKILLS_PROFICIENCY },
    armorClass: 10,
    customACBonus: 0,
    initiative: 0,
    customInitiativeBonus: 0,
    speed: 30,
    maxHp: classData.hitDiceValue,
    currentHp: classData.hitDiceValue,
    tempHp: 0,
    hitDice: `1${classData.hitDice}`,
    hitDiceRemaining: 1,
    deathSaves: { successes: 0, failures: 0 },
    weapons: [],
    features: [],
    equipment: [],
    proficiencyBonus: 2,
    notes: "",
    appearance: "",
    allies: "",
    factions: "",
  };
}
