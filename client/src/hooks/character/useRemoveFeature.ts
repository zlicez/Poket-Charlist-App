/**
 * Discrete: удалить способность по id через keyed op `removeItem`.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character } from "@shared/schema";

import { applyCharacterOps } from "@/lib/api/characters";

export function useRemoveFeature(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (featureId: string) => {
      return applyCharacterOps(characterId, [
        { op: "removeItem", collection: "features", id: featureId },
      ]);
    },
    onMutate: async (featureId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        queryClient.setQueryData(queryKeys.character(characterId), {
          ...prev,
          features: (prev.features ?? []).filter((f) => f.id !== featureId),
        });
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
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
