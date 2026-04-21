/**
 * Дискретная мутация «вылечить». Симметрична useApplyDamage.
 * Heal не может превысить maxHp и не влияет на tempHp.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character } from "@shared/schema";

import { updateCharacter } from "@/lib/api/characters";
import { useCharacterStore } from "@/stores/characterStore";

const UNDO_WINDOW_MS = 5000;

function applyHealTo(
  character: Pick<Character, "currentHp" | "maxHp">,
  amount: number,
): { currentHp: number } {
  return { currentHp: Math.min(character.maxHp, character.currentHp + amount) };
}

export function useApplyHeal(characterId: string) {
  const queryClient = useQueryClient();
  const pushUndo = useCharacterStore((s) => s.pushUndo);

  return useMutation({
    mutationFn: async (amount: number) => {
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (!prev) throw new Error("character missing from cache");
      const next = applyHealTo(prev, amount);
      await updateCharacter(characterId, next);
      return { amount, appliedDelta: next.currentHp - prev.currentHp };
    },
    onMutate: async (amount: number) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        const next = applyHealTo(prev, amount);
        queryClient.setQueryData(queryKeys.character(characterId), { ...prev, ...next });
      }
      return { prev };
    },
    onError: (_err, _amount, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(queryKeys.character(characterId), ctx.prev);
      }
    },
    onSuccess: ({ amount, appliedDelta }) => {
      // Нечего откатывать, если хил упёрся в maxHp (delta === 0) — не плодим undo.
      if (appliedDelta === 0) return;
      pushUndo({
        id: `heal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "heal",
        characterId,
        description: `Лечение ${amount}`,
        expiresAt: Date.now() + UNDO_WINDOW_MS,
        undoFn: async () => {
          // Reverse heal = damage того же размера от актуального состояния.
          // Урон сначала ест tempHp — логика единая с useApplyDamage.
          const latest = queryClient.getQueryData<Character>(queryKeys.character(characterId));
          if (!latest) return;
          const tempConsumed = Math.min(latest.tempHp, amount);
          const remaining = amount - tempConsumed;
          const next = {
            tempHp: latest.tempHp - tempConsumed,
            currentHp: Math.max(0, latest.currentHp - remaining),
          };
          await updateCharacter(characterId, next);
          queryClient.setQueryData(queryKeys.character(characterId), { ...latest, ...next });
        },
      });
    },
  });
}

export { applyHealTo as __applyHealTo };
