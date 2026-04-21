import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { BottomSheet } from "@/ds/hero";
import { Button } from "@/ds/primitives";
import type { Character } from "@shared/schema";

/**
 * L-05 — Удаление персонажа (подтверждение). Handoff отмечает как edge:
 *   деструктивно, без undo (delete DB row сразу). BottomSheet, primary
 *   кнопка ruby.
 */
export function DeleteConfirmSheet({
  open,
  onOpenChange,
  character,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Удалить персонажа?"
      description="Действие нельзя отменить. Лист, заклинания и инвентарь исчезнут безвозвратно."
    >
      {character && (
        <div
          className={cn(
            "mt-2 rounded-ds-md border border-ruby-soft bg-ruby-bg px-3 py-2.5",
          )}
        >
          <div className={cn(typeClass("body-sm"), "text-ink-900")}>
            <strong className="text-ruby">Удалить:</strong>{" "}
            <span
              className="font-semibold"
              data-testid="delete-confirm-name"
            >
              {character.name || "(без имени)"}
            </span>
            {character.race || character.class ? (
              <div
                className={cn(typeClass("caption"), "text-ink-600 mt-0.5")}
              >
                {character.race ? `${character.race} · ` : ""}
                {character.class}
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="flex gap-2.5 mt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
          data-testid="delete-cancel"
        >
          Отмена
        </Button>
        <Button
          variant="ruby"
          className="flex-1"
          onClick={onConfirm}
          disabled={isDeleting}
          data-testid="delete-confirm"
        >
          {isDeleting ? "Удаляем…" : "Удалить навсегда"}
        </Button>
      </div>
    </BottomSheet>
  );
}
