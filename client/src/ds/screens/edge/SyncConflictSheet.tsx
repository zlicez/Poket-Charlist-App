import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import { BottomSheet } from "@/ds/hero";
import { Button, Tag } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { updateCharacter } from "@/lib/api/characters";
import { removePendingChange } from "@/lib/offline-db";
import { useOfflineQueue, type ConflictDetail } from "@/hooks/useOfflineQueue";

/**
 * X-05 — Sync conflict. Handoff 03-screens.jsx EdgeStates X-05:
 *   [stale tag ruby]  «Серверная копия новее»  + diff-preview
 *   [«Взять серверное»  «Перезаписать моё»]
 *
 * Conflict emit'ится из offline-sync.ts или apiRequest (на 409).
 * useOfflineQueue.lastConflict хранит detail; sheet показывается, когда он есть.
 *
 * Actions:
 *   take-server: clearConflict + drop queued change (если origin = rebase/ops/patch
 *     и есть queuedChangeId). Cache уже обновлён до server-state в queryClient на
 *     момент 409 (см. lib/queryClient.ts).
 *   take-mine: re-apply attempted как updateCharacter → If-Match возьмёт
 *     свежий updatedAt из cache, PATCH пройдёт.
 */
export function SyncConflictSheet() {
  const { lastConflict, hasConflict, clearConflict, refresh } = useOfflineQueue();

  if (!hasConflict || !lastConflict) return null;

  return (
    <BottomSheet
      open={hasConflict}
      onOpenChange={(o) => !o && clearConflict()}
      dismissable={false}
      title={
        <span className="inline-flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-ruby" />
          Конфликт версий
        </span>
      }
    >
      <ConflictContent
        detail={lastConflict}
        onResolved={async () => {
          await refresh();
          clearConflict();
        }}
      />
    </BottomSheet>
  );
}

function ConflictContent({
  detail,
  onResolved,
}: {
  detail: ConflictDetail;
  onResolved: () => void;
}) {
  const sourceLabel: Record<ConflictDetail["source"], string> = {
    rebase: "offline-replay обнаружил более свежую серверную версию",
    patch: "PATCH отклонён сервером (409)",
    ops: "batch ops отклонён сервером (409)",
  };

  const takeServer = async () => {
    // Cache уже содержит server state (установлен в lib/queryClient при 409).
    // Удаляем queued change, если она есть — он уже устарел.
    if (detail.queuedChangeId) {
      try {
        await removePendingChange(detail.queuedChangeId);
      } catch {
        /* ignore */
      }
    }
    onResolved();
  };

  const takeMine = async () => {
    // Повторно применяем attempted. updateCharacter возьмёт свежий
    // updatedAt из cache (обновлённый после 409), If-Match пройдёт.
    if (
      detail.attempted &&
      typeof detail.attempted === "object" &&
      detail.characterId
    ) {
      try {
        await updateCharacter(
          detail.characterId,
          detail.attempted as Parameters<typeof updateCharacter>[1],
        );
        if (detail.queuedChangeId) {
          try {
            await removePendingChange(detail.queuedChangeId);
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* Конфликт может повториться — оставляем для user'а следующий раунд. */
      }
    }
    onResolved();
  };

  const attemptedSummary = summarizePayload(detail.attempted);
  const currentSummary = summarizePayload(detail.current);

  return (
    <>
      <div className="mt-2 flex items-center gap-2">
        <Tag variant="ruby">stale</Tag>
        <span className={cn(typeClass("body-sm"), "text-ink-700")}>
          {sourceLabel[detail.source]}
        </span>
      </div>

      <p className={cn(typeClass("body-sm"), "text-ink-600 mt-3")}>
        Ваше изменение применить нельзя: сервер обновился после того, как
        вы начали редактировать. Выберите, чью версию оставить.
      </p>

      <div className="grid grid-cols-1 gap-2 mt-3">
        <DiffPane
          label="Что вы пытались отправить"
          body={attemptedSummary}
          tone="ruby"
        />
        <DiffPane
          label="Что сейчас на сервере"
          body={currentSummary}
          tone="sage"
        />
      </div>

      {detail.currentUpdatedAt && (
        <div className={cn(typeClass("caption"), "text-ink-500 mt-2")}>
          Серверная версия: {detail.currentUpdatedAt}
        </div>
      )}

      <div className="flex gap-2.5 mt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={takeServer}
          data-testid="conflict-take-server"
        >
          Взять серверное
        </Button>
        <Button
          variant="ruby"
          className="flex-1"
          onClick={takeMine}
          data-testid="conflict-take-mine"
        >
          Перезаписать моё
        </Button>
      </div>
    </>
  );
}

function DiffPane({
  label,
  body,
  tone,
}: {
  label: string;
  body: string;
  tone: "ruby" | "sage";
}) {
  const toneClass =
    tone === "ruby"
      ? "border-ruby-soft bg-ruby-bg/40"
      : "border-sage-soft bg-sage-bg/40";
  return (
    <div className={cn("rounded-ds-md border p-3", toneClass)}>
      <div className={cn(typeClass("label"), tone === "ruby" ? "text-ruby" : "text-sage")}>
        {label}
      </div>
      <pre
        className={cn(
          "font-ds-mono text-[11.5px] text-ink-700 mt-1 max-h-[140px] overflow-auto whitespace-pre-wrap break-words",
        )}
      >
        {body}
      </pre>
    </div>
  );
}

function summarizePayload(p: unknown): string {
  if (!p) return "—";
  if (typeof p !== "object") return String(p).slice(0, 400);
  try {
    // For character-like payloads, pick interesting top-level fields.
    const o = p as Record<string, unknown>;
    const keysOfInterest = [
      "currentHp",
      "tempHp",
      "maxHp",
      "deathSaves",
      "inspiration",
      "level",
      "experience",
      "ui_state",
      "ops",
      "updatedAt",
    ];
    const picked: Record<string, unknown> = {};
    for (const k of keysOfInterest) {
      if (k in o) picked[k] = o[k];
    }
    const body = Object.keys(picked).length > 0 ? picked : o;
    return JSON.stringify(body, null, 2).slice(0, 600);
  } catch {
    return "[не удалось сериализовать payload]";
  }
}
