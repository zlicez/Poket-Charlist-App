import { useCallback, useEffect, useState } from "react";
import { SYNC_EVENTS } from "@shared/constants";
import { getPendingChanges, type PendingChange } from "@/lib/offline-db";

export interface ConflictDetail {
  characterId: string;
  url: string;
  attempted: unknown;
  current: unknown;
  currentUpdatedAt: string | undefined;
  source: "rebase" | "patch" | "ops";
  queuedChangeId?: PendingChange["id"];
}

export type OfflineQueueStatus = "idle" | "syncing" | "conflict";

export interface UseOfflineQueueReturn {
  items: PendingChange[];
  count: number;
  status: OfflineQueueStatus;
  hasConflict: boolean;
  lastConflict: ConflictDetail | null;
  clearConflict: () => void;
  refresh: () => Promise<void>;
}

// Источник правды о состоянии оффлайн-очереди. Подписывается на события
// sync:start / sync:end / sync:conflict, которые эмитит offline-sync.ts и
// apiRequest (в момент 409). Потребители — будущие X-04 Review panel и
// X-05 Conflict sheet из нового дизайна, а также ConnectionStatus.
export function useOfflineQueue(): UseOfflineQueueReturn {
  const [items, setItems] = useState<PendingChange[]>([]);
  const [status, setStatus] = useState<OfflineQueueStatus>("idle");
  const [lastConflict, setLastConflict] = useState<ConflictDetail | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await getPendingChanges();
      setItems(list);
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    refresh();

    const handleConflict = (event: Event) => {
      const detail = (event as CustomEvent<ConflictDetail>).detail;
      setLastConflict(detail);
      setStatus("conflict");
      refresh();
    };
    const handleStart = () => {
      setStatus((prev) => (prev === "conflict" ? prev : "syncing"));
    };
    const handleEnd = () => {
      setStatus((prev) => (prev === "conflict" ? prev : "idle"));
      refresh();
    };

    window.addEventListener(SYNC_EVENTS.conflict, handleConflict);
    window.addEventListener(SYNC_EVENTS.start, handleStart);
    window.addEventListener(SYNC_EVENTS.end, handleEnd);
    return () => {
      window.removeEventListener(SYNC_EVENTS.conflict, handleConflict);
      window.removeEventListener(SYNC_EVENTS.start, handleStart);
      window.removeEventListener(SYNC_EVENTS.end, handleEnd);
    };
  }, [refresh]);

  const clearConflict = useCallback(() => {
    setLastConflict(null);
    setStatus("idle");
  }, []);

  return {
    items,
    count: items.length,
    status,
    hasConflict: lastConflict !== null,
    lastConflict,
    clearConflict,
    refresh,
  };
}
