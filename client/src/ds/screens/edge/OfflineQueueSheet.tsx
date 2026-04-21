import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";

import { cn } from "@/lib/utils";
import { BottomSheet } from "@/ds/hero";
import { Button, Tag } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { clearPendingChanges, removePendingChange, type PendingChange } from "@/lib/offline-db";
import { syncPendingChanges } from "@/lib/offline-sync";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";

import { describeChange, timeAgo } from "./offline-utils";

/**
 * X-04 — Offline queue review. Handoff 03-screens.jsx EdgeStates X-04:
 *   [offline banner gold/ruby] [список изменений field→value · N мин назад]
 *   [«Отклонить»  «Применить, когда онлайн»]
 *
 * Источник данных: useOfflineQueue (infra из Блока 1). При online-status
 * кнопка «Синхронизировать» триггерит syncPendingChanges.
 */
export function OfflineQueueSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queue = useOfflineQueue();
  const { isOnline, setIsSyncing, refreshPendingCount } = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!open) return;
    queue.refresh();
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(tick);
  }, [open, queue]);

  const doSync = async () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    setIsSyncing(true);
    try {
      await syncPendingChanges(undefined, undefined, refreshPendingCount);
      await queue.refresh();
    } finally {
      setSyncing(false);
      setIsSyncing(false);
    }
  };

  const dropAll = async () => {
    await clearPendingChanges();
    await queue.refresh();
    refreshPendingCount();
  };

  const dropOne = async (id: PendingChange["id"]) => {
    await removePendingChange(id);
    await queue.refresh();
    refreshPendingCount();
  };

  const title = isOnline ? "Очередь изменений" : "Оффлайн · очередь";

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        queue.count === 0
          ? "Всё синхронизировано."
          : `${queue.count} ${pluralChanges(queue.count)} в очереди`
      }
    >
      {!isOnline && (
        <div className="mt-2 rounded-ds-md bg-gold-bg border border-gold-soft px-3 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
          <span className={cn(typeClass("body-sm"), "text-gold font-semibold")}>
            Вы оффлайн — изменения применяются локально и уйдут при появлении сети.
          </span>
        </div>
      )}

      {queue.count === 0 ? (
        <div className="mt-4 rounded-ds-md border border-dashed border-ink-300 p-6 text-center">
          <div className={cn(typeClass("body-sm"), "text-ink-500")}>
            Все изменения сохранены на сервере.
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-ds-md border border-ink-200 bg-paper-card overflow-hidden">
          {queue.items.map((change, i) => {
            const { field, preview } = describeChange(change);
            const isOps = change.url?.endsWith("/ops");
            return (
              <div
                key={change.id}
                className={cn(
                  "flex items-start gap-3 px-3 py-2.5",
                  i < queue.items.length - 1 && "border-b border-ink-100",
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isOps ? (
                      <Tag variant="violet">ops</Tag>
                    ) : (
                      <Tag>{change.method}</Tag>
                    )}
                    <span className={cn(typeClass("code"), "text-ink-500")}>
                      {field}
                    </span>
                  </div>
                  <div className="font-ds-sans text-[13px] text-ink-900 mt-0.5 truncate">
                    {preview}
                  </div>
                  <div className={cn(typeClass("caption"), "text-ink-500 mt-0.5")}>
                    {timeAgo(change.timestamp, now)}
                    {change.baseUpdatedAt && (
                      <>
                        {" · "}
                        <span title="Снимок версии на момент постановки">
                          base {change.baseUpdatedAt.slice(11, 19)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dropOne(change.id)}
                  className={cn(
                    "text-[11px] text-ink-500 hover:text-ruby shrink-0 px-1.5 py-0.5 rounded-ds-sm",
                    "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
                  )}
                  aria-label="Удалить изменение из очереди"
                >
                  отклонить
                </button>
              </div>
            );
          })}
        </div>
      )}

      {queue.count > 0 && (
        <div className="flex gap-2.5 mt-3">
          <Button variant="outline" className="flex-1" onClick={dropAll}>
            Отклонить все
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            disabled={!isOnline || syncing}
            onClick={doSync}
            data-testid="offline-queue-sync"
          >
            {syncing
              ? "Синхронизация…"
              : isOnline
                ? "Синхронизировать сейчас"
                : "Ждёт сеть"}
          </Button>
        </div>
      )}
    </BottomSheet>
  );
}

function pluralChanges(n: number): string {
  if (n === 1) return "изменение";
  if (n >= 2 && n <= 4) return "изменения";
  return "изменений";
}
