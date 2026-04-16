/**
 * race-fetcher.ts
 *
 * HTTP-слой для получения race-данных с ttg.club.
 * Сначала пробует JSON API (/api/v1/races), при неудаче возвращает ошибку.
 * Сохраняет raw snapshot для повторяемости.
 */

import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, "../data");
const SNAPSHOTS_DIR = join(DATA_DIR, "raw-snapshots");

export interface RawRaceEntry {
  name: { ru?: string; eng?: string };
  source?: { shortName?: string; name?: string };
  type?: string;
  size?: string;
  speed?: { walk?: number; swim?: number; climb?: number; fly?: number };
  ability?: Array<{ ability: string; value: number }>;
  vision?: { dark?: number };
  languages?: string[];
  proficiencies?: Array<{ type: string; name: string }>;
  spells?: Array<{ name: string; level: number }>;
  resistances?: string[];
  immunities?: string[];
  traits?: Array<{ name: string; description: string }>;
  subraces?: RawRaceEntry[];
  url?: string;
}

export interface FetchResult {
  entries: RawRaceEntry[];
  snapshotPath: string;
  fetchedAt: string;
  source: string;
}

const TTG_BASE = "https://5e14.ttg.club";
const TTG_API = `${TTG_BASE}/api/v1/races`;

/**
 * Загружает все расы с ttg.club API.
 * Сохраняет raw response в scripts/data/raw-snapshots/{timestamp}.json
 */
export async function fetchRaces(options?: {
  /** Таймаут запроса в мс, по умолчанию 30000 */
  timeoutMs?: number;
  /** Сохранять ли raw snapshot на диск */
  saveSnapshot?: boolean;
}): Promise<FetchResult> {
  const { timeoutMs = 30_000, saveSnapshot = true } = options ?? {};
  const fetchedAt = new Date().toISOString();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let entries: RawRaceEntry[] = [];
  let sourceUrl = TTG_API;

  try {
    const res = await fetch(TTG_API, {
      signal: controller.signal,
      headers: { "Accept": "application/json", "User-Agent": "pocket-charlist-importer/1.0" },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText} — ${TTG_API}`);
    }

    const json = await res.json();
    // API может вернуть массив напрямую или { data: [...] }
    entries = Array.isArray(json) ? json : (json.data ?? json.races ?? []);
  } finally {
    clearTimeout(timer);
  }

  let snapshotPath = "";
  if (saveSnapshot && entries.length > 0) {
    snapshotPath = await saveRawSnapshot(entries, fetchedAt);
  }

  return { entries, snapshotPath, fetchedAt, source: sourceUrl };
}

async function saveRawSnapshot(entries: RawRaceEntry[], timestamp: string): Promise<string> {
  await mkdir(SNAPSHOTS_DIR, { recursive: true });
  const safe = timestamp.replace(/[:.]/g, "-");
  const path = join(SNAPSHOTS_DIR, `races-${safe}.json`);
  await writeFile(path, JSON.stringify(entries, null, 2), "utf8");
  return path;
}

/**
 * Загружает записи из локального snapshot-файла (для повторного прогона без сети).
 */
export async function loadSnapshot(snapshotPath: string): Promise<RawRaceEntry[]> {
  const { readFile } = await import("fs/promises");
  const raw = await readFile(snapshotPath, "utf8");
  return JSON.parse(raw);
}
