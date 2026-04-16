import type { AbilityName } from "./d5e-constants";
import type {
  ClassChoiceDefinition,
  ClassDefinition,
  ClassProficiencyBlock,
  ClassSourceCode,
} from "./class-types";

export interface ClassData {
  name: string;
  hitDice: string;
  hitDiceValue: number;
  savingThrows: AbilityName[];
  description: string;
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  spellcastingAbility?: AbilityName;
}

function choice(
  id: string,
  label: string,
  kind: ClassChoiceDefinition["kind"],
  count: number,
  options: string[] | "any",
): ClassChoiceDefinition {
  return { id, label, kind, count, options, required: true };
}

function classTrainingFeature(classId: string, className: string) {
  return {
    id: `${classId}-training`,
    name: "Классовая подготовка",
    source: "CUSTOM" as const,
    contentVersion: "2014",
    description: `Базовая подготовка класса ${className}: кости хитов, спасброски и стартовые владения.`,
  };
}

function spellcastingFeature(classId: string, className: string) {
  return {
    id: `${classId}-spellcasting`,
    name: "Использование заклинаний",
    source: "CUSTOM" as const,
    contentVersion: "2014",
    description: `Класс ${className} получает магическую прогрессию и использует заклинания по правилам класса.`,
  };
}

function subclassFeature(classId: string, className: string) {
  return {
    id: `${classId}-subclass`,
    name: "Выбор подкласса",
    source: "CUSTOM" as const,
    contentVersion: "2014",
    description: `На этом уровне класс ${className} открывает выбор подкласса.`,
  };
}

function defineClass(input: {
  id: string;
  name: string;
  source?: ClassSourceCode;
  contentVersion?: string;
  description: string;
  hitDice: string;
  hitDiceValue: number;
  savingThrows: AbilityName[];
  startingProficiencies: ClassProficiencyBlock;
  multiclassProficiencies?: ClassProficiencyBlock;
  spellcasting?: ClassDefinition["spellcasting"];
  subclassUnlockLevel?: number;
}): ClassDefinition {
  const featureDefinitions: NonNullable<ClassDefinition["featureDefinitions"]> = {
    [`${input.id}-training`]: classTrainingFeature(input.id, input.name),
  };

  const levelGrants: NonNullable<ClassDefinition["levelGrants"]> = [
    { level: 1, featureIds: [`${input.id}-training`] },
  ];

  if (input.spellcasting) {
    featureDefinitions[`${input.id}-spellcasting`] = spellcastingFeature(
      input.id,
      input.name,
    );
    levelGrants.push({
      level: input.spellcasting.startsAtLevel ?? 1,
      featureIds: [`${input.id}-spellcasting`],
    });
  }

  if (input.subclassUnlockLevel) {
    featureDefinitions[`${input.id}-subclass`] = subclassFeature(
      input.id,
      input.name,
    );
    levelGrants.push({
      level: input.subclassUnlockLevel,
      featureIds: [`${input.id}-subclass`],
    });
  }

  return {
    id: input.id,
    name: input.name,
    entityType: "class",
    source: input.source ?? "PHB",
    contentVersion: input.contentVersion ?? "2014",
    legacyName: input.name,
    description: input.description,
    hitDie: {
      dice: input.hitDice,
      value: input.hitDiceValue,
    },
    savingThrows: input.savingThrows,
    startingProficiencies: input.startingProficiencies,
    multiclassProficiencies: input.multiclassProficiencies,
    subclassRule: input.subclassUnlockLevel
      ? {
          unlockLevel: input.subclassUnlockLevel,
          allowCustom: true,
        }
      : undefined,
    spellcasting: input.spellcasting,
    featureDefinitions,
    levelGrants,
    subclasses: {},
  };
}

