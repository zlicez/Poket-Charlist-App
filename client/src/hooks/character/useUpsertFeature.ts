/**
 * Discrete: добавить или отредактировать способность (feature) через keyed op
 * `upsertItem` на коллекцию `features`.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character, Feature } from "@shared/schema";

import { applyCharacterOps } from "@/lib/api/characters";

interface UpsertFeatureInput {
  id: string;
  patch: Partial<Feature>;
}

export function useUpsertFeature(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patch }: UpsertFeatureInput) => {
      return applyCharacterOps(characterId, [
        { op: "upsertItem", collection: "features", id, patch: patch as Record<string, unknown> },
      ]);
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        const features = prev.features ?? [];
        const idx = features.findIndex((f) => f.id === id);
        const next =
          idx >= 0
            ? features.map((f, i) => (i === idx ? ({ ...f, ...patch, id } as Feature) : f))
            : [...features, { ...(patch as Feature), id }];
        queryClient.setQueryData(queryKeys.character(characterId), { ...prev, features: next });
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
