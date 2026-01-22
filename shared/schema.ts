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

// Equipment Categories
export const EQUIPMENT_CATEGORIES = [
  "weapon", "armor", "food", "potion", "tool", "misc", "trash"
] as const;

export type EquipmentCategory = typeof EQUIPMENT_CATEGORIES[number];

export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  weapon: "Оружие",
  armor: "Доспехи",
  food: "Еда",
  potion: "Зелья",
  tool: "Инструменты",
  misc: "Прочее",
  trash: "Мусор",
};

// D&D 5e Base Equipment Catalog
export interface BaseEquipmentItem {
  name: string;
  category: EquipmentCategory;
  weight?: number;
  description?: string;
  cost?: string;
  // Weapon properties
  isWeapon?: boolean;
  damage?: string;
  damageType?: string;
  weaponProperties?: string;
  weaponType?: "melee" | "ranged";
  abilityMod?: "str" | "dex";
  isFinesse?: boolean;
  // Armor properties
  isArmor?: boolean;
  armorType?: ArmorType;
  armorBaseAC?: number;
  armorMaxDexBonus?: number | null;
}

export const BASE_WEAPONS: BaseEquipmentItem[] = [
  // Simple Melee Weapons (STR-based)
  { name: "Боевой посох", category: "weapon", isWeapon: true, damage: "1d6", damageType: "дробящий", weaponProperties: "универсальное (1d8)", weight: 4, weaponType: "melee", abilityMod: "str", cost: "2 sp" },
  { name: "Булава", category: "weapon", isWeapon: true, damage: "1d6", damageType: "дробящий", weight: 4, weaponType: "melee", abilityMod: "str", cost: "5 gp" },
  { name: "Дубинка", category: "weapon", isWeapon: true, damage: "1d4", damageType: "дробящий", weaponProperties: "лёгкое", weight: 2, weaponType: "melee", abilityMod: "str", cost: "1 sp" },
  { name: "Кинжал", category: "weapon", isWeapon: true, damage: "1d4", damageType: "колющий", weaponProperties: "лёгкое, метательное, фехтовальное", weight: 1, weaponType: "melee", abilityMod: "dex", isFinesse: true, cost: "2 gp" },
  { name: "Копьё", category: "weapon", isWeapon: true, damage: "1d6", damageType: "колющий", weaponProperties: "метательное, универсальное (1d8)", weight: 3, weaponType: "melee", abilityMod: "str", cost: "1 gp" },
  { name: "Лёгкий молот", category: "weapon", isWeapon: true, damage: "1d4", damageType: "дробящий", weaponProperties: "лёгкое, метательное", weight: 2, weaponType: "melee", abilityMod: "str", cost: "2 gp" },
  { name: "Метательное копьё", category: "weapon", isWeapon: true, damage: "1d6", damageType: "колющий", weaponProperties: "метательное", weight: 2, weaponType: "melee", abilityMod: "str", cost: "5 sp" },
  { name: "Ручной топор", category: "weapon", isWeapon: true, damage: "1d6", damageType: "рубящий", weaponProperties: "лёгкое, метательное", weight: 2, weaponType: "melee", abilityMod: "str", cost: "5 gp" },
  { name: "Серп", category: "weapon", isWeapon: true, damage: "1d4", damageType: "рубящий", weaponProperties: "лёгкое", weight: 2, weaponType: "melee", abilityMod: "str", cost: "1 gp" },
  { name: "Палица", category: "weapon", isWeapon: true, damage: "1d8", damageType: "дробящий", weaponProperties: "двуручное", weight: 10, weaponType: "melee", abilityMod: "str", cost: "2 sp" },
  // Simple Ranged Weapons (DEX-based)
  { name: "Лёгкий арбалет", category: "weapon", isWeapon: true, damage: "1d8", damageType: "колющий", weaponProperties: "боеприпасы, двуручное, перезарядка", weight: 5, weaponType: "ranged", abilityMod: "dex", cost: "25 gp" },
  { name: "Дротик", category: "weapon", isWeapon: true, damage: "1d4", damageType: "колющий", weaponProperties: "метательное, фехтовальное", weight: 0.25, weaponType: "ranged", abilityMod: "dex", isFinesse: true, cost: "5 cp" },
  { name: "Короткий лук", category: "weapon", isWeapon: true, damage: "1d6", damageType: "колющий", weaponProperties: "боеприпасы, двуручное", weight: 2, weaponType: "ranged", abilityMod: "dex", cost: "25 gp" },
  { name: "Праща", category: "weapon", isWeapon: true, damage: "1d4", damageType: "дробящий", weaponProperties: "боеприпасы", weight: 0, weaponType: "ranged", abilityMod: "dex", cost: "1 sp" },
  // Martial Melee Weapons (STR-based, some Finesse)
  { name: "Длинный меч", category: "weapon", isWeapon: true, damage: "1d8", damageType: "рубящий", weaponProperties: "универсальное (1d10)", weight: 3, weaponType: "melee", abilityMod: "str", cost: "15 gp" },
  { name: "Короткий меч", category: "weapon", isWeapon: true, damage: "1d6", damageType: "колющий", weaponProperties: "лёгкое, фехтовальное", weight: 2, weaponType: "melee", abilityMod: "dex", isFinesse: true, cost: "10 gp" },
  { name: "Рапира", category: "weapon", isWeapon: true, damage: "1d8", damageType: "колющий", weaponProperties: "фехтовальное", weight: 2, weaponType: "melee", abilityMod: "dex", isFinesse: true, cost: "25 gp" },
  { name: "Скимитар", category: "weapon", isWeapon: true, damage: "1d6", damageType: "рубящий", weaponProperties: "лёгкое, фехтовальное", weight: 3, weaponType: "melee", abilityMod: "dex", isFinesse: true, cost: "25 gp" },
  { name: "Боевой топор", category: "weapon", isWeapon: true, damage: "1d8", damageType: "рубящий", weaponProperties: "универсальное (1d10)", weight: 4, weaponType: "melee", abilityMod: "str", cost: "10 gp" },
  { name: "Боевой молот", category: "weapon", isWeapon: true, damage: "1d8", damageType: "дробящий", weaponProperties: "универсальное (1d10)", weight: 2, weaponType: "melee", abilityMod: "str", cost: "15 gp" },
  { name: "Моргенштерн", category: "weapon", isWeapon: true, damage: "1d8", damageType: "колющий", weight: 4, weaponType: "melee", abilityMod: "str", cost: "15 gp" },
  { name: "Цеп", category: "weapon", isWeapon: true, damage: "1d8", damageType: "дробящий", weight: 2, weaponType: "melee", abilityMod: "str", cost: "10 gp" },
  { name: "Секира", category: "weapon", isWeapon: true, damage: "1d12", damageType: "рубящий", weaponProperties: "тяжёлое, двуручное", weight: 7, weaponType: "melee", abilityMod: "str", cost: "30 gp" },
  { name: "Двуручный меч", category: "weapon", isWeapon: true, damage: "2d6", damageType: "рубящий", weaponProperties: "тяжёлое, двуручное", weight: 6, weaponType: "melee", abilityMod: "str", cost: "50 gp" },
  { name: "Глефа", category: "weapon", isWeapon: true, damage: "1d10", damageType: "рубящий", weaponProperties: "тяжёлое, двуручное, досягаемость", weight: 6, weaponType: "melee", abilityMod: "str", cost: "20 gp" },
  { name: "Алебарда", category: "weapon", isWeapon: true, damage: "1d10", damageType: "рубящий", weaponProperties: "тяжёлое, двуручное, досягаемость", weight: 6, weaponType: "melee", abilityMod: "str", cost: "20 gp" },
  { name: "Пика", category: "weapon", isWeapon: true, damage: "1d10", damageType: "колющий", weaponProperties: "тяжёлое, двуручное, досягаемость", weight: 18, weaponType: "melee", abilityMod: "str", cost: "5 gp" },
  { name: "Молот", category: "weapon", isWeapon: true, damage: "2d6", damageType: "дробящий", weaponProperties: "тяжёлое, двуручное", weight: 10, weaponType: "melee", abilityMod: "str", cost: "10 gp" },
  { name: "Кнут", category: "weapon", isWeapon: true, damage: "1d4", damageType: "рубящий", weaponProperties: "фехтовальное, досягаемость", weight: 3, weaponType: "melee", abilityMod: "dex", isFinesse: true, cost: "2 gp" },
  { name: "Трезубец", category: "weapon", isWeapon: true, damage: "1d6", damageType: "колющий", weaponProperties: "метательное, универсальное (1d8)", weight: 4, weaponType: "melee", abilityMod: "str", cost: "5 gp" },
  // Martial Ranged Weapons (DEX-based)
  { name: "Длинный лук", category: "weapon", isWeapon: true, damage: "1d8", damageType: "колющий", weaponProperties: "боеприпасы, тяжёлое, двуручное", weight: 2, weaponType: "ranged", abilityMod: "dex", cost: "50 gp" },
  { name: "Ручной арбалет", category: "weapon", isWeapon: true, damage: "1d6", damageType: "колющий", weaponProperties: "боеприпасы, лёгкое, перезарядка", weight: 3, weaponType: "ranged", abilityMod: "dex", cost: "75 gp" },
  { name: "Тяжёлый арбалет", category: "weapon", isWeapon: true, damage: "1d10", damageType: "колющий", weaponProperties: "боеприпасы, тяжёлое, двуручное, перезарядка", weight: 18, weaponType: "ranged", abilityMod: "dex", cost: "50 gp" },
];

