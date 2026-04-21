/**
 * Дискретная мутация «установить временные очки здоровья». По правилам D&D 5e
 * temp HP не складываются — новое значение заменяет старое, если оно больше,
 * иначе остаётся прежнее. Эту политику клиент НЕ навязывает: hook
 * принимает финальное значение (UI решает, применять ли правило «больше —
 * лучше» или дать игроку выбор).
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character } from "@shared/schema";

import { updateCharacter } from "@/lib/api/characters";
import { useCharacterStore } from "@/stores/characterStore";

const UNDO_WINDOW_MS = 5000;

export function useSetTempHp(characterId: string) {
  const queryClient = useQueryClient();
  const pushUndo = useCharacterStore((s) => s.pushUndo);

  return useMutation({
    mutationFn: async (tempHp: number) => {
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (!prev) throw new Error("character missing from cache");
      const clamped = Math.max(0, tempHp);
      await updateCharacter(characterId, { tempHp: clamped });
      return { prevTempHp: prev.tempHp, newTempHp: clamped };
    },
    onMutate: async (tempHp: number) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        queryClient.setQueryData(queryKeys.character(characterId), {
          ...prev,
          tempHp: Math.max(0, tempHp),
        });
      }
      return { prev };
    },
    onError: (_err, _temp, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(queryKeys.character(characterId), ctx.prev);
      }
    },
    onSuccess: ({ prevTempHp, newTempHp }) => {
      if (prevTempHp === newTempHp) return;
      pushUndo({
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "setTempHp",
        characterId,
        description: `Временные HP: ${newTempHp}`,
        expiresAt: Date.now() + UNDO_WINDOW_MS,
        undoFn: async () => {
          await updateCharacter(characterId, { tempHp: prevTempHp });
          const latest = queryClient.getQueryData<Character>(queryKeys.character(characterId));
          if (latest) {
            queryClient.setQueryData(queryKeys.character(characterId), {
              ...latest,
              tempHp: prevTempHp,
            });
          }
        },
      });
    },
  });
}