const BARBARIAN_SKILLS = [
  "Атлетика",
  "Запугивание",
  "Природа",
  "Восприятие",
  "Выживание",
  "Уход за животными",
];
const BARD_SKILLS = "any" as const;
const CLERIC_SKILLS = [
  "История",
  "Медицина",
  "Проницательность",
  "Религия",
  "Убеждение",
];
const DRUID_SKILLS = [
  "Магия",
  "Уход за животными",
  "Проницательность",
  "Медицина",
  "Природа",
  "Восприятие",
  "Религия",
  "Выживание",
];
const FIGHTER_SKILLS = [
  "Акробатика",
  "Атлетика",
  "Выживание",
  "Запугивание",
  "История",
  "Проницательность",
  "Уход за животными",
  "Восприятие",
];
const MONK_SKILLS = [
  "Акробатика",
  "Атлетика",
  "История",
  "Проницательность",
  "Религия",
  "Скрытность",
];
const PALADIN_SKILLS = [
  "Атлетика",
  "Проницательность",
  "Запугивание",
  "Медицина",
  "Религия",
  "Убеждение",
];
const RANGER_SKILLS = [
  "Атлетика",
  "Выживание",
  "Магия",
  "Природа",
  "Проницательность",
  "Скрытность",
  "Уход за животными",
  "Восприятие",
];
const ROGUE_SKILLS = [
  "Акробатика",
  "Анализ",
  "Атлетика",
  "Выступление",
  "Запугивание",
  "Ловкость рук",
  "Обман",
  "Проницательность",
  "Убеждение",
  "Скрытность",
];
const SORCERER_SKILLS = [
  "Магия",
  "Обман",
  "Проницательность",
  "Запугивание",
  "Религия",
  "Убеждение",
];
const WARLOCK_SKILLS = [
  "Анализ",
  "Запугивание",
  "История",
  "Магия",
  "Обман",
  "Природа",
  "Религия",
];
const WIZARD_SKILLS = [
  "Анализ",
  "История",
  "Магия",
  "Медицина",
  "Проницательность",
  "Религия",
];
const ARTIFICER_SKILLS = [
  "Анализ",
  "Магия",
  "История",
  "Медицина",
  "Природа",
  "Ловкость рук",
  "Восприятие",
];

