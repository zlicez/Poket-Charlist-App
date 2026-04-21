import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character } from "@shared/schema";

import { updateCharacter } from "@/lib/api/characters";

export function useSetInspiration(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: boolean) => {
      await updateCharacter(characterId, { inspiration: value });
      return value;
    },
    onMutate: async (value: boolean) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        queryClient.setQueryData(queryKeys.character(characterId), {
          ...prev,
          inspiration: value,
        });
      }
      return { prev };
    },
    onError: (_err, _value, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(queryKeys.character(characterId), ctx.prev);
      }
    },
  });
}
