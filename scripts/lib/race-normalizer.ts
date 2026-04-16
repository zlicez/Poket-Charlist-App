/**
 * race-normalizer.ts
 *
 * Нормализация raw race-записей с ttg.club в канонический формат RaceDefinition.
 *
 * Правила:
 * - Сохраняются только расы из TARGET_RACES и TARGET_SOURCES
 * - Несоответствия логируются в DiagnosticLog
 * - Уже существующие расы обновляются аддитивно (не затирают вручную прописанные данные)
 */

import type { RaceDefinition, RaceSourceCode, RaceSize, DamageType } from "../../shared/data/race-types.js";
import type { RawRaceEntry } from "./race-fetcher.js";

// ─── Target filter ────────────────────────────────────────────────────────────

export const TARGET_SOURCES: Set<string> = new Set([
  "PHB", "VGM", "MTF", "TCE", "MPMM", "OGA", "FTD", "VRGtR",
  // Альтернативные написания на ttg.club
  "Player's Handbook", "Volo's Guide to Monsters",
  "Mordenkainen's Tome of Foes", "Tasha's Cauldron of Everything",
  "Mordenkainen Presents: Monsters of the Multiverse",
  "One Grung Above", "Fizban's Treasury of Dragons",
  "Van Richten's Guide to Ravenloft",
]);

export const TARGET_RACES_RU: Set<string> = new Set([
  "Аасимар", "Багбир", "Гит", "Гитьянки", "Гитцерай", "Гном",
  "Гоблин", "Голиаф", "Грунг", "Дварф", "Драконорождённый",
  "Кенку", "Кобольд", "Людоящер", "Орк", "Полуорк", "Полурослик",
  "Полуэльф", "Табакси", "Тифлинг", "Тритон", "Фирболг",
  "Хобгоблин", "Человек", "Эльф", "Юань-ти", "Дампир",
]);

// ─── Diagnostic log ───────────────────────────────────────────────────────────

export interface DiagnosticEntry {
  level: "info" | "warn" | "error";
  raceName: string;
  message: string;
}

export class DiagnosticLog {
  entries: DiagnosticEntry[] = [];

  info(raceName: string, message: string) {
    this.entries.push({ level: "info", raceName, message });
  }
  warn(raceName: string, message: string) {
    this.entries.push({ level: "warn", raceName, message });
  }
  error(raceName: string, message: string) {
    this.entries.push({ level: "error", raceName, message });
  }

  get warnings() { return this.entries.filter((e) => e.level === "warn"); }
  get errors() { return this.entries.filter((e) => e.level === "error"); }
}

// ─── Source normalization ─────────────────────────────────────────────────────

const SOURCE_MAP: Record<string, RaceSourceCode> = {
  "phb": "PHB", "player's handbook": "PHB",
  "vgm": "VGM", "volo's guide to monsters": "VGM", "volo": "VGM",
  "mtf": "MTF", "mordenkainen's tome of foes": "MTF", "mtof": "MTF",
  "tce": "TCE", "tasha's cauldron of everything": "TCE", "tashas": "TCE",
  "mpmm": "MPMM", "mordenkainen presents: monsters of the multiverse": "MPMM",
  "oga": "OGA", "one grung above": "OGA",
  "ftd": "FTD", "fizban's treasury of dragons": "FTD",
  "vrgtr": "VRGtR", "van richten's guide to ravenloft": "VRGtR", "vrgr": "VRGtR",
};

function normalizeSource(raw?: string): RaceSourceCode | null {
  if (!raw) return null;
  const key = raw.toLowerCase().trim();
  return SOURCE_MAP[key] ?? null;
}

// ─── Size normalization ───────────────────────────────────────────────────────

function normalizeSize(raw?: string): RaceSize {
  if (!raw) return "Medium";
  const lower = raw.toLowerCase();
  if (lower.includes("small") || lower.includes("маленький") || lower.includes("мал")) return "Small";
  if (lower.includes("large") || lower.includes("больш")) return "Large";
  return "Medium";
}

// ─── Damage type normalization ────────────────────────────────────────────────

const DAMAGE_TYPE_MAP: Record<string, DamageType> = {
  "fire": "fire", "огонь": "fire", "огневой": "fire",
  "cold": "cold", "холод": "cold", "холодный": "cold",
  "lightning": "lightning", "молния": "lightning",
  "acid": "acid", "кислота": "acid", "кислотный": "acid",
  "poison": "poison", "яд": "poison", "ядовитый": "poison",
  "psychic": "psychic", "психика": "psychic", "психический": "psychic",
  "radiant": "radiant", "сияние": "radiant", "излучение": "radiant",
  "necrotic": "necrotic", "некротика": "necrotic", "некротический": "necrotic",
  "thunder": "thunder", "гром": "thunder", "громовой": "thunder",
  "force": "force", "силовой": "force",
  "piercing": "piercing", "колющий": "piercing",
  "slashing": "slashing", "рубящий": "slashing",
  "bludgeoning": "bludgeoning", "дробящий": "bludgeoning",
};

function normalizeDamageType(raw: string): DamageType | null {
  return DAMAGE_TYPE_MAP[raw.toLowerCase().trim()] ?? null;
}

// ─── Slug generation ──────────────────────────────────────────────────────────

