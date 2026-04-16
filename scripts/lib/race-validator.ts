/**
 * race-validator.ts
 *
 * Валидация канонических RaceDefinition перед принятием в проект.
 * Проверяет обязательные поля, корректность паттернов, отсутствие дублей.
 */

import type { RaceDefinition } from "../../shared/data/race-types.js";

export interface ValidationError {
  raceId: string;
  raceName: string;
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationReport {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Валидирует одну расу. Возвращает список нарушений.
 */
export function validateRace(race: RaceDefinition): ValidationError[] {
  const errors: ValidationError[] = [];
  const e = (field: string, message: string, severity: "error" | "warning" = "error") =>
    errors.push({ raceId: race.id ?? "(no id)", raceName: race.name, field, message, severity });

  // Required string fields
  if (!race.id?.trim()) e("id", "id обязателен");
  if (!race.name?.trim()) e("name", "name обязателен");
  if (!race.source) e("source", "source обязателен");
  if (!race.entityType) e("entityType", "entityType обязателен");
  if (!race.size) e("size", "size обязателен");
  if (!race.creatureType?.trim()) e("creatureType", "creatureType обязателен");

  // Speed
  if (typeof race.speed !== "number" || race.speed < 0) {
    e("speed", `Некорректная скорость: ${race.speed}`);
  }

  // Description
  if (!race.description?.trim()) {
    e("description", "description рекомендуется", "warning");
  }

  // Traits
  if (!race.traits || race.traits.length === 0) {
    e("traits", "traits пустой — рекомендуется заполнить", "warning");
  }

  // Languages
  if (!race.languages || race.languages.length === 0) {
    e("languages", "languages пустой", "warning");
  }

  // abilityBonusSelection patterns
  if (race.abilityBonusSelection) {
    const { patterns } = race.abilityBonusSelection;
    if (!patterns || patterns.length === 0) {
      e("abilityBonusSelection.patterns", "patterns пустой при наличии abilityBonusSelection");
    } else {
      for (const p of patterns) {
        if (!p.id?.trim()) e("abilityBonusSelection.patterns[].id", `Pattern без id`);
        if (!p.bonuses || p.bonuses.length === 0) {
          e("abilityBonusSelection.patterns[].bonuses", `Pattern "${p.id}" без bonuses`);
        }
      }
    }
  }

  // subraces
  if (race.subraces) {
    for (const [key, sub] of Object.entries(race.subraces)) {
      if (!sub.id?.trim()) {
        e(`subraces.${key}.id`, `Подраса "${key}" без id`);
      }
      if (!sub.name?.trim()) {
        e(`subraces.${key}.name`, `Подраса "${key}" без name`);
      }
    }
  }

  return errors;
}

/**
 * Валидирует коллекцию рас.
 * Проверяет уникальность id и имён.
 */
export function validateAll(races: RaceDefinition[]): ValidationReport {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const seenIds = new Map<string, string>();
  const seenNames = new Map<string, string>();

  for (const race of races) {
    const raceErrors = validateRace(race);
    for (const err of raceErrors) {
      if (err.severity === "error") errors.push(err);
      else warnings.push(err);
    }

    // Duplicate id check
    if (race.id) {
      if (seenIds.has(race.id)) {
        errors.push({
          raceId: race.id,
          raceName: race.name,
          field: "id",
          message: `Дублирующийся id "${race.id}" (уже есть у "${seenIds.get(race.id)}")`,
          severity: "error",
        });
      } else {
        seenIds.set(race.id, race.name);
      }
    }

    // Duplicate name check
    if (race.name) {
      if (seenNames.has(race.name)) {
        warnings.push({
          raceId: race.id ?? "",
          raceName: race.name,
          field: "name",
          message: `Дублирующееся имя "${race.name}" — вероятно source-specific variant`,
          severity: "warning",
        });
      } else {
        seenNames.set(race.name, race.id ?? "");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