const classDefinitions = [
  defineClass({
    id: "bard",
    name: "Бард",
    description:
      "Музыкант и заклинатель, черпающий магию из песен и историй. Мастер вдохновения и поддержки союзников.",
    hitDice: "d8",
    hitDiceValue: 8,
    savingThrows: ["DEX", "CHA"],
    startingProficiencies: {
      armor: ["Лёгкие доспехи"],
      weapons: [
        "Простое оружие",
        "Ручные арбалеты",
        "Длинные мечи",
        "Рапиры",
        "Короткие мечи",
      ],
      tools: ["Три музыкальных инструмента"],
      choices: [choice("bard-skill-choice", "Навыки барда", "skill", 3, BARD_SKILLS)],
    },
    multiclassProficiencies: {
      armor: ["Лёгкие доспехи"],
      choices: [
        choice("bard-multiclass-skill-choice", "Навык барда", "skill", 1, BARD_SKILLS),
      ],
      tools: ["Один музыкальный инструмент"],
    },
    spellcasting: {
      ability: "CHA",
      progression: "full",
      mode: "known",
      startsAtLevel: 1,
    },
    subclassUnlockLevel: 3,
  }),
  defineClass({
    id: "barbarian",
    name: "Варвар",
    description:
      "Свирепый воин первобытной ярости. Входит в неистовство в бою, получая невероятную силу и выносливость.",
    hitDice: "d12",
    hitDiceValue: 12,
    savingThrows: ["STR", "CON"],
    startingProficiencies: {
      armor: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
      weapons: ["Простое оружие", "Воинское оружие"],
      choices: [
        choice("barbarian-skill-choice", "Навыки варвара", "skill", 2, BARBARIAN_SKILLS),
      ],
    },
    multiclassProficiencies: {
      armor: ["Щиты"],
      weapons: ["Простое оружие", "Воинское оружие"],
    },
    subclassUnlockLevel: 3,
  }),
  defineClass({
    id: "fighter",
    name: "Воин",
    description:
      "Мастер боевых искусств, владеющий любым оружием и доспехами. Универсальный и надёжный боец.",
    hitDice: "d10",
    hitDiceValue: 10,
    savingThrows: ["STR", "CON"],
    startingProficiencies: {
      armor: ["Все доспехи", "Щиты"],
      weapons: ["Простое оружие", "Воинское оружие"],
      choices: [choice("fighter-skill-choice", "Навыки воина", "skill", 2, FIGHTER_SKILLS)],
    },
    multiclassProficiencies: {
      armor: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
      weapons: ["Простое оружие", "Воинское оружие"],
    },
    subclassUnlockLevel: 3,
  }),
  defineClass({
    id: "wizard",
    name: "Волшебник",
    description:
      "Учёный заклинатель, черпающий магию из книг и исследований. Обладает широчайшим арсеналом заклинаний.",
    hitDice: "d6",
    hitDiceValue: 6,
    savingThrows: ["INT", "WIS"],
    startingProficiencies: {
      armor: [],
      weapons: ["Кинжалы", "Дротики", "Пращи", "Боевые посохи", "Лёгкие арбалеты"],
      choices: [choice("wizard-skill-choice", "Навыки волшебника", "skill", 2, WIZARD_SKILLS)],
    },
    multiclassProficiencies: {
      armor: [],
      weapons: [],
    },
    spellcasting: {
      ability: "INT",
      progression: "full",
      mode: "spellbook",
      startsAtLevel: 1,
    },
    subclassUnlockLevel: 2,
  }),
  defineClass({
    id: "druid",
    name: "Друид",
    description:
      "Жрец природы, способный превращаться в зверей и повелевать стихиями. Защитник дикой природы.",
    hitDice: "d8",
    hitDiceValue: 8,
    savingThrows: ["INT", "WIS"],
    startingProficiencies: {
      armor: ["Лёгкие доспехи", "Средние доспехи", "Щиты (не металл)"],
      weapons: [
        "Дубинки",
        "Кинжалы",
        "Дротики",
        "Метательные копья",
        "Булавы",
        "Боевые посохи",
        "Скимитары",
        "Серпы",
        "Пращи",
        "Копья",
      ],
      tools: ["Набор травника"],
      choices: [choice("druid-skill-choice", "Навыки друида", "skill", 2, DRUID_SKILLS)],
    },
    multiclassProficiencies: {
      armor: ["Лёгкие доспехи", "Средние доспехи", "Щиты (не металл)"],
      tools: ["Набор травника"],
    },
    spellcasting: {
      ability: "WIS",
      progression: "full",
      mode: "prepared",
      startsAtLevel: 1,
    },
    subclassUnlockLevel: 2,
  }),
  defineClass({
    id: "cleric",
    name: "Жрец",
    description:
      "Божественный заклинатель, получающий силу от своего божества. Целитель и защитник веры.",
    hitDice: "d8",
    hitDiceValue: 8,
    savingThrows: ["WIS", "CHA"],
    startingProficiencies: {
      armor: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
      weapons: ["Простое оружие"],
      choices: [choice("cleric-skill-choice", "Навыки жреца", "skill", 2, CLERIC_SKILLS)],
    },
    multiclassProficiencies: {
      armor: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
      weapons: [],
    },
    spellcasting: {
      ability: "WIS",
      progression: "full",
      mode: "prepared",
      startsAtLevel: 1,
    },
    subclassUnlockLevel: 1,
  }),
  defineClass({
    id: "artificer",
    name: "Изобретатель",
    source: "ERLW",
    description:
      "Мастер магических устройств и алхимии. Создаёт волшебные предметы и усиливает снаряжение.",
    hitDice: "d8",
    hitDiceValue: 8,
    savingThrows: ["CON", "INT"],
    startingProficiencies: {
      armor: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
      weapons: ["Простое оружие"],
      tools: ["Воровские инструменты", "Инструменты ремесленника"],
      choices: [
        choice(
          "artificer-skill-choice",
          "Навыки изобретателя",
          "skill",
          2,
          ARTIFICER_SKILLS,
        ),
      ],
    },
    multiclassProficiencies: {
      armor: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
      tools: ["Воровские инструменты", "Инструменты ремесленника"],
    },
    spellcasting: {
      ability: "INT",
      progression: "artificer",
      mode: "prepared",
      startsAtLevel: 1,
    },
    subclassUnlockLevel: 3,
  }),
  defineClass({
    id: "warlock",
    name: "Колдун",
    description:
      "Заклинатель, заключивший договор с могущественной сущностью. Получает уникальные способности от покровителя.",
    hitDice: "d8",
    hitDiceValue: 8,
    savingThrows: ["WIS", "CHA"],
    startingProficiencies: {
      armor: ["Лёгкие доспехи"],
      weapons: ["Простое оружие"],
      choices: [
        choice("warlock-skill-choice", "Навыки колдуна", "skill", 2, WARLOCK_SKILLS),
      ],
    },
    multiclassProficiencies: {
      armor: ["Лёгкие доспехи"],
      weapons: ["Простое оружие"],
    },
    spellcasting: {
      ability: "CHA",
      progression: "pact",
      mode: "pact",
      startsAtLevel: 1,
    },
    subclassUnlockLevel: 1,
  }),
  defineClass({
    id: "monk",
    name: "Монах",
    description:
      "Мастер боевых искусств, использующий внутреннюю энергию ци. Быстрый и смертоносный без оружия.",
    hitDice: "d8",
    hitDiceValue: 8,
    savingThrows: ["STR", "DEX"],
    startingProficiencies: {
      armor: [],
      weapons: ["Простое оружие", "Короткие мечи"],
      tools: ["Один инструмент или музыкальный инструмент"],
      choices: [choice("monk-skill-choice", "Навыки монаха", "skill", 2, MONK_SKILLS)],
    },
    multiclassProficiencies: {
      weapons: ["Простое оружие", "Короткие мечи"],
    },
    subclassUnlockLevel: 3,
  }),
  defineClass({
    id: "paladin",
    name: "Паладин",
    description:
      "Святой воин, связанный священной клятвой. Сочетает боевое мастерство с божественной магией.",
    hitDice: "d10",
    hitDiceValue: 10,
    savingThrows: ["WIS", "CHA"],
    startingProficiencies: {
      armor: ["Все доспехи", "Щиты"],
      weapons: ["Простое оружие", "Воинское оружие"],
      choices: [
        choice("paladin-skill-choice", "Навыки паладина", "skill", 2, PALADIN_SKILLS),
      ],
    },
    multiclassProficiencies: {
      armor: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
      weapons: ["Простое оружие", "Воинское оружие"],
    },
    spellcasting: {
      ability: "CHA",
      progression: "half",
      mode: "prepared",
      startsAtLevel: 2,
    },
    subclassUnlockLevel: 3,
  }),
  defineClass({
    id: "rogue",
    name: "Плут",
    description:
      "Мастер скрытности, ловкости и хитрости. Наносит смертельные удары из засады.",
    hitDice: "d8",
    hitDiceValue: 8,
    savingThrows: ["DEX", "INT"],
    startingProficiencies: {
      armor: ["Лёгкие доспехи"],
      weapons: [
        "Простое оружие",
        "Ручные арбалеты",
        "Длинные мечи",
        "Рапиры",
        "Короткие мечи",
      ],
      tools: ["Воровские инструменты"],
      choices: [choice("rogue-skill-choice", "Навыки плута", "skill", 4, ROGUE_SKILLS)],
    },
    multiclassProficiencies: {
      armor: ["Лёгкие доспехи"],
      tools: ["Воровские инструменты"],
      choices: [
        choice("rogue-multiclass-skill-choice", "Навык плута", "skill", 1, ROGUE_SKILLS),
      ],
    },
    subclassUnlockLevel: 3,
  }),
  defineClass({
    id: "ranger",
    name: "Следопыт",
    description:
      "Охотник и следопыт диких земель. Мастер выслеживания и борьбы с избранными врагами.",
    hitDice: "d10",
    hitDiceValue: 10,
    savingThrows: ["STR", "DEX"],
    startingProficiencies: {
      armor: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
      weapons: ["Простое оружие", "Воинское оружие"],
      choices: [choice("ranger-skill-choice", "Навыки следопыта", "skill", 3, RANGER_SKILLS)],
    },
    multiclassProficiencies: {
      armor: ["Лёгкие доспехи", "Средние доспехи", "Щиты"],
      weapons: ["Простое оружие", "Воинское оружие"],
      choices: [
        choice("ranger-multiclass-skill-choice", "Навык следопыта", "skill", 1, RANGER_SKILLS),
      ],
    },
    spellcasting: {
      ability: "WIS",
      progression: "half",
      mode: "known",
      startsAtLevel: 2,
    },
    subclassUnlockLevel: 3,
  }),
  defineClass({
    id: "sorcerer",
    name: "Чародей",
    description:
      "Заклинатель с врождённой магией в крови. Способен изменять заклинания метамагией.",
    hitDice: "d6",
    hitDiceValue: 6,
    savingThrows: ["CON", "CHA"],
    startingProficiencies: {
      armor: [],
      weapons: ["Кинжалы", "Дротики", "Пращи", "Боевые посохи", "Лёгкие арбалеты"],
      choices: [
        choice(
          "sorcerer-skill-choice",
          "Навыки чародея",
          "skill",
          2,
          SORCERER_SKILLS,
        ),
      ],
    },
    multiclassProficiencies: {
      armor: [],
      weapons: [],
    },
    spellcasting: {
      ability: "CHA",
      progression: "full",
      mode: "known",
      startsAtLevel: 1,
    },
    subclassUnlockLevel: 1,
  }),
].sort((left, right) => left.name.localeCompare(right.name, "ru"));

