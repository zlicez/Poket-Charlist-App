/**
 * Discrete: установить состояние spell slots (обычные и/или pact magic).
 * Это не keyed ops — слоты позиционны по уровню, адресуются индексом, не id.
 * Каждый клик по ячейке (Minus/Plus в SpellSlotTracker) — мгновенный PATCH
 * без debounce; дорожка отделена от text-field писарей.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character, PactMagic, SpellSlot } from "@shared/schema";

import { updateCharacter } from "@/lib/api/characters";

interface SetSpellSlotsInput {
  spellSlots?: SpellSlot[];
  pactMagic?: PactMagic;
}

export function useSetSpellSlots(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SetSpellSlotsInput) => {
      const prev = queryClient.getQueryData<Character>(
        queryKeys.character(characterId),
      );
      if (!prev?.spellcasting) {
        throw new Error("spellcasting not initialized");
      }
      return updateCharacter(characterId, {
        spellcasting: {
          ...prev.spellcasting,
          ...(input.spellSlots ? { spellSlots: input.spellSlots } : {}),
          ...(input.pactMagic ? { pactMagic: input.pactMagic } : {}),
        },
      });
    },
    onMutate: async (input: SetSpellSlotsInput) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev?.spellcasting) {
        queryClient.setQueryData(queryKeys.character(characterId), {
          ...prev,
          spellcasting: {
            ...prev.spellcasting,
            ...(input.spellSlots ? { spellSlots: input.spellSlots } : {}),
            ...(input.pactMagic ? { pactMagic: input.pactMagic } : {}),
          },
        });
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
