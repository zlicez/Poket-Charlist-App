/**
 * import-logger.ts
 *
 * Ведёт историю import runs в scripts/data/import-log.json.
 * Каждый запуск — отдельная запись с метаданными и диагностикой.
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOG_PATH = join(__dirname, "../data/import-log.json");
const DATA_DIR = join(__dirname, "../data");

export interface ImportRunRecord {
  runId: string;
  startedAt: string;
  finishedAt: string;
  status: "success" | "partial" | "failed";
  stats: {
    fetched: number;
    parsed: number;
    failed: number;
    skipped: number;
    validationErrors: number;
    validationWarnings: number;
  };
  snapshotPath?: string;
  errors: string[];
  warnings: string[];
  /** Список id рас, успешно нормализованных в этом прогоне */
  processedRaceIds: string[];
}

export interface ImportLog {
  runs: ImportRunRecord[];
}

export async function appendImportRun(record: ImportRunRecord): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  let log: ImportLog = { runs: [] };

  if (existsSync(LOG_PATH)) {
    try {
      const raw = await readFile(LOG_PATH, "utf8");
      log = JSON.parse(raw) as ImportLog;
    } catch {
      // corrupt log → start fresh
      log = { runs: [] };
    }
  }

  log.runs.push(record);
  // Хранить не более 50 последних записей
  if (log.runs.length > 50) log.runs = log.runs.slice(-50);
  await writeFile(LOG_PATH, JSON.stringify(log, null, 2), "utf8");
}

export function makeRunId(): string {
  return `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
