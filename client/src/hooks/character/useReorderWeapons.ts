/**
 * Discrete: переупорядочить коллекцию weapons. Клиент передаёт полный список
 * id в новом порядке; сервер валидирует, что это перестановка существующих id.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character } from "@shared/schema";

import { applyCharacterOps } from "@/lib/api/characters";

export function useReorderWeapons(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      return applyCharacterOps(characterId, [
        { op: "reorderItems", collection: "weapons", orderedIds },
      ]);
    },
    onMutate: async (orderedIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        const byId = new Map((prev.weapons ?? []).map((w) => [w.id, w] as const));
        const next = orderedIds
          .map((id) => byId.get(id))
          .filter((w): w is NonNullable<typeof w> => !!w);
        queryClient.setQueryData(queryKeys.character(characterId), { ...prev, weapons: next });
      }
      return { prev };
    },
    onError: (_err, _orderedIds, ctx) => {
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