export const CLASS_DEFINITIONS = Object.fromEntries(
  classDefinitions.map((definition) => [definition.id, definition]),
) as Record<string, ClassDefinition>;

export const CLASS_DEFINITIONS_BY_NAME = Object.fromEntries(
  classDefinitions.map((definition) => [definition.name, definition]),
) as Record<string, ClassDefinition>;

export function getClassDefinitionById(
  id: string,
): ClassDefinition | undefined {
  return CLASS_DEFINITIONS[id];
}

export function getClassDefinitionByName(
  name: string,
): ClassDefinition | undefined {
  return CLASS_DEFINITIONS_BY_NAME[name];
}

export function getFallbackClassDefinition(name: string): ClassDefinition {
  return defineClass({
    id: name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, "-")
      .replace(/^-+|-+$/g, ""),
    name,
    source: "CUSTOM",
    description: `Пользовательский или устаревший класс ${name}. Для него применяется совместимый fallback без канонического контента.`,
    hitDice: "d10",
    hitDiceValue: 10,
    savingThrows: [],
    startingProficiencies: {},
  });
}

export const CLASS_DATA: Record<string, ClassData> = Object.fromEntries(
  classDefinitions.map((definition) => [
    definition.name,
    {
      name: definition.name,
      hitDice: definition.hitDie.dice,
      hitDiceValue: definition.hitDie.value,
      savingThrows: definition.savingThrows,
      description: definition.description,
      armorProficiencies: [...(definition.startingProficiencies.armor ?? [])],
      weaponProficiencies: [...(definition.startingProficiencies.weapons ?? [])],
      toolProficiencies: [...(definition.startingProficiencies.tools ?? [])],
      spellcastingAbility: definition.spellcasting?.ability,
    },
  ]),
) as Record<string, ClassData>;

export const CLASSES = classDefinitions.map((definition) => definition.name) as (keyof typeof CLASS_DATA)[];
