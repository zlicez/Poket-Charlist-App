/**
 * Discrete-дорожка: режим play/edit персонажа. Хранится в character.ui_state.mode
 * (схема добавлена в Блоке 1). Последний write на любом устройстве выигрывает.
 *
 * Flow:
 *   1. Читаем из query cache (character.ui_state.mode) → fallback "play".
 *   2. setMode → optimistic setQueryData + PATCH { ui_state: { ...prev, mode: next } }.
 *   3. onError → invalidate (пусть сервер расскажет правду).
 *
 * Использование: usePlayMode(characterId) внутри любого DS-экрана,
 * чтобы прочитать/поменять режим.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character, PlayMode } from "@shared/schema";

import { updateCharacter } from "@/lib/api/characters";

export interface PlayModeState {
  mode: PlayMode;
  setMode: (next: PlayMode) => void;
  toggleMode: () => void;
  isPending: boolean;
}

export function usePlayMode(characterId: string): PlayModeState {
  const queryClient = useQueryClient();
  const { data: character } = useQuery<Character>({
    queryKey: queryKeys.character(characterId),
    enabled: !!characterId,
  });

  const mode: PlayMode = character?.ui_state?.mode ?? "play";

  const mutation = useMutation({
    mutationFn: async (next: PlayMode) => {
      return updateCharacter(characterId, {
        ui_state: { ...(character?.ui_state ?? {}), mode: next },
      });
    },
    onMutate: async (next: PlayMode) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        queryClient.setQueryData(queryKeys.character(characterId), {
          ...prev,
          ui_state: { ...(prev.ui_state ?? {}), mode: next },
        });
      }
      return { prev };
    },
    onError: (_err, _next, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(queryKeys.character(characterId), ctx.prev);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.character(characterId) });
    },
  });

  return {
    mode,
    setMode: mutation.mutate,
    toggleMode: () => mutation.mutate(mode === "play" ? "edit" : "play"),
    isPending: mutation.isPending,
  };
}
