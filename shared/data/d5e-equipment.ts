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

export const EQUIPMENT_CATEGORIES = [
  "weapon", "armor", "food", "potion", "tool", "misc"
] as const;

export type EquipmentCategory = typeof EQUIPMENT_CATEGORIES[number];

export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  weapon: "Оружие",
  armor: "Доспехи",
  food: "Провиант",
  potion: "Зелья",
  tool: "Инструменты",
  misc: "Прочее",
};

export interface BaseEquipmentItem {
  name: string;
  category: EquipmentCategory;
  weight?: number;
  description?: string;
  cost?: string;
  isWeapon?: boolean;
  damage?: string;
  damageType?: string;
  weaponProperties?: string;
  weaponType?: "melee" | "ranged";
  abilityMod?: "str" | "dex";
  isFinesse?: boolean;
  isArmor?: boolean;
  armorType?: ArmorType;
  armorBaseAC?: number;
  armorMaxDexBonus?: number | null;
}

export const BASE_WEAPONS: BaseEquipmentItem[] = [
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
  { name: "Лёгкий арбалет", category: "weapon", isWeapon: true, damage: "1d8", damageType: "колющий", weaponProperties: "боеприпасы, двуручное, перезарядка", weight: 5, weaponType: "ranged", abilityMod: "dex", cost: "25 gp" },
  { name: "Дротик", category: "weapon", isWeapon: true, damage: "1d4", damageType: "колющий", weaponProperties: "метательное, фехтовальное", weight: 0.25, weaponType: "ranged", abilityMod: "dex", isFinesse: true, cost: "5 cp" },
  { name: "Короткий лук", category: "weapon", isWeapon: true, damage: "1d6", damageType: "колющий", weaponProperties: "боеприпасы, двуручное", weight: 2, weaponType: "ranged", abilityMod: "dex", cost: "25 gp" },
  { name: "Праща", category: "weapon", isWeapon: true, damage: "1d4", damageType: "дробящий", weaponProperties: "боеприпасы", weight: 0, weaponType: "ranged", abilityMod: "dex", cost: "1 sp" },
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
  { name: "Длинный лук", category: "weapon", isWeapon: true, damage: "1d8", damageType: "колющий", weaponProperties: "боеприпасы, тяжёлое, двуручное", weight: 2, weaponType: "ranged", abilityMod: "dex", cost: "50 gp" },
  { name: "Ручной арбалет", category: "weapon", isWeapon: true, damage: "1d6", damageType: "колющий", weaponProperties: "боеприпасы, лёгкое, перезарядка", weight: 3, weaponType: "ranged", abilityMod: "dex", cost: "75 gp" },
  { name: "Тяжёлый арбалет", category: "weapon", isWeapon: true, damage: "1d10", damageType: "колющий", weaponProperties: "боеприпасы, тяжёлое, двуручное, перезарядка", weight: 18, weaponType: "ranged", abilityMod: "dex", cost: "50 gp" },
  { name: "Боевая кирка", category: "weapon", isWeapon: true, damage: "1d8", damageType: "колющий", weight: 2, weaponType: "melee", abilityMod: "str", cost: "5 gp" },
  { name: "Рыцарское копьё", category: "weapon", isWeapon: true, damage: "1d12", damageType: "колющий", weaponProperties: "досягаемость, специальное", weight: 6, weaponType: "melee", abilityMod: "str", cost: "10 gp" },
];

export const BASE_ARMOR: BaseEquipmentItem[] = ARMOR_LIST.filter(a => a.type !== "none").map(armor => ({
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

export const ALL_BASE_EQUIPMENT: BaseEquipmentItem[] = [
  ...BASE_WEAPONS,
  ...BASE_ARMOR,
  ...BASE_FOOD,
  ...BASE_POTIONS,
  ...BASE_TOOLS,
  ...BASE_MISC,
];