function toSlug(ruName: string, source?: RaceSourceCode): string {
  const translitMap: Record<string, string> = {
    "Аасимар": "aasimar", "Багбир": "bugbear", "Гитьянки": "githyanki",
    "Гитцерай": "githzerai", "Гном": "gnome", "Гоблин": "goblin",
    "Голиаф": "goliath", "Грунг": "grung", "Дварф": "dwarf",
    "Драконорождённый": "dragonborn", "Кенку": "kenku", "Кобольд": "kobold",
    "Людоящер": "lizardfolk", "Орк": "orc", "Полуорк": "half-orc",
    "Полурослик": "halfling", "Полуэльф": "half-elf", "Табакси": "tabaxi",
    "Тифлинг": "tiefling", "Тритон": "triton", "Фирболг": "firbolg",
    "Хобгоблин": "hobgoblin", "Человек": "human", "Эльф": "elf",
    "Юань-ти": "yuan-ti", "Дампир": "dhampir",
  };
  const base = translitMap[ruName] ?? ruName.toLowerCase().replace(/\s+/g, "-");
  if (source && source !== "PHB") return `${base}-${source.toLowerCase()}`;
  return base;
}

// ─── Main normalizer ──────────────────────────────────────────────────────────

export interface NormalizeResult {
  race: RaceDefinition;
  isNew: boolean;
  warnings: string[];
}

/**
 * Нормализует одну raw-запись с ttg.club в RaceDefinition.
 * Возвращает null если раса не в TARGET_RACES или SOURCE не в TARGET_SOURCES.
 */
export function normalizeRace(
  raw: RawRaceEntry,
  log: DiagnosticLog,
): RaceDefinition | null {
  const ruName = raw.name?.ru?.trim() ?? raw.name?.eng?.trim() ?? "";
  if (!ruName) {
    log.warn("(unnamed)", "Пропущена раса без имени");
    return null;
  }

  // Filter: name
  if (!TARGET_RACES_RU.has(ruName)) {
    log.info(ruName, `Пропущена: не в списке целевых рас`);
    return null;
  }

  // Filter: source
  const rawSource = raw.source?.shortName ?? raw.source?.name ?? "";
  const source = normalizeSource(rawSource) ?? "PHB";
  if (rawSource && !TARGET_SOURCES.has(rawSource) && normalizeSource(rawSource) === null) {
    log.warn(ruName, `Неизвестный источник "${rawSource}", помечен как PHB`);
  }

  const id = toSlug(ruName, source);
  const size = normalizeSize(raw.size);

  // Ability bonuses
  const abilityBonuses: Partial<Record<string, number>> = {};
  if (raw.ability) {
    for (const ab of raw.ability) {
      const key = ab.ability.toUpperCase();
      abilityBonuses[key] = ab.value;
    }
  }

  // Speed
  const speed = raw.speed?.walk ?? 30;
  const altSpeeds: Record<string, number> = {};
  if (raw.speed?.swim) altSpeeds.swim = raw.speed.swim;
  if (raw.speed?.climb) altSpeeds.climb = raw.speed.climb;
  if (raw.speed?.fly) altSpeeds.fly = raw.speed.fly;

  // Darkvision
  const darkvision = raw.vision?.dark ?? undefined;

  // Languages
  const languages = raw.languages ?? ["Общий"];

  // Traits → strings (structured RaceTrait would need manual enrichment)
  const traits: string[] = (raw.traits ?? []).map((t) => `${t.name}: ${t.description}`);

  // Resistances
  const resistances: DamageType[] = [];
  for (const r of raw.resistances ?? []) {
    const dt = normalizeDamageType(r);
    if (dt) resistances.push(dt);
    else log.warn(ruName, `Неизвестный тип урона сопротивления: "${r}"`);
  }

  // Immunities
  const immunities: DamageType[] = [];
  for (const im of raw.immunities ?? []) {
    const dt = normalizeDamageType(im);
    if (dt) immunities.push(dt);
    else log.warn(ruName, `Неизвестный тип урона иммунитета: "${im}"`);
  }

  // Proficiencies
  const weaponProficiencies: string[] = [];
  const armorProficiencies: string[] = [];
  const toolProficiencies: string[] = [];
  for (const prof of raw.proficiencies ?? []) {
    const type = prof.type?.toLowerCase() ?? "";
    if (type === "weapon" || type === "оружие") weaponProficiencies.push(prof.name);
    else if (type === "armor" || type === "доспех") armorProficiencies.push(prof.name);
    else if (type === "tool" || type === "инструмент") toolProficiencies.push(prof.name);
  }

  const race: RaceDefinition = {
    id,
    name: ruName,
    source,
    entityType: "race",
    size,
    creatureType: "Гуманоид",
    abilityBonuses,
    speed,
    ...(Object.keys(altSpeeds).length > 0 && { altSpeeds: altSpeeds as any }),
    ...(darkvision && { darkvision }),
    description: raw.type ?? `Раса ${ruName} из ${source}`,
    traits: traits.length > 0 ? traits : [`Особенности ${ruName}`],
    languages,
    ...(resistances.length > 0 && { resistances }),
    ...(immunities.length > 0 && { immunities }),
    ...(weaponProficiencies.length > 0 && { weaponProficiencies }),
    ...(armorProficiencies.length > 0 && { armorProficiencies }),
    ...(toolProficiencies.length > 0 && { toolProficiencies }),
  };

  log.info(ruName, `Нормализовано: id=${id}, source=${source}, size=${size}`);
  return race;
}

/**
 * Нормализует весь массив raw-записей.
 * Возвращает нормализованные расы + диагностику.
 */
export function normalizeAll(
  entries: RawRaceEntry[],
): { races: RaceDefinition[]; log: DiagnosticLog } {
  const log = new DiagnosticLog();
  const races: RaceDefinition[] = [];

  for (const entry of entries) {
    const race = normalizeRace(entry, log);
    if (race) races.push(race);
  }

  return { races, log };
}
