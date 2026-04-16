/**
 * D&D 5e Race Definitions — PHB core races
 *
 * Структура: canonical RaceDefinition с enriched полями (source, entityType, size,
 * creatureType, resistances, spellGrants, subrace.speed и т.д.).
 *
 * Backward compat:
 *   - тип `RaceData` = alias для `RaceDefinition`
 *   - `RACE_DATA` — Record<string, RaceDefinition> с теми же строковыми ключами
 *   - `RACES` — array ключей (как прежде)
 *   - все функции-потребители (getRacialBonuses и др.) работают без изменений
 */

import type { RaceDefinition } from "./race-types";

// Re-export types for consumers who import from this file
export type {
  RaceDefinition,
  RaceData,           // backward compat alias
  RaceAbilityBonusPattern,
  RaceAbilityBonusSelection,
  SubraceDefinition,
  RaceSpellGrant,
  RaceTraitEffect,
  RaceTrait,
  RaceSkillChoice,
  RaceSourceCode,
  RaceEntityType,
  RaceSize,
  DamageType,
} from "./race-types";

// ─── PHB core races ───────────────────────────────────────────────────────────

const PHB_RACES: Record<string, RaceDefinition> = {
  "Человек": {
    id: "human",
    name: "Человек",
    source: "PHB",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
    speed: 30,
    description: "Самая распространённая и адаптивная раса. Люди амбициозны и разнообразны во всём.",
    traits: ["Универсальность (+1 ко всем характеристикам)"],
    languages: ["Общий", "Один на выбор"],
    skillChoices: { count: 0, options: "any" },
  },

  "Эльф": {
    id: "elf",
    name: "Эльф",
    source: "PHB",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: { DEX: 2 },
    speed: 30,
    darkvision: 60,
    description: "Изящные и долгоживущие существа с острыми чувствами и врождённой связью с магией.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Наследие фей",
      "Транс (4 часа вместо сна)",
      "Восприятие",
    ],
    languages: ["Общий", "Эльфийский"],
    skillProficiencies: ["Восприятие"],
    weaponProficiencies: ["Длинные мечи", "Короткие мечи", "Длинные луки", "Короткие луки"],
    subraces: {
      "Высший эльф": {
        id: "elf-high",
        name: "Высший эльф",
        abilityBonuses: { INT: 1 },
        description: "Мастера магии, знают дополнительный заговор.",
      },
      "Лесной эльф": {
        id: "elf-wood",
        name: "Лесной эльф",
        abilityBonuses: { WIS: 1 },
        description: "Быстрые и скрытные, скорость 35 фт.",
        speed: 35,
      },
      "Тёмный эльф": {
        id: "elf-drow",
        name: "Тёмный эльф",
        abilityBonuses: { CHA: 1 },
        description: "Дроу, владеют тёмной магией.",
        darkvision: 120,
        weaponProficiencies: ["Рапиры", "Короткие мечи", "Ручные арбалеты"],
        spellGrants: [
          { spellName: "Свет", minLevel: 0, ability: "CHA" },
          { spellName: "Ядовитые брызги", minLevel: 3, ability: "CHA", usesLongRest: true },
          { spellName: "Паутина", minLevel: 5, ability: "CHA", usesLongRest: true },
        ],
        resistances: [],
      },
    },
  },

  "Дварф": {
    id: "dwarf",
    name: "Дварф",
    source: "PHB",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: { CON: 2 },
    speed: 25,
    darkvision: 60,
    description: "Крепкие и выносливые подгорные жители, известные мастерством в кузнечном деле.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Устойчивость к яду (преимущество на спасброски, сопротивление урону)",
      "Владение боевыми топорами и молотами",
      "Знание камня",
    ],
    languages: ["Общий", "Дварфский"],
    resistances: ["poison"],
    weaponProficiencies: ["Боевой топор", "Ручной топор", "Лёгкий молот", "Боевой молот"],
    toolProficiencies: ["Инструменты кузнеца", "Инструменты пивовара", "Инструменты каменщика"],
    subraces: {
      "Горный дварф": {
        id: "dwarf-mountain",
        name: "Горный дварф",
        abilityBonuses: { STR: 2 },
        description: "Сильные воины, владеют лёгкими и средними доспехами.",
        armorProficiencies: ["Лёгкие доспехи", "Средние доспехи"],
      },
      "Холмовой дварф": {
        id: "dwarf-hill",
        name: "Холмовой дварф",
        abilityBonuses: { WIS: 1 },
        description: "Мудрые и выносливые, +1 HP за уровень.",
      },
    },
  },

  "Полурослик": {
    id: "halfling",
    name: "Полурослик",
    source: "PHB",
    entityType: "race",
    size: "Small",
    creatureType: "Гуманоид",
    abilityBonuses: { DEX: 2 },
    speed: 25,
    description: "Маленький и удачливый народ, известный храбростью и добротой.",
    traits: [
      "Везучий (перебрось 1 на d20)",
      "Храбрый (преимущество против испуга)",
      "Проворство (проходить через существ крупнее)",
    ],
    languages: ["Общий", "Полуросликов"],
    subraces: {
      "Легконогий": {
        id: "halfling-lightfoot",
        name: "Легконогий",
        abilityBonuses: { CHA: 1 },
        description: "Естественная скрытность, прячутся за существами крупнее.",
      },
      "Коренастый": {
        id: "halfling-stout",
        name: "Коренастый",
        abilityBonuses: { CON: 1 },
        description: "Устойчивость к яду, преимущество против отравления.",
        resistances: ["poison"],
      },
    },
  },

  "Драконорождённый": {
    id: "dragonborn",
    name: "Драконорождённый",
    source: "PHB",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: { STR: 2, CHA: 1 },
    speed: 30,
    description: "Гордые потомки драконов с чешуйчатой кожей и драконьим дыханием.",
    traits: [
      "Драконье наследие (выбор типа урона)",
      "Дыхание дракона (2d6, увеличивается с уровнем)",
      "Сопротивление урону выбранного типа",
    ],
    languages: ["Общий", "Драконий"],
    // Сопротивление зависит от выбора игрока — хранится в raceSelections["dragon-ancestry"]
    // resistances: не задаётся глобально, вычисляется через raceSelections
  },

  "Гном": {
    id: "gnome",
    name: "Гном",
    source: "PHB",
    entityType: "race",
    size: "Small",
    creatureType: "Гуманоид",
    abilityBonuses: { INT: 2 },
    speed: 25,
    darkvision: 60,
    description: "Маленькие изобретательные существа с острым умом и любовью к иллюзиям.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Гномья хитрость (преимущество против магии по INT/WIS/CHA)",
    ],
    languages: ["Общий", "Гномий"],
    subraces: {
      "Лесной гном": {
        id: "gnome-forest",
        name: "Лесной гном",
        abilityBonuses: { DEX: 1 },
        description: "Знают Малую иллюзию, говорят с мелкими зверями.",
        spellGrants: [
          { spellName: "Малая иллюзия", minLevel: 0, ability: "INT" },
        ],
      },
      "Скальный гном": {
        id: "gnome-rock",
        name: "Скальный гном",
        abilityBonuses: { CON: 1 },
        description: "Знание ремёсел, создают механические устройства.",
        toolProficiencies: ["Инструменты ремесленника (один на выбор)"],
      },
    },
  },

  "Полуэльф": {
    id: "half-elf",
    name: "Полуэльф",
    source: "PHB",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: { CHA: 2 },
    speed: 30,
    darkvision: 60,
    description: "Дети двух миров, сочетающие людскую адаптивность с эльфийской грацией.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Наследие фей",
      "+2 к CHA и +1 к двум другим характеристикам на выбор",
      "Два навыка на выбор",
    ],
    languages: ["Общий", "Эльфийский", "Один на выбор"],
    skillChoices: { count: 2, options: "any" },
    // +1 к двум характеристикам — хранится в raceSelections["half-elf-asi"]
    // abilityBonusSelection не задаётся, т.к. +1/+1 идут как free ASI, а не racial bonus pattern
  },

  "Полуорк": {
    id: "half-orc",
    name: "Полуорк",
    source: "PHB",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: { STR: 2, CON: 1 },
    speed: 30,
    darkvision: 60,
    description: "Сильные воины с орочьей кровью, известные выносливостью и свирепостью.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Неукротимая выносливость (1 HP вместо 0, 1 раз в день)",
      "Свирепый критический удар (+1 кубик урона при крите)",
    ],
    languages: ["Общий", "Орочий"],
    skillProficiencies: ["Запугивание"],
  },

  "Тифлинг": {
    id: "tiefling",
    name: "Тифлинг",
    source: "PHB",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: { INT: 1, CHA: 2 },
    speed: 30,
    darkvision: 60,
    description: "Потомки демонов с рогами, хвостами и врождённой инфернальной магией.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Сопротивление огню",
      "Инфернальное наследие (Тауматургия → Адское возмездие → Тьма)",
    ],
    languages: ["Общий", "Инфернальный"],
    resistances: ["fire"],
    spellGrants: [
      { spellName: "Тауматургия", minLevel: 0, ability: "CHA" },
      { spellName: "Адское возмездие", minLevel: 3, ability: "CHA", usesLongRest: true },
      { spellName: "Тьма", minLevel: 5, ability: "CHA", usesLongRest: true },
    ],
  },

  "Аасимар": {
    id: "aasimar",
    name: "Аасимар",
    source: "VGM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: { CHA: 2 },
    speed: 30,
    darkvision: 60,
    description: "Благословлённые небесами существа с ангельской кровью и способностью исцелять.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Небесное сопротивление (некротика и сияние)",
      "Исцеляющие руки (1 раз в день)",
      "Несущий свет (Свет как заговор)",
    ],
    languages: ["Общий", "Небесный"],
    resistances: ["necrotic", "radiant"],
    spellGrants: [
      { spellName: "Свет", minLevel: 0, ability: "CHA" },
    ],
    subraces: {
      "Защитник": {
        id: "aasimar-protector",
        name: "Защитник",
        abilityBonuses: { WIS: 1 },
        description: "Небесное сияние, светящиеся крылья.",
      },
      "Каратель": {
        id: "aasimar-scourge",
        name: "Каратель",
        abilityBonuses: { CON: 1 },
        description: "Пылающая душа, сияющие глаза.",
      },
      "Падший": {
        id: "aasimar-fallen",
        name: "Падший",
        abilityBonuses: { STR: 1 },
        description: "Некротическая аура, костяные крылья.",
      },
    },
  },

  "Дампир": {
    id: "dhampir",
    name: "Дампир",
    source: "VRGtR",
    entityType: "lineage",
    size: "Medium",
    creatureType: "Нежить (Гуманоид)",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 35,
    darkvision: 60,
    description:
      "Полуживые потомки вампирского проклятия, сочетающие человеческую волю с хищной жаждой крови.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Бездыханная природа: не нужно дышать",
      "Паучье лазание: с 3 уровня можете ходить по стенам и потолку с свободными руками",
      "Укус вампира: естественное оружие, использующее Телосложение",
      "Наследие предков: при замене прежней расы сохраняете её навыки и скорости лазания, полёта или плавания",
    ],
    languages: ["Общий", "Один на выбор"],
    altSpeeds: { climb: 35 },
  },
};

// ─── Supplemental races (VGM / MTF / MPMM / OGA / FTD) ───────────────────────
// Импортируются из отдельного файла и объединяются ниже
import { SUPPLEMENT_RACES } from "./d5e-races-supplements";

// ─── Combined race registry ───────────────────────────────────────────────────

export const RACE_DATA: Record<string, RaceDefinition> = {
  ...PHB_RACES,
  ...SUPPLEMENT_RACES,
};

/** Список всех доступных рас (отображаемые имена = ключи RACE_DATA) */
export const RACES = Object.keys(RACE_DATA) as (keyof typeof RACE_DATA)[];
