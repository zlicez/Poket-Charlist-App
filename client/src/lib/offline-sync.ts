import { CHARACTERS_LIST_URL, SYNC_EVENTS } from "@shared/constants";
import {
  getPendingChanges,
  clearPendingChanges,
  removePendingChange,
  type PendingChange,
} from "./offline-db";

const CHARACTER_URL_RE = new RegExp(`^${CHARACTERS_LIST_URL}/([^/]+)$`);
const CHARACTER_OPS_RE = new RegExp(`^${CHARACTERS_LIST_URL}/([^/]+)/ops$`);

// Для versioned write-операций (PATCH /characters/:id или POST /characters/:id/ops)
// возвращает characterId + канонический GET-URL (он же используется для rebase-check).
function extractVersionedWrite(
  change: PendingChange,
): { characterId: string; characterUrl: string } | null {
  if (change.method === "PATCH") {
    const m = change.url.match(CHARACTER_URL_RE);
    if (m) return { characterId: m[1], characterUrl: change.url };
  }
  if (change.method === "POST") {
    const m = change.url.match(CHARACTER_OPS_RE);
    if (m) return { characterId: m[1], characterUrl: `${CHARACTERS_LIST_URL}/${m[1]}` };
  }
  return null;
}

type ConflictDetail = {
  characterId: string;
  url: string;
  attempted: unknown;
  current: unknown;
  currentUpdatedAt: string | undefined;
  source: "rebase" | "patch" | "ops";
  queuedChangeId?: PendingChange["id"];
};

function emitConflict(detail: ConflictDetail): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SYNC_EVENTS.conflict, { detail }));
  }
}

function emit(name: typeof SYNC_EVENTS.start | typeof SYNC_EVENTS.end): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name));
  }
}

async function fetchServerUpdatedAt(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { updatedAt?: string };
    return data.updatedAt;
  } catch {
    return undefined;
  }
}

async function fetchServerCharacter(url: string): Promise<unknown | undefined> {
  try {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) return undefined;
    return await res.json();
  } catch {
    return undefined;
  }
}

export async function syncPendingChanges(
  onSyncStart?: () => void,
  onSyncEnd?: () => void,
  onCountUpdate?: () => void,
): Promise<{ synced: number; failed: number; conflicts: number }> {
  const changes = await getPendingChanges();
  if (changes.length === 0) return { synced: 0, failed: 0, conflicts: 0 };

  onSyncStart?.();
  emit(SYNC_EVENTS.start);
  let synced = 0;
  let failed = 0;
  let conflicts = 0;

  for (const change of changes) {
    const versioned = extractVersionedWrite(change);

    // Rebase check: если мы знаем базовую версию, сверяемся с сервером ДО отправки.
    // Расхождение = молчаливая перезапись нежелательна; останавливаем replay и
    // отдаём UI-слою через event возможность показать конфликт (X-05).
    if (versioned && change.baseUpdatedAt) {
      const serverUpdatedAt = await fetchServerUpdatedAt(versioned.characterUrl);
      if (serverUpdatedAt && serverUpdatedAt !== change.baseUpdatedAt) {
        const current = await fetchServerCharacter(versioned.characterUrl);
        emitConflict({
          characterId: versioned.characterId,
          url: change.url,
          attempted: change.body,
          current,
          currentUpdatedAt: serverUpdatedAt,
          source: "rebase",
          queuedChangeId: change.id,
        });
        conflicts++;
        break;
      }
    }

    try {
      const headers: Record<string, string> = {};
      if (change.body) headers["Content-Type"] = "application/json";
      if (versioned && change.baseUpdatedAt) {
        headers["If-Match"] = change.baseUpdatedAt;
      }

      const res = await fetch(change.url, {
        method: change.method,
        headers,
        body: change.body ? JSON.stringify(change.body) : undefined,
        credentials: "include",
      });

      if (res.status === 409 && versioned) {
        // Race между rebase-check и самой мутацией — редко, но возможно.
        const body = await res
          .json()
          .catch(() => ({}) as { currentCharacter?: unknown; currentUpdatedAt?: string });
        emitConflict({
          characterId: versioned.characterId,
          url: change.url,
          attempted: change.body,
          current: body.currentCharacter,
          currentUpdatedAt: body.currentUpdatedAt,
          source: change.method === "POST" ? "ops" : "patch",
          queuedChangeId: change.id,
        });
        conflicts++;
        break;
      }

      if (res.ok || res.status === 404) {
        await removePendingChange(change.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
      break;
    }
    onCountUpdate?.();
  }

  if (failed === 0 && conflicts === 0) {
    await clearPendingChanges();
  }

  onSyncEnd?.();
  emit(SYNC_EVENTS.end);
  return { synced, failed, conflicts };
}
