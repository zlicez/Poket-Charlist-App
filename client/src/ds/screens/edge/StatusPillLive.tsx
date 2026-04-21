import { useState } from "react";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { StatusPill } from "@/ds/primitives";

import { OfflineQueueSheet } from "./OfflineQueueSheet";

/**
 * Live-wrapper над DS StatusPill. Сам читает online + queue state,
 * tap → открывает X-04 OfflineQueueSheet.
 *
 * State derivation:
 *   offline         → pill ruby («Оффлайн · N в очереди»)
 *   syncing         → pill gold pulse («Сохраняем…»)
 *   idle + pending  → pill ruby («N в очереди»)  // всё ещё оффлайн-семантика
 *   idle + empty    → pill sage («Сохранено»)
 *   conflict        → обрабатывается X-05, pill не меняем (sheet откроется сам)
 */
export function StatusPillLive() {
  const [open, setOpen] = useState(false);
  const { isOnline, pendingCount } = useOnlineStatus();
  const { status } = useOfflineQueue();

  const pillState =
    status === "syncing"
      ? "saving"
      : !isOnline || pendingCount > 0
        ? "offline"
        : "saved";

  return (
    <>
      <StatusPill
        state={pillState}
        pendingCount={pendingCount > 0 ? pendingCount : undefined}
        onClick={pendingCount > 0 || !isOnline ? () => setOpen(true) : undefined}
      />
      <OfflineQueueSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
