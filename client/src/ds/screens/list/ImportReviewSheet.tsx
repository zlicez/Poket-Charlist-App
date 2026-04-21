import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { BottomSheet } from "@/ds/hero";
import { Button, Tag } from "@/ds/primitives";
import type { InsertCharacter } from "@shared/schema";

/**
 * L-04 — Импорт JSON — review. Handoff:
 *   пользователь выбрал файл → мы распарсили → показываем превью (имя/класс
 *   /раса/уровень/HP/слоты), просим подтвердить. Только после confirm —
 *   вызывается create.
 *
 * При ошибке парсинга sheet показывает error state с повторным выбором.
 */
export interface ImportReviewState {
  data?: InsertCharacter;
  filename?: string;
  error?: string;
}

export function ImportReviewSheet({
  open,
  onOpenChange,
  review,
  onConfirm,
  onPickAnother,
  isConfirming,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: ImportReviewState;
  onConfirm: () => void;
  onPickAnother: () => void;
  isConfirming?: boolean;
}) {
  const hasError = Boolean(review.error);
  const data = review.data;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={hasError ? "Не удалось прочесть файл" : "Импорт JSON"}
      description={
        hasError
          ? "Проверьте формат и попробуйте другой файл."
          : "Проверьте данные перед созданием персонажа."
      }
    >
      {hasError ? (
        <div
          className={cn(
            typeClass("body-sm"),
            "text-ruby rounded-ds-md bg-ruby-bg border border-ruby-soft px-3 py-2.5 mt-2",
          )}
          data-testid="import-review-error"
        >
          {review.error}
        </div>
      ) : data ? (
        <div className="mt-2 rounded-ds-md border border-ink-200 bg-paper-2 px-3 py-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            <div
              className={cn(
                "font-ds-serif text-[20px] font-medium text-ink-900 truncate",
              )}
              data-testid="import-review-name"
            >
              {data.name || "Без имени"}
            </div>
            {typeof (data as { level?: number }).level === "number" && (
              <Tag>
                УР {(data as { level?: number }).level}
              </Tag>
            )}
          </div>
          <div
            className={cn(typeClass("body-sm"), "text-ink-600 mt-1")}
          >
            {data.race ? `${data.race} · ` : ""}
            {data.class || "Класс не указан"}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <Stat
              label="HP"
              value={
                data.maxHp
                  ? `${data.currentHp ?? data.maxHp}/${data.maxHp}`
                  : "—"
              }
            />
            <Stat label="КД" value={String(data.armorClass ?? "—")} />
            <Stat
              label="СКОР"
              value={data.speed ? `${data.speed}` : "—"}
            />
          </div>
          {review.filename && (
            <div
              className={cn(typeClass("caption"), "text-ink-500 mt-3 truncate")}
            >
              Файл: {review.filename}
            </div>
          )}
        </div>
      ) : (
        <div className={cn(typeClass("body-sm"), "text-ink-500 mt-2")}>
          Выберите JSON-файл для импорта.
        </div>
      )}

      <div className="flex gap-2.5 mt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onPickAnother}
          disabled={isConfirming}
          data-testid="import-pick-another"
        >
          Другой файл
        </Button>
        {!hasError && (
          <Button
            variant="primary"
            className="flex-1"
            onClick={onConfirm}
            disabled={!data || isConfirming}
            data-testid="import-confirm"
          >
            {isConfirming ? "Импортируем…" : "Импортировать"}
          </Button>
        )}
      </div>
    </BottomSheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-ds-sm bg-paper-card",
        "border border-ink-200 px-2 py-2.5",
      )}
    >
      <div className={cn(typeClass("label"), "text-ink-500")}>{label}</div>
      <div
        className={cn(
          "font-ds-serif text-[20px] leading-none font-medium text-ink-900 mt-1",
        )}
      >
        {value}
      </div>
    </div>
  );
}
