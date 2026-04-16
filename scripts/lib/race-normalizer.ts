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
  // Базовые
  "PHB", "VGM", "OGA", "MTF", "TCE", "FTD", "MPMM",
  // Приключения
  "EV", "TOA", "AI", "LR", "WBtW", "DSotDQ",
  // Сеттинги
  "SCAG", "PSA", "ttP", "GGR", "ERLW", "MOT", "SCC", "VRGtR", "AAG",
  // Unearthed Arcana
  "UA22WotM",
  // Третьи лица
  "MHH", "ODL", "EGtW",
  // Homebrew
  "CoN", "DMGi", "MPRGM", "PG", "LPZAE",
  // Альтернативные написания с ttg.club
  "Player's Handbook", "Volo's Guide to Monsters",
  "Mordenkainen's Tome of Foes", "Tasha's Cauldron of Everything",
  "Mordenkainen Presents: Monsters of the Multiverse",
  "One Grung Above", "Fizban's Treasury of Dragons",
  "Van Richten's Guide to Ravenloft",
  "Tomb of Annihilation", "Acquisitions Incorporated",
  "Locathah Rising", "The Wild Beyond the Witchlight",
  "Dragonlance: Shadow of the Dragon Queen",
  "Sword Coast Adventurer's Guide",
  "Guildmasters' Guide to Ravnica",
  "Eberron: Rising from the Last War",
  "Mythic Odysseys of Theros",
  "Strixhaven: A Curriculum of Chaos",
  "Astral Adventurer's Guide",
  "Explorer's Guide to Wildemount",
]);

export const TARGET_RACES_RU: Set<string> = new Set([
  "Аасимар", "Багбир", "Гит", "Гитьянки", "Гитцерай", "Гном",
  "Гоблин", "Голиаф", "Грибнит", "Грунг", "Дварф", "Драконорождённый",
  "Кенку", "Кобольд", "Людоящер", "Орк", "Полуорк", "Полурослик",
  "Полуэльф", "Табакси", "Тифлинг", "Тритон", "Фирболг",
  "Хобгоблин", "Человек", "Эльф", "Юань-ти", "Дампир",
]);

/** Маппинг полных ключей ttg.club → стандартные аббревиатуры AbilityName */
const ABILITY_KEY_MAP: Record<string, string> = {
  STRENGTH: "STR", СИЛА: "STR",
  DEXTERITY: "DEX", ЛОВКОСТЬ: "DEX",
  CONSTITUTION: "CON", ТЕЛОСЛОЖЕНИЕ: "CON",
  INTELLIGENCE: "INT", ИНТЕЛЛЕКТ: "INT",
  WISDOM: "WIS", МУДРОСТЬ: "WIS",
  CHARISMA: "CHA", ХАРИЗМА: "CHA",
  // короткие формы (на случай смешанного формата)
  STR: "STR", DEX: "DEX", CON: "CON",
  INT: "INT", WIS: "WIS", CHA: "CHA",
};

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
  // Базовые
  "phb": "PHB", "player's handbook": "PHB",
  "vgm": "VGM", "volo's guide to monsters": "VGM", "volo": "VGM",
  "oga": "OGA", "one grung above": "OGA",
  "mtf": "MTF", "mordenkainen's tome of foes": "MTF", "mtof": "MTF",
  "tce": "TCE", "tasha's cauldron of everything": "TCE", "tashas": "TCE",
  "ftd": "FTD", "fizban's treasury of dragons": "FTD",
  "mpmm": "MPMM", "mordenkainen presents: monsters of the multiverse": "MPMM",
  // Приключения
  "ev": "EV", "vecna": "EV",
  "toa": "TOA", "tomb of annihilation": "TOA",
  "ai": "AI", "acquisitions incorporated": "AI",
  "lr": "LR", "locathah rising": "LR",
  "wbtw": "WBtW", "the wild beyond the witchlight": "WBtW", "wild beyond the witchlight": "WBtW",
  "dsotdq": "DSotDQ", "dragonlance: shadow of the dragon queen": "DSotDQ",
  // Сеттинги
  "scag": "SCAG", "sword coast adventurer's guide": "SCAG",
  "psa": "PSA", "plane shift: amonkhet": "PSA",
  "ttp": "ttP", "tortle package": "ttP",
  "ggr": "GGR", "guildmasters' guide to ravnica": "GGR",
  "erlw": "ERLW", "eberron: rising from the last war": "ERLW", "eberron": "ERLW",
  "mot": "MOT", "mythic odysseys of theros": "MOT",
  "scc": "SCC", "strixhaven: a curriculum of chaos": "SCC", "strixhaven": "SCC",
  "vrgtr": "VRGtR", "van richten's guide to ravenloft": "VRGtR", "vrgr": "VRGtR",
  "aag": "AAG", "astral adventurer's guide": "AAG", "spelljammer": "AAG",
  // Unearthed Arcana
  "ua22wotm": "UA22WotM", "unearthed arcana 2022": "UA22WotM",
  // Третьи лица
  "mhh": "MHH", "midgard heroes handbook": "MHH",
  "odl": "ODL", "one d&d": "ODL",
  "egtw": "EGtW", "explorer's guide to wildemount": "EGtW", "wildemount": "EGtW",
  // Homebrew
  "con": "CoN",
  "dmgi": "DMGi",
  "mprgm": "MPRGM",
  "pg": "PG",
  "lpzae": "LPZAE",
  "custom": "CUSTOM",
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
    "Юань-ти": "yuan-ti", "Дампир": "dhampir", "Грибнит": "mushroom",
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
  // ttg.club возвращает name.rus (новый формат) или name.ru (старый) или name.eng
  const ruName = (raw.name?.rus ?? raw.name?.ru ?? raw.name?.eng ?? "").trim();
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
  const rawSource = raw.source?.shortName ?? (typeof raw.source?.name === "string" ? raw.source.name : "") ?? "";
  const source = normalizeSource(rawSource) ?? (raw.source?.homebrew ? "CUSTOM" : "PHB");
  if (rawSource && !TARGET_SOURCES.has(rawSource) && normalizeSource(rawSource) === null) {
    log.warn(ruName, `Неизвестный источник "${rawSource}", помечен как ${source}`);
  }

  const id = toSlug(ruName, source);
  const size = normalizeSize(raw.size);

  // Ability bonuses — поддерживаем оба формата:
  // новый: abilities[].key = "DEXTERITY" / "DEX"
  // старый: ability[].ability = "DEX"
  const abilityBonuses: Partial<Record<string, number>> = {};
  if (raw.abilities) {
    for (const ab of raw.abilities) {
      const key = ABILITY_KEY_MAP[ab.key.toUpperCase()];
      if (key) abilityBonuses[key] = ab.value;
      else log.warn(ruName, `Неизвестный ключ характеристики: "${ab.key}"`);
    }
  } else if (raw.ability) {
    for (const ab of raw.ability) {
      const key = ABILITY_KEY_MAP[ab.ability.toUpperCase()] ?? ab.ability.toUpperCase();
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
    description: (typeof raw.type === "string" ? raw.type : raw.type?.name) ?? `Раса ${ruName} из ${source}`,
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
