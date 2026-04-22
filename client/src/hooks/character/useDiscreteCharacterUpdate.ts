/**
 * Generic discrete PATCH — одной мутацией переносит любой Partial<Character>
 * на сервер. В отличие от дебаунсовой дорожки (`useDebouncedCharacterUpdate`)
 * — сохраняется мгновенно без таймера.
 *
 * Применяется для действий, которые должны быть зафиксированы сразу:
 *   - short / long rest (все поля восстановления одним PATCH'ем)
 *   - level-up apply (классы + maxHp + hitDiceRemaining + proficiencyBonus)
 *   - race picker apply (раса + subrace + языковой выбор + ability bonuses)
 *
 * Был известен как `useCommitRest` до Phase J — переименован, чтобы имя
 * отражало фактический generic-контракт, а не исторический first callsite.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character } from "@shared/schema";

import { updateCharacter } from "@/lib/api/characters";

export function useDiscreteCharacterUpdate(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<Character>) =>
      updateCharacter(characterId, updates),
    onMutate: async (updates: Partial<Character>) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.character(characterId),
      });
      const prev = queryClient.getQueryData<Character>(
        queryKeys.character(characterId),
      );
      if (prev) {
        queryClient.setQueryData(queryKeys.character(characterId), {
          ...prev,
          ...updates,
          // Spellcasting для длинного отдыха шлётся целиком — callsite сам
          // формирует полный substate. Остальные поля — плоские.
        });
      }
      return { prev };
    },
    onError: (_err, _updates, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(queryKeys.character(characterId), ctx.prev);
      }
    },
    onSuccess: (updated) => {
      if (updated) {
        queryClient.setQueryData(queryKeys.character(characterId), updated);
      }
    },
  });
}
