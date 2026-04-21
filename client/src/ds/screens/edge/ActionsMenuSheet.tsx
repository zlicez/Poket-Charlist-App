import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { BottomSheet } from "@/ds/hero";

/**
 * Маленький overflow-sheet для character-screen mobile: список действий
 * Share / Export (Phase H3). Desktop использует Sidebar-кнопки напрямую.
 *
 * Форма «список ListRow» без декора — минимум чтобы не перегружать.
 */
export function ActionsMenuSheet({
  open,
  onOpenChange,
  onShare,
  onExport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare?: () => void;
  onExport?: () => void;
}) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Действия"
    >
      <div className="flex flex-col gap-1 mt-2">
        {onShare && (
          <ActionRow
            icon="↗"
            label="Поделиться ссылкой"
            hint="Публичный read-only просмотр"
            onClick={() => {
              onOpenChange(false);
              onShare();
            }}
            testId="actions-share"
          />
        )}
        {onExport && (
          <ActionRow
            icon="⇣"
            label="Экспорт JSON / PDF"
            hint="Сохранить копию листа на устройство"
            onClick={() => {
              onOpenChange(false);
              onExport();
            }}
            testId="actions-export"
          />
        )}
      </div>
    </BottomSheet>
  );
}

function ActionRow({
  icon,
  label,
  hint,
  onClick,
  testId,
}: {
  icon: string;
  label: string;
  hint: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cn(
        "flex items-center gap-3 rounded-ds-md px-3 py-3",
        "bg-paper-card border border-ink-200",
        "hover:border-ink-400 hover:shadow-ds-1 transition-shadow",
        "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
        "text-left",
      )}
    >
      <span
        className="w-9 h-9 rounded-full bg-paper-2 border border-ink-200 flex items-center justify-center text-[16px] text-ink-700"
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span
          className={cn(
            typeClass("body"),
            "block text-ink-900 font-semibold",
          )}
        >
          {label}
        </span>
        <span
          className={cn(typeClass("caption"), "text-ink-500 block")}
        >
          {hint}
        </span>
      </span>
    </button>
  );
}
