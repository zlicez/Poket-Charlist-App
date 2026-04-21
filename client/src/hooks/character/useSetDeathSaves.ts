import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character, DeathSaves } from "@shared/schema";

import { updateCharacter } from "@/lib/api/characters";
import { useCharacterStore } from "@/stores/characterStore";

const UNDO_WINDOW_MS = 5000;

const deathSavesEqual = (a: DeathSaves, b: DeathSaves): boolean =>
  a.successes === b.successes && a.failures === b.failures;

export function useSetDeathSaves(characterId: string) {
  const queryClient = useQueryClient();
  const pushUndo = useCharacterStore((s) => s.pushUndo);

  return useMutation({
    mutationFn: async (next: DeathSaves) => {
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      await updateCharacter(characterId, { deathSaves: next });
      return { prev: prev?.deathSaves, next };
    },
    onMutate: async (next: DeathSaves) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        queryClient.setQueryData(queryKeys.character(characterId), {
          ...prev,
          deathSaves: next,
        });
      }
      return { prev };
    },
    onError: (_err, _next, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(queryKeys.character(characterId), ctx.prev);
      }
    },
    onSuccess: ({ prev, next }) => {
      if (!prev || deathSavesEqual(prev, next)) return;
      pushUndo({
        id: `death-saves-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: "setDeathSaves",
        characterId,
        description: `Спасброски смерти: ${next.successes}/${next.failures}`,
        expiresAt: Date.now() + UNDO_WINDOW_MS,
        undoFn: async () => {
          await updateCharacter(characterId, { deathSaves: prev });
          const latest = queryClient.getQueryData<Character>(
            queryKeys.character(characterId),
          );
          if (latest) {
            queryClient.setQueryData(queryKeys.character(characterId), {
              ...latest,
              deathSaves: prev,
            });
          }
        },
      });
    },
  });
}
