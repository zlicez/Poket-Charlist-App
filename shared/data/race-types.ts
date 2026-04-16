import type { AbilityName } from "./d5e-constants";

// ─── Source & taxonomy ────────────────────────────────────────────────────────

/** Официальные источники D&D 5e, поддерживаемые проектом */
export type RaceSourceCode =
  | "PHB"    // Player's Handbook
  | "VGM"    // Volo's Guide to Monsters
  | "MTF"    // Mordenkainen's Tome of Foes
  | "TCE"    // Tasha's Cauldron of Everything
  | "MPMM"   // Mordenkainen Presents: Monsters of the Multiverse
  | "OGA"    // One Grung Above
  | "FTD"    // Fizban's Treasury of Dragons
  | "VRGtR"  // Van Richten's Guide to Ravenloft
  | "CUSTOM";

/**
 * Семантический тип расовой сущности.
 * - `race`    — полноценная самостоятельная раса (Эльф, Дварф, …)
 * - `subrace` — подраса базовой расы (Высший эльф, Горный дварф, …)
 * - `lineage` — линидж, «накладываемый» поверх предыдущей расы (Дампир, Рейс, Обертос)
 * - `variant` — source-specific ревизия существующей расы (MPMM-версии VGM-рас)
 */
export type RaceEntityType = "race" | "subrace" | "lineage" | "variant";

export type RaceSize = "Small" | "Medium" | "Large";

export type DamageType =
  | "fire" | "cold" | "lightning" | "acid" | "poison" | "psychic"
  | "radiant" | "necrotic" | "thunder" | "force"
  | "piercing" | "slashing" | "bludgeoning";

// ─── Pattern-based flexible ability bonuses (Дампир, MPMM lineages) ──────────

export interface RaceAbilityBonusPattern {
  id: string;
  label: string;
  /** Отсортированный массив бонусов, напр. [2, 1] или [1, 1, 1] */
  bonuses: number[];
}

export interface RaceAbilityBonusSelection {
  description: string;
  patterns: RaceAbilityBonusPattern[];
}

// ─── Structured trait effects ─────────────────────────────────────────────────

export type RaceTraitEffectType =
  | "ability_bonus"
  | "proficiency_weapon"
  | "proficiency_armor"
  | "proficiency_tool"
  | "proficiency_skill"
  | "language"
  | "resistance"
  | "immunity"
  | "spell_grant"
  | "sense"
  | "speed_bonus"
  | "alt_speed"
  | "size";

export interface RaceTraitEffect {
  type: RaceTraitEffectType;
  value?: number | string | string[];
  /** Условие применения, напр. "at_level_3", "once_per_short_rest" */
  condition?: string;
}

export interface RaceTrait {
  id: string;
  name: string;
  description: string;
  effects?: RaceTraitEffect[];
}

// ─── Spell grants ─────────────────────────────────────────────────────────────

export interface RaceSpellGrant {
  /** Название заклинания (на русском) */
  spellName: string;
  /** Минимальный уровень персонажа для получения заклинания (0 = с 1-го уровня) */
  minLevel: number;
  /** Характеристика для атаки/спасброска */
  ability: AbilityName;
  /** Использует дополнительные зарядов/ресурсы */
  usesShortRest?: boolean;
  usesLongRest?: boolean;
}

// ─── Skill choices ────────────────────────────────────────────────────────────

export interface RaceSkillChoice {
  /** Сколько навыков выбирает игрок */
  count: number;
  /** Конкретный список или "any" */
  options: string[] | "any";
}

// ─── Subrace definition ───────────────────────────────────────────────────────

export interface SubraceDefinition {
  /** Стабильный slug, напр. "elf-high", "dwarf-mountain" */
  id: string;
  name: string;
  description?: string;
  abilityBonuses: Partial<Record<AbilityName, number>>;
  /** Переопределяет скорость родительской расы */
  speed?: number;
  /** Переопределяет тёмное зрение родительской расы */
  darkvision?: number;
  weaponProficiencies?: string[];
  armorProficiencies?: string[];
  toolProficiencies?: string[];
  /** Авто-назначенные навыки (не на выбор) */
  skillProficiencies?: string[];
  resistances?: DamageType[];
  immunities?: DamageType[];
  spellGrants?: RaceSpellGrant[];
  traits?: RaceTrait[];
}

// ─── Canonical race definition ────────────────────────────────────────────────

export interface RaceDefinition {
  // Identity
  /** Стабильный slug, уникальный в рамках всей системы.
   *  Примеры: "human", "elf", "tiefling", "tiefling-mpmm", "githyanki"
   */
  id: string;
  name: string;
  source: RaceSourceCode;
  /** "2014" | "2024" и т.д. */
  contentVersion?: string;
  entityType: RaceEntityType;
  /**
   * Тег для UI-группировки нескольких самостоятельных рас.
   * Пример: "Гит" объединяет "Гитьянки" и "Гитцерай" в одну группу в списке.
   */
  groupTag?: string;

  // Ability bonuses
  abilityBonuses: Partial<Record<AbilityName, number>>;
  /** Только для рас с гибким распределением (Дампир, MPMM lineages) */
  abilityBonusSelection?: RaceAbilityBonusSelection;

  // Core stats
  speed: number;
  altSpeeds?: { swim?: number; climb?: number; fly?: number };
  size: RaceSize;
  creatureType: string;

  // Description & traits
  description: string;
  /**
   * Трейты расы. Поддерживает два формата:
   * - строка (legacy, backward compat) — только для отображения
   * - RaceTrait (structured) — для движка эффектов
   */
  traits: (RaceTrait | string)[];

  // Grants
  languages: string[];
  weaponProficiencies?: string[];
  armorProficiencies?: string[];
  toolProficiencies?: string[];
  /** Автоматически назначаемые профиценции навыков */
  skillProficiencies?: string[];
  /** Выбор навыков игроком */
  skillChoices?: RaceSkillChoice;
  darkvision?: number;
  resistances?: DamageType[];
  immunities?: DamageType[];
  spellGrants?: RaceSpellGrant[];

  // Subraces (nested for backward compat with legacy lookup)
  subraces?: Record<string, SubraceDefinition>;

  // Lineage / revision metadata
  /**
   * ID расы, которую данная запись пересматривает/заменяет.
   * Пример: MPMM-версия Тифлинга supersedes "tiefling" (PHB).
   */
  supersedes?: string;
  /**
   * Имя расы как оно хранится в старых character records (для backward compat lookup).
   * Задаётся только если name отличается от устаревшего строкового ключа.
   */
  legacyName?: string;
}

/**
 * Backward compat alias.
 * Код, использующий старый тип RaceData, продолжает компилироваться без изменений.
 */
export type RaceData = RaceDefinition;