export const BASE_ARMOR: BaseEquipmentItem[] = ARMOR_LIST.filter(a => a.name !== "Без доспехов").map(armor => ({
  name: armor.name,
  category: "armor" as EquipmentCategory,
  isArmor: true,
  armorType: armor.type,
  armorBaseAC: armor.baseAC,
  armorMaxDexBonus: armor.maxDexBonus,
  weight: armor.type === "light" ? 10 : armor.type === "medium" ? 20 : armor.type === "heavy" ? 45 : 6,
  description: armor.stealthDisadvantage ? "Помеха скрытности" : undefined,
}));

export const BASE_FOOD: BaseEquipmentItem[] = [
  { name: "Рацион (1 день)", category: "food", weight: 2, description: "Сухой паёк на один день", cost: "5 sp" },
  { name: "Вода (фляга)", category: "food", weight: 5, description: "1 галлон воды", cost: "2 cp" },
  { name: "Эль (кружка)", category: "food", weight: 1, description: "Обычный эль", cost: "4 cp" },
  { name: "Вино (бутылка)", category: "food", weight: 1.5, description: "Обычное вино", cost: "2 sp" },
  { name: "Хлеб", category: "food", weight: 0.5, description: "Буханка хлеба", cost: "2 cp" },
  { name: "Сыр", category: "food", weight: 0.5, description: "Кусок сыра", cost: "1 sp" },
  { name: "Мясо вяленое", category: "food", weight: 0.5, description: "Сушёное мясо", cost: "5 sp" },
];

