/**
 * Рендерит тосты с кнопкой «Отменить» из undoStack Zustand-стора.
 * Каждая дискретная мутация (damage/heal/...) пушит UndoEntry со своим
 * `undoFn`; этот компонент подхватывает новые записи и показывает toast
 * с `duration = expiresAt - Date.now()`. Тап на «Отменить» вызывает
 * `undoFn` и вычищает запись из стека.
 */
import { useEffect, useRef } from "react";

import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useCharacterStore } from "@/stores/characterStore";

export function UndoToastHost() {
  const undoStack = useCharacterStore((s) => s.undoStack);
  const consumeUndo = useCharacterStore((s) => s.consumeUndo);
  const { toast } = useToast();
  const shownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const entry of undoStack) {
      if (shownRef.current.has(entry.id)) continue;
      shownRef.current.add(entry.id);
      const remaining = Math.max(0, entry.expiresAt - Date.now());
      toast({
        title: entry.description,
        duration: remaining,
        action: (
          <ToastAction
            altText="Отменить"
            onClick={async () => {
              const consumed = consumeUndo(entry.id);
              if (consumed) {
                try {
                  await consumed.undoFn();
                } catch (err) {
                  console.error("undo failed", err);
                }
              }
            }}
          >
            Отменить
          </ToastAction>
        ),
      });
    }
  }, [undoStack, toast, consumeUndo]);

  return null;
}
