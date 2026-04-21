/**
 * Discrete: добавить или отредактировать оружие. Под капотом — keyed op
 * `upsertItem` на коллекцию `weapons`; никаких full-array PATCH'ей.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character, Weapon } from "@shared/schema";

import { applyCharacterOps } from "@/lib/api/characters";

interface UpsertWeaponInput {
  id: string;
  patch: Partial<Weapon>;
}

export function useUpsertWeapon(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patch }: UpsertWeaponInput) => {
      return applyCharacterOps(characterId, [
        { op: "upsertItem", collection: "weapons", id, patch: patch as Record<string, unknown> },
      ]);
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        const weapons = prev.weapons ?? [];
        const idx = weapons.findIndex((w) => w.id === id);
        const next =
          idx >= 0
            ? weapons.map((w, i) => (i === idx ? ({ ...w, ...patch, id } as Weapon) : w))
            : [...weapons, { ...(patch as Weapon), id }];
        queryClient.setQueryData(queryKeys.character(characterId), { ...prev, weapons: next });
      }
      return { prev };
    },
    onError: (_err, _input, ctx) => {
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