export const BASE_POTIONS: BaseEquipmentItem[] = [
  { name: "Зелье лечения", category: "potion", weight: 0.5, description: "Восстанавливает 2d4+2 хитов", cost: "50 gp" },
  { name: "Зелье большого лечения", category: "potion", weight: 0.5, description: "Восстанавливает 4d4+4 хитов", cost: "150 gp" },
  { name: "Зелье превосходного лечения", category: "potion", weight: 0.5, description: "Восстанавливает 8d4+8 хитов", cost: "500 gp" },
  { name: "Зелье высшего лечения", category: "potion", weight: 0.5, description: "Восстанавливает 10d4+20 хитов", cost: "1500 gp" },
  { name: "Противоядие", category: "potion", weight: 0.5, description: "Снимает отравление", cost: "50 gp" },
  { name: "Зелье огненного дыхания", category: "potion", weight: 0.5, description: "Выдох огнём 4d6 урона", cost: "150 gp" },
  { name: "Зелье невидимости", category: "potion", weight: 0.5, description: "Невидимость на 1 час", cost: "180 gp" },
  { name: "Зелье полёта", category: "potion", weight: 0.5, description: "Скорость полёта 60 футов на 1 час", cost: "500 gp" },
  { name: "Зелье водного дыхания", category: "potion", weight: 0.5, description: "Дыхание под водой 1 час", cost: "180 gp" },
  { name: "Зелье героизма", category: "potion", weight: 0.5, description: "+10 временных хитов, благословение на 1 час", cost: "180 gp" },
];

