/**
 * Discrete: удалить оружие по id через keyed op `removeItem`.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character } from "@shared/schema";

import { applyCharacterOps } from "@/lib/api/characters";

export function useRemoveWeapon(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weaponId: string) => {
      return applyCharacterOps(characterId, [
        { op: "removeItem", collection: "weapons", id: weaponId },
      ]);
    },
    onMutate: async (weaponId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        queryClient.setQueryData(queryKeys.character(characterId), {
          ...prev,
          weapons: (prev.weapons ?? []).filter((w) => w.id !== weaponId),
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
