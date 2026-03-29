import { useEffect, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { syncPendingChanges } from "@/lib/offline-sync";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export function ConnectionStatus() {
  const { isOnline, pendingCount, isSyncing, setIsSyncing, refreshPendingCount } = useOnlineStatus();
  const { toast } = useToast();

  const handleSync = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await syncPendingChanges(
        undefined,
        undefined,
        refreshPendingCount,
      );
      if (result.synced > 0) {
        toast({ title: `Синхронизировано: ${result.synced}` });
        queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      }
      if (result.failed > 0) {
        toast({
          title: "Ошибки синхронизации",
          description: `Не удалось синхронизировать: ${result.failed}`,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Ошибка синхронизации",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      refreshPendingCount();
    }
  }, [isOnline, isSyncing, setIsSyncing, refreshPendingCount, toast]);

  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      handleSync();
    }
  }, [isOnline]);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg transition-all ${
        isOnline
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      }`}
      data-testid="status-connection"
    >
      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5" />
          <span>Ожидает синхронизации: {pendingCount}</span>
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <button
              onClick={handleSync}
              className="ml-1 hover:opacity-70"
              data-testid="button-sync"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span>Оффлайн{pendingCount > 0 ? ` (${pendingCount} изм.)` : ""}</span>
        </>
      )}
    </div>
  );
}
