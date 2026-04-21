/**
 * Чистые helper'ы для X-04/X-05. Не зависят от React.
 */
import type { PendingChange } from "@/lib/offline-db";

/** Короткое описание поля из URL/body для human-readable diff. */
export function describeChange(change: PendingChange): {
  field: string;
  preview: string;
} {
  const url = change.url ?? "";

  // /api/characters/:id/ops — keyed op batch
  if (url.endsWith("/ops") && change.body && typeof change.body === "object") {
    const body = change.body as { ops?: Array<{ op: string; collection?: string; id?: string }> };
    if (Array.isArray(body.ops) && body.ops.length > 0) {
      const first = body.ops[0];
      const rest = body.ops.length > 1 ? ` (+ещё ${body.ops.length - 1})` : "";
      return {
        field: `${first.collection ?? "коллекция"}`,
        preview: `${localizeOp(first.op)} ${first.id ?? ""}${rest}`.trim(),
      };
    }
    return { field: "ops", preview: "пустой батч" };
  }

  // PATCH /api/characters/:id — partial character
  if (change.method === "PATCH" && change.body && typeof change.body === "object") {
    const body = change.body as Record<string, unknown>;
    const keys = Object.keys(body).filter((k) => k !== "id" && k !== "userId" && k !== "updatedAt");
    if (keys.length === 0) return { field: "—", preview: "пустой patch" };
    const primaryKey = keys[0];
    const value = body[primaryKey];
    const preview =
      typeof value === "object" && value !== null
        ? `→ ${JSON.stringify(value).slice(0, 40)}${JSON.stringify(value).length > 40 ? "…" : ""}`
        : `→ ${String(value).slice(0, 40)}`;
    const more = keys.length > 1 ? ` (+ещё ${keys.length - 1} поля)` : "";
    return { field: primaryKey, preview: `${preview}${more}` };
  }

  return { field: change.method, preview: url };
}

function localizeOp(op: string): string {
  if (op === "upsertItem") return "upsert";
  if (op === "removeItem") return "remove";
  if (op === "reorderItems") return "reorder";
  return op;
}

/** Сколько прошло с timestamp в секундах → «2 мин назад» / «5 сек назад». */
export function timeAgo(timestamp: number, now: number = Date.now()): string {
  const sec = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (sec < 60) return `${sec} сек назад`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} мин назад`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} ч назад`;
  const days = Math.floor(hrs / 24);
  return `${days} д назад`;
}

/** Извлечь characterId из URL PATCH / ops changes. Null если не применимо. */
export function extractCharacterId(url: string): string | null {
  const m = url.match(/\/api\/characters\/([a-zA-Z0-9-]+)/);
  return m ? m[1] : null;
}
