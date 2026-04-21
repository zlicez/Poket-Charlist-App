/**
 * Discrete: завершение короткого или длинного отдыха одним PATCH'ем.
 * В отличие от дебаунсовой дорожки — сохраняется мгновенно при закрытии
 * диалога. ShortRestDialog и LongRestDialog оба используют этот хук через
 * опциональный prop — без него fallback на общий onChange (debounce).
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character } from "@shared/schema";

import { updateCharacter } from "@/lib/api/characters";

export function useCommitRest(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<Character>) =>
      updateCharacter(characterId, updates),
    onMutate: async (updates: Partial<Character>) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        queryClient.setQueryData(queryKeys.character(characterId), {
          ...prev,
          ...updates,
          // Spellcasting объект восстановления длинного отдыха шлётся целиком —
          // нужно мержить, не переписывать. Но в текущих callsites LongRestDialog
          // уже формирует полный объект spellcasting. Остальные поля — плоские.
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
