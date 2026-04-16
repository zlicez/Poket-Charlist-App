/**
 * D&D 5e Race Definitions — Supplemental sources
 * VGM / MTF / MPMM / OGA / FTD / VRGtR
 *
 * Содержит 14 рас, отсутствовавших в исходном PHB-файле.
 * Там, где MPMM предоставляет ревизию VGM/MTF-расы с гибким ASI,
 * обе версии хранятся раздельно с явным source-атрибутом и полем supersedes.
 */

import type { RaceDefinition } from "./race-types";

export const SUPPLEMENT_RACES: Record<string, RaceDefinition> = {

  // ─── Багбир (Bugbear) ── VGM/MPMM ──────────────────────────────────────────
  "Багбир": {
    id: "bugbear",
    name: "Багбир",
    source: "MPMM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    darkvision: 60,
    description:
      "Крупные гоблиноиды, покрытые грубой шерстью. Известны внезапными атаками из засады и недюжинной силой.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Мощные сборки: считаетесь существом на один размер крупнее для переноса веса",
      "Долгорукость: досягаемость оружия ближнего боя +5 фт.",
      "Неожиданная атака: +2d6 урона при атаке с преимуществом (1 раз в ход)",
      "Скрытность гоблиноидов: владение навыком Скрытность",
    ],
    languages: ["Общий", "Гоблинский"],
    skillProficiencies: ["Скрытность"],
  },

  // ─── Гитьянки (Githyanki) ── MTF/MPMM ──────────────────────────────────────
  "Гитьянки": {
    id: "githyanki",
    name: "Гитьянки",
    source: "MPMM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    groupTag: "Гит",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    description:
      "Воинственный псионический народ, правящий Астральным планом. Непримиримые враги иллитидов и гитцерай.",
    traits: [
      "Псионический разум: сопротивление психическому урону",
      "Телекинетический прыжок (Misty Step от INT, 1 раз в короткий/длинный отдых)",
      "Астральное знание: владение одним навыком (INT, WIS или CHA) на выбор",
      "Гитьянкийское владение оружием: короткие мечи, длинные мечи, полуторные мечи",
      "Псионический доступ: заклинания от INT с уровнем (Mage Hand, Jump, Misty Step)",
    ],
    languages: ["Общий", "Гитьянки"],
    resistances: ["psychic"],
    weaponProficiencies: ["Короткие мечи", "Длинные мечи", "Полуторные мечи"],
    spellGrants: [
      { spellName: "Рука мага", minLevel: 0, ability: "INT" },
      { spellName: "Прыжок", minLevel: 3, ability: "INT", usesLongRest: true },
      { spellName: "Туманный шаг", minLevel: 5, ability: "INT", usesLongRest: true },
    ],
  },

  // ─── Гитцерай (Githzerai) ── MTF/MPMM ──────────────────────────────────────
  "Гитцерай": {
    id: "githzerai",
    name: "Гитцерай",
    source: "MPMM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    groupTag: "Гит",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    description:
      "Философы и монахи, живущие в крепостях на плане Лимбо. Ценят внутренний покой и псионическую защиту.",
    traits: [
      "Псионический разум: сопротивление психическому урону",
      "Псионический щит: +2 к КД (бонус от WIS, как монах)",
      "Гитцерайское знание: владение одним навыком (INT, WIS или CHA) на выбор",
      "Псионический доступ: заклинания от WIS (Mage Hand, Shield, Detect Thoughts)",
    ],
    languages: ["Общий", "Гитцерай"],
    resistances: ["psychic"],
    spellGrants: [
      { spellName: "Рука мага", minLevel: 0, ability: "WIS" },
      { spellName: "Щит", minLevel: 3, ability: "WIS", usesLongRest: true },
      { spellName: "Обнаружение мыслей", minLevel: 5, ability: "WIS", usesLongRest: true },
    ],
  },

  // ─── Гоблин (Goblin) ── VGM/MPMM ───────────────────────────────────────────
  "Гоблин": {
    id: "goblin",
    name: "Гоблин",
    source: "MPMM",
    entityType: "race",
    size: "Small",
    creatureType: "Гуманоид",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    darkvision: 60,
    description:
      "Маленькие гоблиноиды с острым умом и инстинктом выживания. Мастера уклонения и неожиданных уходов.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Проворное бегство: бонусное действие Отход или Рывок",
      "Злобный укус: бонусное действие укус (1d6 + PB некротики), исцеляет вас",
    ],
    languages: ["Общий", "Гоблинский"],
  },

  // ─── Голиаф (Goliath) ── VGM/MPMM ──────────────────────────────────────────
  "Голиаф": {
    id: "goliath",
    name: "Голиаф",
    source: "MPMM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    description:
      "Великаны гор, считающиеся крупнее Medium для переноски и атлетических проверок.",
    traits: [
      "Телосложение Атлета: считаетесь Большим для переноса/толчка/тяги",
      "Горная устойчивость: когда падаете до 0 HP, можете вместо этого упасть до 1 HP (1 раз в день)",
      "Мощные сборки: преимущество на проверки Атлетики для толчка/тяги/переноски",
    ],
    languages: ["Общий", "Великаний"],
  },

  // ─── Грунг (Grung) ── OGA ───────────────────────────────────────────────────
  "Грунг": {
    id: "grung",
    name: "Грунг",
    source: "OGA",
    entityType: "race",
    size: "Small",
    creatureType: "Гуманоид",
    abilityBonuses: { DEX: 2, CON: 1 },
    speed: 25,
    darkvision: 0,
    altSpeeds: { climb: 25 },
    description:
      "Ядовитые лягушкообразные существа, живущие в тропических лесах. Каждый цвет кожи обозначает касту.",
    traits: [
      "Амфибия: дышит воздухом и водой",
      "Ядовитая кожа: существо, коснувшееся вас без защиты, отравлено",
      "Лазание: скорость лазания 25 фт.",
      "Прыгучесть: преимущество на проверки и спасброски STR для прыжков",
    ],
    languages: ["Грунг"],
    immunities: ["poison"],
  },

  // ─── Кенку (Kenku) ── VGM/MPMM ─────────────────────────────────────────────
  "Кенку": {
    id: "kenku",
    name: "Кенку",
    source: "MPMM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    description:
      "Птицеподобные существа, способные воспроизводить любые звуки и голоса, но не говорить самостоятельно.",
    traits: [
      "Подражание: точно воспроизводит звуки, голоса и речь, которые слышал",
      "Умбральное мышление: владение двумя навыками из набора (Восприятие, Скрытность, Ловкость рук, Обман)",
    ],
    languages: ["Общий (понимает, но говорит только подражая)"],
    skillChoices: {
      count: 2,
      options: ["Восприятие", "Скрытность", "Ловкость рук", "Обман"],
    },
  },

  // ─── Кобольд (Kobold) ── VGM/MPMM ──────────────────────────────────────────
  "Кобольд": {
    id: "kobold",
    name: "Кобольд",
    source: "MPMM",
    entityType: "race",
    size: "Small",
    creatureType: "Гуманоид",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    darkvision: 60,
    description:
      "Маленькие драконоподобные существа, известные стайной тактикой и ловушками.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Стайная тактика: преимущество на атаку, если союзник рядом с целью",
      "Драконье родство: владение одним навыком на выбор из списка",
    ],
    languages: ["Общий", "Драконий"],
    skillChoices: {
      count: 1,
      options: ["Магия", "История", "Природа", "Анализ"],
    },
  },

  // ─── Людоящер (Lizardfolk) ── VGM/MPMM ─────────────────────────────────────
  "Людоящер": {
    id: "lizardfolk",
    name: "Людоящер",
    source: "MPMM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    darkvision: 0,
    altSpeeds: { swim: 30 },
    description:
      "Хладнокровные рептилоиды с практичным взглядом на мир. Их шкура служит естественной бронёй.",
    traits: [
      "Укус: бонусное действие, 1d6 + STR пронизывающего урона",
      "Задержка дыхания: до 15 минут",
      "Голодный желудок: поглотить труп для восстановления HP (1d6 + CON мод)",
      "Естественный доспех: AC = 13 + DEX мод (без надетых доспехов)",
      "Скорость плавания 30 фт.",
    ],
    languages: ["Общий", "Драконий"],
    skillChoices: {
      count: 2,
      options: ["Анализ", "Атлетика", "Природа", "Скрытность", "Выживание", "Восприятие"],
    },
  },

  // ─── Орк (Orc) ── VGM/MPMM ─────────────────────────────────────────────────
  "Орк": {
    id: "orc",
    name: "Орк",
    source: "MPMM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    darkvision: 60,
    description:
      "Могучие воины, известные яростью в бою и племенными традициями.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Агрессия: бонусное действие — передвижение к враждебному существу",
      "Могущественные атлеты: преимущество на проверки STR для прыжков и атлетики 1 раз в день",
    ],
    languages: ["Общий", "Орочий"],
    skillProficiencies: ["Запугивание"],
  },

  // ─── Табакси (Tabaxi) ── VGM/MPMM ──────────────────────────────────────────
  "Табакси": {
    id: "tabaxi",
    name: "Табакси",
    source: "MPMM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    darkvision: 60,
    altSpeeds: { climb: 20 },
    description:
      "Кошачьи гуманоиды, движимые неутолимым любопытством и жаждой приключений.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Кошачье проворство: удвоение скорости на 1 ход (восстановление после движения = 0)",
      "Кошачьи когти: скорость лазания 20 фт., когти = 1d6 + STR рубящего урона",
    ],
    languages: ["Общий", "Один на выбор"],
    skillProficiencies: ["Восприятие", "Скрытность"],
  },

  // ─── Тритон (Triton) ── VGM/MPMM ───────────────────────────────────────────
  "Тритон": {
    id: "triton",
    name: "Тритон",
    source: "MPMM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    altSpeeds: { swim: 30 },
    description:
      "Морские стражи глубин, защищающие океаны от зла. Говорят с морскими существами.",
    traits: [
      "Амфибия: дышит воздухом и водой",
      "Скорость плавания 30 фт.",
      "Повелитель глубин: разговаривает с зверями типа «рыба», «акула», «морское животное»",
      "Эмиссар моря: призыв воды (заклинания от CHA)",
    ],
    languages: ["Общий", "Примордиальный"],
    resistances: ["cold"],
    spellGrants: [
      { spellName: "Усиление тумана", minLevel: 0, ability: "CHA" },
      { spellName: "Огненные стрелы", minLevel: 3, ability: "CHA", usesLongRest: true },
      { spellName: "Вызов молнии", minLevel: 5, ability: "CHA", usesLongRest: true },
    ],
  },

  // ─── Фирболг (Firbolg) ── VGM/MPMM ─────────────────────────────────────────
  "Фирболг": {
    id: "firbolg",
    name: "Фирболг",
    source: "MPMM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    description:
      "Скрытные лесные великаны с глубокой связью с природой и инстинктом хранителей леса.",
    traits: [
      "Магия фирболгов: Обнаружение магии и Маскировка существа (каждое 1 раз в день от WIS)",
      "Скрытый шаг: бонусное действие — становитесь невидимым до следующего хода (1 раз в день)",
      "Речь зверей и листвы: разговаривает с зверями и растениями",
      "Мощные сборки: считается крупнее для Атлетики/переноски",
    ],
    languages: ["Общий", "Эльфийский", "Великаний"],
    spellGrants: [
      { spellName: "Обнаружение магии", minLevel: 0, ability: "WIS", usesLongRest: true },
      { spellName: "Маскировка существа", minLevel: 0, ability: "WIS", usesLongRest: true },
    ],
  },

  // ─── Хобгоблин (Hobgoblin) ── VGM/MPMM ─────────────────────────────────────
  "Хобгоблин": {
    id: "hobgoblin",
    name: "Хобгоблин",
    source: "MPMM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    darkvision: 60,
    description:
      "Дисциплинированные военные гоблиноиды, ценящие порядок, иерархию и тактику превыше всего.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Воинское обучение: владение двумя видами воинского оружия и лёгкими доспехами",
      "Непреклонная воля: когда вы промахиваетесь по броску, можете добавить d4 (1 раз в день)",
      "Сохранить лицо: союзник рядом получает +d4 к броску реакцией после провала",
    ],
    languages: ["Общий", "Гоблинский"],
    weaponProficiencies: ["Два воинских оружия на выбор"],
    armorProficiencies: ["Лёгкие доспехи"],
  },

  // ─── Юань-ти (Yuan-ti Pureblood) ── VGM/MPMM ──────────────────────────────
  "Юань-ти": {
    id: "yuan-ti",
    name: "Юань-ти",
    source: "MPMM",
    entityType: "race",
    size: "Medium",
    creatureType: "Гуманоид",
    abilityBonuses: {},
    abilityBonusSelection: {
      description: "+2 к одной характеристике и +1 к другой или +1 к трём разным характеристикам",
      patterns: [
        { id: "split",  label: "+2 и +1",  bonuses: [2, 1] },
        { id: "spread", label: "+1 к трём", bonuses: [1, 1, 1] },
      ],
    },
    speed: 30,
    darkvision: 60,
    description:
      "Змееподобные гуманоиды с псионическими способностями. Холодны, расчётливы и самодостаточны.",
    traits: [
      "Тёмное зрение (60 фт.)",
      "Магическое сопротивление: преимущество на спасброски против заклинаний и магических эффектов",
      "Ядовитые заклинания: заклинания юань-ти от CHA",
      "Змеиный разум: иммунитет к очарованию и испугу магического происхождения",
    ],
    languages: ["Общий", "Аббисальный", "Драконий"],
    immunities: ["poison"],
    resistances: ["psychic"],
    spellGrants: [
      { spellName: "Ядовитые брызги", minLevel: 0, ability: "CHA" },
      { spellName: "Дружба животных (только змеи)", minLevel: 3, ability: "CHA", usesLongRest: true },
      { spellName: "Внушение", minLevel: 5, ability: "CHA", usesLongRest: true },
    ],
  },
};
