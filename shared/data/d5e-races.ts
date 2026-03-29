import type { AbilityName } from "./d5e-constants";

export interface RaceData {
  name: string;
  abilityBonuses: Partial<Record<AbilityName, number>>;
  speed: number;
  description: string;
  traits: string[];
  languages: string[];
  darkvision?: number;
  weaponProficiencies?: string[];
  armorProficiencies?: string[];
  toolProficiencies?: string[];
  subraces?: Record<string, { 
    name: string; 
    abilityBonuses: Partial<Record<AbilityName, number>>; 
    description?: string;
    darkvision?: number;
    weaponProficiencies?: string[];
    armorProficiencies?: string[];
    toolProficiencies?: string[];
  }>;
}

export const RACE_DATA: Record<string, RaceData> = {
  "Человек": {
    name: "Человек",
    abilityBonuses: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
    speed: 30,
    description: "Самая распространённая и адаптивная раса. Люди амбициозны и разнообразны во всём.",
    traits: ["Универсальность (+1 ко всем характеристикам)"],
    languages: ["Общий", "Один на выбор"],
  },
  "Эльф": {
    name: "Эльф",
    abilityBonuses: { DEX: 2 },
    speed: 30,
    darkvision: 60,
    description: "Изящные и долгоживущие существа с острыми чувствами и врождённой связью с магией.",
    traits: ["Тёмное зрение (60 фт.)", "Наследие фей", "Транс (4 часа вместо сна)", "Восприятие"],
    languages: ["Общий", "Эльфийский"],
    weaponProficiencies: ["Длинные мечи", "Короткие мечи", "Длинные луки", "Короткие луки"],
    subraces: {
      "Высший эльф": { name: "Высший эльф", abilityBonuses: { INT: 1 }, description: "Мастера магии, знают дополнительный заговор." },
      "Лесной эльф": { name: "Лесной эльф", abilityBonuses: { WIS: 1 }, description: "Быстрые и скрытные, скорость 35 фт." },
      "Тёмный эльф": { 
        name: "Тёмный эльф", 
        abilityBonuses: { CHA: 1 }, 
        description: "Дроу, владеют тёмной магией.",
        darkvision: 120,
        weaponProficiencies: ["Рапиры", "Короткие мечи", "Ручные арбалеты"]
      },
    },
  },
  "Дварф": {
    name: "Дварф",
    abilityBonuses: { CON: 2 },
    speed: 25,
    darkvision: 60,
    description: "Крепкие и выносливые подгорные жители, известные мастерством в кузнечном деле.",
    traits: ["Тёмное зрение (60 фт.)", "Устойчивость к яду", "Владение боевыми топорами и молотами", "Знание камня"],
    languages: ["Общий", "Дварфский"],
    weaponProficiencies: ["Боевой топор", "Ручной топор", "Лёгкий молот", "Боевой молот"],
    toolProficiencies: ["Инструменты кузнеца", "Инструменты пивовара", "Инструменты каменщика"],
    subraces: {
      "Горный дварф": { 
        name: "Горный дварф", 
        abilityBonuses: { STR: 2 }, 
        description: "Сильные воины, владеют лёгкими и средними доспехами.",
        armorProficiencies: ["Лёгкие доспехи", "Средние доспехи"]
      },
      "Холмовой дварф": { name: "Холмовой дварф", abilityBonuses: { WIS: 1 }, description: "Мудрые и выносливые, +1 HP за уровень." },
    },
  },
  "Полурослик": {
    name: "Полурослик",
    abilityBonuses: { DEX: 2 },
    speed: 25,
    description: "Маленький и удачливый народ, известный храбростью и добротой.",
    traits: ["Везучий (перебрось 1 на d20)", "Храбрый (преимущество против испуга)", "Проворство (проходить через существ крупнее)"],
    languages: ["Общий", "Полуросликов"],
    subraces: {
      "Легконогий": { name: "Легконогий", abilityBonuses: { CHA: 1 }, description: "Естественная скрытность, прячутся за существами крупнее." },
      "Коренастый": { name: "Коренастый", abilityBonuses: { CON: 1 }, description: "Устойчивость к яду, преимущество против отравления." },
    },
  },
  "Драконорождённый": {
    name: "Драконорождённый",
    abilityBonuses: { STR: 2, CHA: 1 },
    speed: 30,
    description: "Гордые потомки драконов с чешуйчатой кожей и драконьим дыханием.",
    traits: ["Драконье наследие (выбор типа урона)", "Дыхание дракона (2d6, увеличивается с уровнем)", "Сопротивление урону"],
    languages: ["Общий", "Драконий"],
  },
  "Гном": {
    name: "Гном",
    abilityBonuses: { INT: 2 },
    speed: 25,
    darkvision: 60,
    description: "Маленькие изобретательные существа с острым умом и любовью к иллюзиям.",
    traits: ["Тёмное зрение (60 фт.)", "Гномья хитрость (преимущество против магии)"],
    languages: ["Общий", "Гномий"],
    subraces: {
      "Лесной гном": { name: "Лесной гном", abilityBonuses: { DEX: 1 }, description: "Знают Малую иллюзию, говорят с мелкими зверями." },
      "Скальный гном": { name: "Скальный гном", abilityBonuses: { CON: 1 }, description: "Знание ремёсел, создают механические устройства." },
    },
  },
  "Полуэльф": {
    name: "Полуэльф",
    abilityBonuses: { CHA: 2 },
    speed: 30,
    darkvision: 60,
    description: "Дети двух миров, сочетающие людскую адаптивность с эльфийской грацией.",
    traits: ["Тёмное зрение (60 фт.)", "Наследие фей", "+1 к двум характеристикам на выбор", "Два навыка на выбор"],
    languages: ["Общий", "Эльфийский", "Один на выбор"],
  },
  "Полуорк": {
    name: "Полуорк",
    abilityBonuses: { STR: 2, CON: 1 },
    speed: 30,
    darkvision: 60,
    description: "Сильные воины с орочьей кровью, известные выносливостью и свирепостью.",
    traits: ["Тёмное зрение (60 фт.)", "Неукротимая выносливость (1 HP вместо 0)", "Свирепый критический удар (+1 кубик)"],
    languages: ["Общий", "Орочий"],
  },
  "Тифлинг": {
    name: "Тифлинг",
    abilityBonuses: { INT: 1, CHA: 2 },
    speed: 30,
    darkvision: 60,
    description: "Потомки демонов с рогами, хвостами и врождённой инфернальной магией.",
    traits: ["Тёмное зрение (60 фт.)", "Сопротивление огню", "Инфернальное наследие (заклинания)"],
    languages: ["Общий", "Инфернальный"],
  },
  "Аасимар": {
    name: "Аасимар",
    abilityBonuses: { CHA: 2 },
    speed: 30,
    darkvision: 60,
    description: "Благословлённые небесами существа с ангельской кровью и способностью исцелять.",
    traits: ["Тёмное зрение (60 фт.)", "Небесное сопротивление (некротика и сияние)", "Исцеляющие руки"],
    languages: ["Общий", "Небесный"],
    subraces: {
      "Защитник": { name: "Защитник", abilityBonuses: { WIS: 1 }, description: "Небесное сияние, светящиеся крылья." },
      "Каратель": { name: "Каратель", abilityBonuses: { CON: 1 }, description: "Пылающая душа, сияющие глаза." },
      "Падший": { name: "Падший", abilityBonuses: { STR: 1 }, description: "Некротическая аура, костяные крылья." },
    },
  },
};

export const RACES = Object.keys(RACE_DATA) as (keyof typeof RACE_DATA)[];
