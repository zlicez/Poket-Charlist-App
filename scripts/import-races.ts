#!/usr/bin/env tsx
/**
 * import-races.ts
 *
 * Import pipeline для рас D&D 5e с внешнего источника (ttg.club).
 *
 * Использование:
 *   npx tsx scripts/import-races.ts [опции]
 *
 * Опции:
 *   --sources=PHB,VGM,MPMM     Фильтр по источникам (по умолчанию все)
 *   --races=Эльф,Дварф         Фильтр по именам (по умолчанию все target races)
 *   --dry-run                  Только показать результат, не сохранять файлы
 *   --no-snapshot              Не сохранять raw snapshot
 *   --from-snapshot=path.json  Загрузить данные из локального snapshot
 *   --verbose                  Подробный вывод
 *
 * Pipeline:
 *   1. Fetch       — загрузка с ttg.club API
 *   2. Snapshot    — сохранение raw ответа
 *   3. Normalize   — raw → RaceDefinition
 *   4. Validate    — canonical model validation
 *   5. Diagnostics — вывод статистики и предупреждений
 *   6. Output      — показать diff или записать в файл
 *
 * Важно: скрипт НЕ перезаписывает существующие данные автоматически.
 * Результат выводится на экран для review.
 */

import { fetchRaces, loadSnapshot } from "./lib/race-fetcher.js";
import { normalizeAll, TARGET_SOURCES, TARGET_RACES_RU } from "./lib/race-normalizer.js";
import { validateAll } from "./lib/race-validator.js";
import { appendImportRun, makeRunId } from "./lib/import-logger.js";
import type { RaceDefinition } from "../shared/data/race-types.js";

// ─── CLI arg parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);

const DRY_RUN = Boolean(flags["dry-run"]);
const VERBOSE = Boolean(flags["verbose"]);
const NO_SNAPSHOT = Boolean(flags["no-snapshot"]);
const FROM_SNAPSHOT = typeof flags["from-snapshot"] === "string" ? flags["from-snapshot"] : null;

const SOURCE_FILTER: Set<string> | null =
  typeof flags["sources"] === "string"
    ? new Set(flags["sources"].split(",").map((s) => s.trim().toUpperCase()))
    : null;

const RACE_FILTER: Set<string> | null =
  typeof flags["races"] === "string"
    ? new Set(flags["races"].split(",").map((s) => s.trim()))
    : null;

// ─── Utils ────────────────────────────────────────────────────────────────────

function log(...args: unknown[]) { console.log(...args); }
function info(msg: string) { log(`\x1b[36m[INFO]\x1b[0m  ${msg}`); }
function warn(msg: string) { log(`\x1b[33m[WARN]\x1b[0m  ${msg}`); }
function error(msg: string) { log(`\x1b[31m[ERROR]\x1b[0m ${msg}`); }
function ok(msg: string) { log(`\x1b[32m[OK]\x1b[0m    ${msg}`); }