export const BASE_TOOLS: BaseEquipmentItem[] = [
  { name: "Воровские инструменты", category: "tool", weight: 1, description: "Для взлома замков и обезвреживания ловушек", cost: "25 gp" },
  { name: "Инструменты кузнеца", category: "tool", weight: 8, description: "Для работы с металлом", cost: "20 gp" },
  { name: "Инструменты алхимика", category: "tool", weight: 8, description: "Для создания зелий и алхимических веществ", cost: "50 gp" },
  { name: "Инструменты травника", category: "tool", weight: 3, description: "Для сбора и использования трав", cost: "5 gp" },
  { name: "Набор целителя", category: "tool", weight: 3, description: "10 использований, стабилизация", cost: "5 gp" },
  { name: "Музыкальный инструмент", category: "tool", weight: 2, description: "Лютня, флейта или другой", cost: "20 gp" },
  { name: "Набор для маскировки", category: "tool", weight: 3, description: "Для изменения внешности", cost: "25 gp" },
  { name: "Набор отравителя", category: "tool", weight: 2, description: "Для создания и применения ядов", cost: "50 gp" },
  { name: "Игральный набор", category: "tool", weight: 0, description: "Кости или карты", cost: "1 sp" },
  { name: "Инструменты навигатора", category: "tool", weight: 2, description: "Для навигации по морю", cost: "25 gp" },
];

