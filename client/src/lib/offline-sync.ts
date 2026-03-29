import { getPendingChanges, clearPendingChanges, removePendingChange } from "./offline-db";

export async function syncPendingChanges(
  onSyncStart?: () => void,
  onSyncEnd?: () => void,
  onCountUpdate?: () => void,
): Promise<{ synced: number; failed: number }> {
  const changes = await getPendingChanges();
  if (changes.length === 0) return { synced: 0, failed: 0 };

  onSyncStart?.();
  let synced = 0;
  let failed = 0;

  for (const change of changes) {
    try {
      const res = await fetch(change.url, {
        method: change.method,
        headers: change.body ? { "Content-Type": "application/json" } : {},
        body: change.body ? JSON.stringify(change.body) : undefined,
        credentials: "include",
      });
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

  if (failed === 0) {
    await clearPendingChanges();
  }

  onSyncEnd?.();
  return { synced, failed };
}
