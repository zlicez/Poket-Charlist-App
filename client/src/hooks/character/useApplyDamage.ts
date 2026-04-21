/**
 * Дискретная мутация «нанести урон». См. feedback_mutation_architecture.md:
 * каждый discrete action = отдельный useMutation, адресный optimistic update,
 * обратимая семантика через push в undoStack (heal той же величины).
 *
 * Логика damage: сначала поглощается `tempHp`, остаток бьёт по `currentHp`
 * (D&D 5e правило «временные очки — щит»).
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character } from "@shared/schema";

import { updateCharacter } from "@/lib/api/characters";
import { useCharacterStore } from "@/stores/characterStore";

const UNDO_WINDOW_MS = 5000;

function applyDamageTo(
  character: Pick<Character, "currentHp" | "tempHp">,
  amount: number,
): { currentHp: number; tempHp: number } {
  const tempConsumed = Math.min(character.tempHp, amount);
  const remaining = amount - tempConsumed;
  return {
    tempHp: character.tempHp - tempConsumed,
    currentHp: Math.max(0, character.currentHp - remaining),
  };
}

export function useApplyDamage(characterId: string) {
  const queryClient = useQueryClient();
  const pushUndo = useCharacterStore((s) => s.pushUndo);

  return useMutation({
    mutationFn: async (amount: number) => {
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (!prev) throw new Error("character missing from cache");
      const next = applyDamageTo(prev, amount);
      await updateCharacter(characterId, next);
      return { amount, prevSnapshot: prev };
    },
    onMutate: async (amount: number) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        const next = applyDamageTo(prev, amount);
        queryClient.setQueryData(queryKeys.character(characterId), { ...prev, ...next });
      }
      return { prev };
    },
    onError: (_err, _amount, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(queryKeys.character(characterId), ctx.prev);
      }
    },
    onSuccess: ({ amount }) => {
      pushUndo({
        id: `damage-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "damage",
        characterId,
        description: `Урон ${amount}`,
        expiresAt: Date.now() + UNDO_WINDOW_MS,
        undoFn: async () => {
          // Обратная мутация = heal той же величины от актуального состояния.
          // Поглощение temp HP на путь damage → reverse — временные HP обратно не
          // восстанавливаются (heal их не трогает); это принятый edge-case.
          const latest = queryClient.getQueryData<Character>(queryKeys.character(characterId));
          if (!latest) return;
          const healed = Math.min(latest.maxHp, latest.currentHp + amount);
          await updateCharacter(characterId, { currentHp: healed });
          queryClient.setQueryData(queryKeys.character(characterId), {
            ...latest,
            currentHp: healed,
          });
        },
      });
    },
  });
}

export { applyDamageTo as __applyDamageTo };