export const BASE_MISC: BaseEquipmentItem[] = [
  { name: "Верёвка (50 футов)", category: "misc", weight: 10, description: "Пеньковая верёвка", cost: "1 gp" },
  { name: "Факел", category: "misc", weight: 1, description: "Свет 20/40 футов, горит 1 час", cost: "1 cp" },
  { name: "Фонарь закрытый", category: "misc", weight: 2, description: "Свет 30/60 футов", cost: "5 gp" },
  { name: "Масло (фляга)", category: "misc", weight: 1, description: "Горит 6 часов или бросок 5 футов огня", cost: "1 sp" },
  { name: "Кремень и огниво", category: "misc", weight: 0, description: "Разжигание огня", cost: "5 sp" },
  { name: "Рюкзак", category: "misc", weight: 5, description: "Вместимость 1 кубический фут", cost: "2 gp" },
  { name: "Мешок", category: "misc", weight: 0.5, description: "Вместимость 30 фунтов", cost: "1 cp" },
  { name: "Одеяло", category: "misc", weight: 3, description: "Шерстяное одеяло", cost: "5 sp" },
  { name: "Спальный мешок", category: "misc", weight: 7, description: "Для сна на открытом воздухе", cost: "1 gp" },
  { name: "Палатка (2 человека)", category: "misc", weight: 20, description: "Укрытие на двоих", cost: "2 gp" },
  { name: "Ломик", category: "misc", weight: 5, description: "Преимущество на проверки Силы для взлома", cost: "2 gp" },
  { name: "Кандалы", category: "misc", weight: 6, description: "СЛ побега 20", cost: "2 gp" },
  { name: "Цепь (10 футов)", category: "misc", weight: 10, description: "Металлическая цепь", cost: "5 gp" },
  { name: "Зеркало стальное", category: "misc", weight: 0.5, description: "Маленькое стальное зеркало", cost: "5 gp" },
  { name: "Колокольчик", category: "misc", weight: 0, description: "Маленький колокольчик", cost: "1 gp" },
  { name: "Свеча", category: "misc", weight: 0, description: "Свет 5 футов, горит 1 час", cost: "1 cp" },
  { name: "Мел (1 кусок)", category: "misc", weight: 0, description: "Для пометок", cost: "1 cp" },
  { name: "Чернила (флакон)", category: "misc", weight: 0, description: "1 унция чернил", cost: "10 gp" },
  { name: "Перо для письма", category: "misc", weight: 0, description: "Гусиное перо", cost: "2 cp" },
  { name: "Бумага (лист)", category: "misc", weight: 0, description: "Один лист бумаги", cost: "2 sp" },
  { name: "Книга", category: "misc", weight: 5, description: "Пустая или с записями", cost: "25 gp" },
  { name: "Колчан", category: "misc", weight: 1, description: "Вмещает 20 стрел", cost: "1 gp" },
  { name: "Стрелы (20)", category: "misc", weight: 1, description: "Боеприпасы для лука", cost: "1 gp" },
  { name: "Болты (20)", category: "misc", weight: 1.5, description: "Боеприпасы для арбалета", cost: "1 gp" },
  { name: "Святой символ", category: "misc", weight: 0, description: "Божественная фокусировка", cost: "5 gp" },
  { name: "Компонентный мешочек", category: "misc", weight: 2, description: "Магические компоненты", cost: "25 gp" },
  { name: "Магическая фокусировка", category: "misc", weight: 1, description: "Жезл, посох или шар", cost: "10 gp" },
];

// Unified catalog of all base items
export const ALL_BASE_EQUIPMENT: BaseEquipmentItem[] = [
  ...BASE_WEAPONS,
  ...BASE_ARMOR,
  ...BASE_FOOD,
  ...BASE_POTIONS,
  ...BASE_TOOLS,
  ...BASE_MISC,
];

// Helper to convert base item to equipment
export function createEquipmentFromBase(baseItem: BaseEquipmentItem, quantity: number = 1): Omit<Equipment, "id"> {
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

export const WEAPON_ABILITY_MODS = ["str", "dex"] as const;
export type WeaponAbilityMod = typeof WEAPON_ABILITY_MODS[number];

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
  category: z.enum(["weapon", "armor", "food", "potion", "tool", "misc", "trash"]).default("misc"),
  // Armor properties
  isArmor: z.boolean().optional(),
  armorType: z.enum(["none", "light", "medium", "heavy", "shield"]).optional(),
  armorBaseAC: z.number().optional(),
  armorMaxDexBonus: z.number().nullable().optional(),
  // Weapon properties
  isWeapon: z.boolean().optional(),
  damage: z.string().optional(),
  damageType: z.string().optional(),
  weaponProperties: z.string().optional(),
  attackBonus: z.number().optional(),
  abilityMod: z.enum(["str", "dex"]).optional(),
  isFinesse: z.boolean().optional(),
  // Equipped state
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
  money: moneySchema.default({ cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }),
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

export function calculateMaxHp(className: string, level: number, conModifier: number): number {
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

export const DEFAULT_SKILLS_PROFICIENCY: Record<string, SkillProficiency> = Object.fromEntries(
  SKILLS.map(skill => [skill.name, { proficient: false, expertise: false }])
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
    maxHp: defaultMaxHp,
    currentHp: defaultMaxHp,
    tempHp: 0,
    hitDice: `1${classData.hitDice}`,
    hitDiceRemaining: 1,
    deathSaves: { successes: 0, failures: 0 },
    weapons: [],
    features: [],
    equipment: [],
    money: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
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
