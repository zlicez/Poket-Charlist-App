import type { AbilityName } from "./d5e-constants";

export interface ClassData {
  name: string;
  hitDice: string;
  hitDiceValue: number;
  savingThrows: AbilityName[];
  description: string;
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
}

export const CLASS_DATA: Record<string, ClassData> = {
  "Бард": { 
    name: "Бард", 
    hitDice: "d8", 
    hitDiceValue: 8, 
    savingThrows: ["DEX", "CHA"],
    description: "Музыкант и заклинатель, черпающий магию из песен и историй. Мастер вдохновения и поддержки союзников.",
    armorProficiencies: ["Лёгкие доспехи"],
    weaponProficiencies: ["Простое оружие", "Ручные арбалеты", "Длинные мечи", "Рапиры", "Короткие мечи"],
    toolProficiencies: ["Три музыкальных инструмента"]
  },
  "Варвар": { 
    name: "Варвар", 
    hitDice: "d12", 
    hitDiceValue: 12, 
    savingThrows: ["STR", "CON"],
    description: "Свирепый воин первобытной ярости. Входит в неистовство в бою, получая невероятную силу и выносливость.",
    armorProficiencies: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
    weaponProficiencies: ["Простое оружие", "Воинское оружие"],
    toolProficiencies: []
  },
  "Воин": { 
    name: "Воин", 
    hitDice: "d10", 
    hitDiceValue: 10, 
    savingThrows: ["STR", "CON"],
    description: "Мастер боевых искусств, владеющий любым оружием и доспехами. Универсальный и надёжный боец.",
    armorProficiencies: ["Все доспехи", "Щиты"],
    weaponProficiencies: ["Простое оружие", "Воинское оружие"],
    toolProficiencies: []
  },
  "Волшебник": { 
    name: "Волшебник", 
    hitDice: "d6", 
    hitDiceValue: 6, 
    savingThrows: ["INT", "WIS"],
    description: "Учёный заклинатель, черпающий магию из книг и исследований. Обладает широчайшим арсеналом заклинаний.",
    armorProficiencies: [],
    weaponProficiencies: ["Кинжалы", "Дротики", "Пращи", "Боевые посохи", "Лёгкие арбалеты"],
    toolProficiencies: []
  },
  "Друид": { 
    name: "Друид", 
    hitDice: "d8", 
    hitDiceValue: 8, 
    savingThrows: ["INT", "WIS"],
    description: "Жрец природы, способный превращаться в зверей и повелевать стихиями. Защитник дикой природы.",
    armorProficiencies: ["Лёгкие доспехи", "Средние доспехи", "Щиты (не металл)"],
    weaponProficiencies: ["Дубинки", "Кинжалы", "Дротики", "Метательные копья", "Булавы", "Боевые посохи", "Скимитары", "Серпы", "Пращи", "Копья"],
    toolProficiencies: ["Набор травника"]
  },
  "Жрец": { 
    name: "Жрец", 
    hitDice: "d8", 
    hitDiceValue: 8, 
    savingThrows: ["WIS", "CHA"],
    description: "Божественный заклинатель, получающий силу от своего божества. Целитель и защитник веры.",
    armorProficiencies: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
    weaponProficiencies: ["Простое оружие"],
    toolProficiencies: []
  },
  "Изобретатель": { 
    name: "Изобретатель", 
    hitDice: "d8", 
    hitDiceValue: 8, 
    savingThrows: ["CON", "INT"],
    description: "Мастер магических устройств и алхимии. Создаёт волшебные предметы и усиливает снаряжение.",
    armorProficiencies: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
    weaponProficiencies: ["Простое оружие"],
    toolProficiencies: ["Воровские инструменты", "Инструменты ремесленника"]
  },
  "Колдун": { 
    name: "Колдун", 
    hitDice: "d8", 
    hitDiceValue: 8, 
    savingThrows: ["WIS", "CHA"],
    description: "Заклинатель, заключивший договор с могущественной сущностью. Получает уникальные способности от покровителя.",
    armorProficiencies: ["Лёгкие доспехи"],
    weaponProficiencies: ["Простое оружие"],
    toolProficiencies: []
  },
  "Монах": { 
    name: "Монах", 
    hitDice: "d8", 
    hitDiceValue: 8, 
    savingThrows: ["STR", "DEX"],
    description: "Мастер боевых искусств, использующий внутреннюю энергию ци. Быстрый и смертоносный без оружия.",
    armorProficiencies: [],
    weaponProficiencies: ["Простое оружие", "Короткие мечи"],
    toolProficiencies: ["Один инструмент или музыкальный инструмент"]
  },
  "Паладин": { 
    name: "Паладин", 
    hitDice: "d10", 
    hitDiceValue: 10, 
    savingThrows: ["WIS", "CHA"],
    description: "Святой воин, связанный священной клятвой. Сочетает боевое мастерство с божественной магией.",
    armorProficiencies: ["Все доспехи", "Щиты"],
    weaponProficiencies: ["Простое оружие", "Воинское оружие"],
    toolProficiencies: []
  },
  "Плут": { 
    name: "Плут", 
    hitDice: "d8", 
    hitDiceValue: 8, 
    savingThrows: ["DEX", "INT"],
    description: "Мастер скрытности, ловкости и хитрости. Наносит смертельные удары из засады.",
    armorProficiencies: ["Лёгкие доспехи"],
    weaponProficiencies: ["Простое оружие", "Ручные арбалеты", "Длинные мечи", "Рапиры", "Короткие мечи"],
    toolProficiencies: ["Воровские инструменты"]
  },
  "Следопыт": { 
    name: "Следопыт", 
    hitDice: "d10", 
    hitDiceValue: 10, 
    savingThrows: ["STR", "DEX"],
    description: "Охотник и следопыт диких земель. Мастер выслеживания и борьбы с избранными врагами.",
    armorProficiencies: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
    weaponProficiencies: ["Простое оружие", "Воинское оружие"],
    toolProficiencies: []
  },
  "Чародей": { 
    name: "Чародей", 
    hitDice: "d6", 
    hitDiceValue: 6, 
    savingThrows: ["CON", "CHA"],
    description: "Заклинатель с врождённой магией в крови. Способен изменять заклинания метамагией.",
    armorProficiencies: [],
    weaponProficiencies: ["Кинжалы", "Дротики", "Пращи", "Боевые посохи", "Лёгкие арбалеты"],
    toolProficiencies: []
  },
};

export const CLASSES = Object.keys(CLASS_DATA) as (keyof typeof CLASS_DATA)[];