function printSeparator() { log("─".repeat(60)); }

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const runId = makeRunId();
  const startedAt = new Date().toISOString();
  log(`\n\x1b[1mPocket Charlist — Race Import Pipeline\x1b[0m`);
  log(`Run ID: ${runId}`);
  log(`Started: ${startedAt}`);
  if (DRY_RUN) log(`\x1b[33mMode: DRY RUN (файлы не изменяются)\x1b[0m`);
  printSeparator();

  // ── Step 1: Fetch ────────────────────────────────────────────────────────
  let rawEntries: Awaited<ReturnType<typeof fetchRaces>>["entries"] = [];
  let snapshotPath = "";

  if (FROM_SNAPSHOT) {
    info(`Загрузка из локального snapshot: ${FROM_SNAPSHOT}`);
    rawEntries = await loadSnapshot(FROM_SNAPSHOT);
    info(`Загружено ${rawEntries.length} записей`);
  } else {
    info("Загрузка рас с ttg.club...");
    try {
      const result = await fetchRaces({ saveSnapshot: !NO_SNAPSHOT });
      rawEntries = result.entries;
      snapshotPath = result.snapshotPath;
      ok(`Получено ${rawEntries.length} записей`);
      if (snapshotPath) info(`Snapshot сохранён: ${snapshotPath}`);
    } catch (err) {
      error(`Ошибка загрузки: ${err instanceof Error ? err.message : String(err)}`);
      error("Используйте --from-snapshot=path.json для работы с кэшированными данными");
      process.exit(1);
    }
  }

  printSeparator();

  // ── Step 2: Normalize ────────────────────────────────────────────────────
  info("Нормализация записей...");
  const { races: allNormalized, log: diagLog } = normalizeAll(rawEntries);

  // Apply filters
  let normalized = allNormalized;
  if (SOURCE_FILTER) {
    normalized = normalized.filter((r) => SOURCE_FILTER.has(r.source));
    info(`Фильтр по источникам: ${[...SOURCE_FILTER].join(", ")} → ${normalized.length} рас`);
  }
  if (RACE_FILTER) {
    normalized = normalized.filter((r) => RACE_FILTER.has(r.name));
    info(`Фильтр по именам: ${[...RACE_FILTER].join(", ")} → ${normalized.length} рас`);
  }

  ok(`Нормализовано: ${normalized.length} рас`);

  const skipped = rawEntries.length - allNormalized.length;
  if (skipped > 0) info(`Пропущено (не в target list): ${skipped}`);

  if (VERBOSE && diagLog.entries.length > 0) {
    printSeparator();
    log("Диагностика нормализации:");
    for (const entry of diagLog.entries) {
      const prefix = entry.level === "warn" ? "\x1b[33m[WARN]\x1b[0m" : "[INFO]";
      log(`  ${prefix} ${entry.raceName}: ${entry.message}`);
    }
  }

  printSeparator();

  // ── Step 3: Validate ─────────────────────────────────────────────────────
  info("Валидация канонической модели...");
  const report = validateAll(normalized);

  if (report.errors.length > 0) {
    error(`Ошибки валидации (${report.errors.length}):`);
    for (const e of report.errors) {
      log(`  \x1b[31m✗\x1b[0m [${e.raceName}] ${e.field}: ${e.message}`);
    }
  }

  if (report.warnings.length > 0) {
    warn(`Предупреждения валидации (${report.warnings.length}):`);
    if (VERBOSE) {
      for (const w of report.warnings) {
        log(`  \x1b[33m⚠\x1b[0m [${w.raceName}] ${w.field}: ${w.message}`);
      }
    } else {
      log(`  (используйте --verbose для деталей)`);
    }
  }

  if (report.valid) ok("Валидация пройдена");

  printSeparator();

  // ── Step 4: Stats ────────────────────────────────────────────────────────
  log("\x1b[1mРезультаты импорта:\x1b[0m");
  log(`  Всего fetched:        ${rawEntries.length}`);
  log(`  Нормализовано:        ${allNormalized.length}`);
  log(`  После фильтров:       ${normalized.length}`);
  log(`  Пропущено:            ${skipped}`);
  log(`  Ошибки валидации:     ${report.errors.length}`);
  log(`  Предупреждения:       ${report.warnings.length}`);

  printSeparator();

  // ── Step 5: Output ───────────────────────────────────────────────────────
  if (normalized.length > 0) {
    log("\x1b[1mНормализованные расы:\x1b[0m");
    for (const r of normalized) {
      log(`  ${r.entityType === "lineage" ? "⟐" : "●"} [${r.source}] ${r.name} (id: ${r.id}, size: ${r.size})`);
    }
    printSeparator();

    if (!DRY_RUN) {
      info("Для добавления рас в проект:");
      info("  1. Скопируйте нужные записи в shared/data/d5e-races-supplements.ts");
      info("  2. Обогатите traits, spellGrants, skillProficiencies вручную");
      info("  3. Запустите npm run check && npm test для проверки");
      printSeparator();
    }

    // Print sample TS for first 2 races
    if (VERBOSE) {
      log("\x1b[1mПример сгенерированного TypeScript (первые 2 расы):\x1b[0m");
      for (const r of normalized.slice(0, 2)) {
        log(`\n  // ${r.name} [${r.source}]`);
        log(`  "${r.name}": ${JSON.stringify(r, null, 4).split("\n").join("\n  ")},`);
      }
      printSeparator();
    }
  } else {
    warn("Нет рас для вывода после фильтрации. Проверьте фильтры --sources и --races.");
  }

  // ── Step 6: Log run ──────────────────────────────────────────────────────
  const finishedAt = new Date().toISOString();
  try {
    await appendImportRun({
      runId,
      startedAt,
      finishedAt,
      status: report.valid ? (normalized.length > 0 ? "success" : "partial") : "partial",
      stats: {
        fetched: rawEntries.length,
        parsed: allNormalized.length,
        failed: 0,
        skipped,
        validationErrors: report.errors.length,
        validationWarnings: report.warnings.length,
      },
      snapshotPath,
      errors: report.errors.map((e) => `[${e.raceName}] ${e.message}`),
      warnings: report.warnings.map((w) => `[${w.raceName}] ${w.message}`),
      processedRaceIds: normalized.map((r) => r.id),
    });
    if (VERBOSE) info(`Run записан в import-log.json`);
  } catch (err) {
    warn(`Не удалось записать import log: ${err}`);
  }

  log(`\nГотово. ${finishedAt}`);
}

main().catch((err) => {
  console.error("\x1b[31m[FATAL]\x1b[0m", err);
  process.exit(1);
});
