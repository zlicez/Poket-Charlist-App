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

export const CLASSES = [
  "Бард", "Варвар", "Воин", "Волшебник", "Друид", "Жрец",
  "Изобретатель", "Колдун", "Монах", "Паладин", "Плут", "Следопыт", "Чародей"
] as const;

export const RACES = [
  "Человек", "Эльф", "Дварф", "Полурослик", "Драконорождённый",
  "Гном", "Полуэльф", "Полуорк", "Тифлинг", "Аасимар"
] as const;

export const ALIGNMENTS = [
  "Законно-добрый", "Нейтрально-добрый", "Хаотично-добрый",
  "Законно-нейтральный", "Истинно нейтральный", "Хаотично-нейтральный",
  "Законно-злой", "Нейтрально-злой", "Хаотично-злой"
] as const;

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
  savingThrows: savingThrowsSchema,
  skills: z.record(z.string(), skillProficiencySchema),
  armorClass: z.number().min(0).default(10),
  initiative: z.number().default(0),
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

export const DEFAULT_SKILLS_PROFICIENCY: Record<string, SkillProficiency> = Object.fromEntries(
  SKILLS.map(skill => [skill.name, { proficient: false, expertise: false }])
);

export function createDefaultCharacter(): InsertCharacter {
  return {
    name: "Новый персонаж",
    class: "Воин",
    race: "Человек",
    level: 1,
    background: "",
    alignment: "Истинно нейтральный",
    experience: 0,
    abilityScores: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    savingThrows: { STR: false, DEX: false, CON: false, INT: false, WIS: false, CHA: false },
    skills: { ...DEFAULT_SKILLS_PROFICIENCY },
    armorClass: 10,
    initiative: 0,
    speed: 30,
    maxHp: 10,
    currentHp: 10,
    tempHp: 0,
    hitDice: "1d10",
    hitDiceRemaining: 1,
    deathSaves: { successes: 0, failures: 0 },
    weapons: [],
    features: [],
    equipment: [],
    proficiencyBonus: 2,
    notes: "",
  };
}
