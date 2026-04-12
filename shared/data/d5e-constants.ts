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
  { name: "Акробатика",        ability: "DEX" as AbilityName, description: "Сальто, баланс, трюки. Устоять на скользкой поверхности или выполнить акробатический манёвр." },
  { name: "Анализ",            ability: "INT" as AbilityName, description: "Дедуктивное мышление, поиск улик. Вспомнить важную деталь, решить головоломку, понять механизм." },
  { name: "Атлетика",          ability: "STR" as AbilityName, description: "Лазание, прыжки, плавание, борьба. Физические действия, требующие силы и выносливости." },
  { name: "Восприятие",        ability: "WIS" as AbilityName, description: "Заметить скрытого врага, услышать шорох, найти спрятанный предмет. Один из самых используемых навыков." },
  { name: "Выживание",         ability: "WIS" as AbilityName, description: "Ориентирование, поиск следов, охота, предсказание погоды. Жизнь в дикой природе." },
  { name: "Выступление",       ability: "CHA" as AbilityName, description: "Музыка, стихи, танец, театр. Развлечь аудиторию или произвести художественное впечатление." },
  { name: "Запугивание",       ability: "CHA" as AbilityName, description: "Угрозы, агрессивное давление. Заставить кого-то подчиниться через страх." },
  { name: "История",           ability: "INT" as AbilityName, description: "Знание событий прошлого, легенд, правителей. Узнать происхождение артефакта или царства." },
  { name: "Ловкость рук",      ability: "DEX" as AbilityName, description: "Карманные кражи, фокусы, скрытное манипулирование предметами." },
  { name: "Магия",             ability: "INT" as AbilityName, description: "Знание заклинаний, магических существ и явлений. Определить заклинание или магический предмет." },
  { name: "Медицина",          ability: "WIS" as AbilityName, description: "Стабилизировать умирающего, диагностировать болезнь, оказать первую помощь." },
  { name: "Обман",             ability: "CHA" as AbilityName, description: "Ложь, маскировка намерений, двусмысленная речь. Убедить, не раскрывая правды." },
  { name: "Природа",           ability: "INT" as AbilityName, description: "Знание флоры, фауны, погоды, географии. Определить существо или растение." },
  { name: "Проницательность",  ability: "WIS" as AbilityName, description: "Понять намерения собеседника, раскрыть ложь, почувствовать настроение. Интуиция о людях." },
  { name: "Религия",           ability: "INT" as AbilityName, description: "Знание богов, ритуалов, культов, символов. Распознать религиозный символ или обряд." },
  { name: "Скрытность",        ability: "DEX" as AbilityName, description: "Двигаться незаметно, прятаться в тени. Противником проверяется Восприятием." },
  { name: "Убеждение",         ability: "CHA" as AbilityName, description: "Честное влияние, переговоры, дипломатия. Изменить мнение без угроз и лжи." },
  { name: "Уход за животными", ability: "WIS" as AbilityName, description: "Успокоить, приручить или управлять животными. Не работает на чудовищ и нежить." },
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

export const PROFICIENCY_CATEGORIES = ["languages", "weapons", "armor", "tools"] as const;
export type ProficiencyCategory = typeof PROFICIENCY_CATEGORIES[number];

export const PROFICIENCY_CATEGORY_LABELS: Record<ProficiencyCategory, string> = {
  languages: "Языки",
  weapons: "Оружие",
  armor: "Доспехи",
  tools: "Инструменты",
};

export const LANGUAGES = [
  "Общий", "Дварфийский", "Эльфийский", "Великаний", "Гномий", 
  "Гоблинский", "Полуросликов", "Орочий", "Драконий", "Бездны",
  "Небесный", "Глубинная речь", "Инфернальный", "Первичный",
  "Сильван", "Подземный", "Воровской жаргон", "Друидический"
] as const;

export const SIMPLE_WEAPONS = [
  "Боевой посох", "Булава", "Дубинка", "Кинжал", "Копьё",
  "Лёгкий молот", "Метательное копьё", "Ручной топор", "Серп", "Палица",
  "Лёгкий арбалет", "Дротик", "Короткий лук", "Праща"
] as const;

export const MARTIAL_WEAPONS = [
  "Длинный меч", "Короткий меч", "Рапира", "Скимитар",
  "Боевой топор", "Боевой молот", "Моргенштерн", "Цеп",
  "Секира", "Двуручный меч", "Глефа", "Алебарда", "Пика", "Молот",
  "Кнут", "Трезубец", "Длинный лук", "Ручной арбалет", "Тяжёлый арбалет",
  "Боевая кирка", "Рыцарское копьё"
] as const;

export const WEAPON_PROFICIENCIES = [
  "Простое оружие",
  ...SIMPLE_WEAPONS,
  "Воинское оружие",
  ...MARTIAL_WEAPONS,
] as const;

export const WEAPON_PROPERTIES = [
  "Двуручное",
  "Лёгкое",
  "Метательное",
  "Тяжёлое",
  "Универсальное",
  "Фехтовальное",
  "Боеприпасы",
  "Перезарядка",
  "Досягаемость",
  "Специальное",
] as const;

export type WeaponProperty = typeof WEAPON_PROPERTIES[number];

export const ARMOR_PROFICIENCIES = [
  "Лёгкие доспехи", "Средние доспехи", "Тяжёлые доспехи", "Щиты"
] as const;

export const TOOL_PROFICIENCIES = [
  "Инструменты алхимика", "Инструменты пивовара", "Инструменты каллиграфа",
  "Инструменты плотника", "Инструменты картографа", "Инструменты сапожника",
  "Инструменты повара", "Инструменты стеклодува", "Инструменты ювелира",
  "Инструменты кожевника", "Инструменты каменщика", "Инструменты художника",
  "Инструменты гончара", "Инструменты кузнеца", "Инструменты лудильщика",
  "Инструменты ткача", "Инструменты резчика по дереву",
  "Игральные кости", "Карточный набор", "Набор для драконьих шахмат",
  "Набор три-дракона",
  "Волынка", "Барабан", "Дульцимер", "Флейта", "Лютня",
  "Лира", "Рожок", "Свирель", "Шалмей", "Виола",
  "Набор для маскировки", "Набор фальсификатора", "Набор травника",
  "Инструменты навигатора", "Набор отравителя", "Воровские инструменты",
  "Транспорт (наземный)", "Транспорт (водный)"
] as const;
