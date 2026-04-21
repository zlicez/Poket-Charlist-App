/**
 * Discrete: удалить заклинание по id через keyed op `removeItem`.
 * Коллекция `spells` = `spellcasting.spells` (см. useUpsertSpell).
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character } from "@shared/schema";

import { applyCharacterOps } from "@/lib/api/characters";

export function useRemoveSpell(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (spellId: string) => {
      return applyCharacterOps(characterId, [
        { op: "removeItem", collection: "spells", id: spellId },
      ]);
    },
    onMutate: async (spellId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev?.spellcasting) {
        queryClient.setQueryData(queryKeys.character(characterId), {
          ...prev,
          spellcasting: {
            ...prev.spellcasting,
            spells: (prev.spellcasting.spells ?? []).filter((s) => s.id !== spellId),
          },
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
