/**
 * Discrete: добавить или отредактировать заклинание. Коллекция "spells"
 * на сервере адресуется к `spellcasting.spells` — `applyOpsToCharacter`
 * знает про эту вложенность. Для не-кастера (spellcasting === undefined)
 * сервер вернёт 400 invalid; на клиенте этот хук вызывать нужно только
 * когда каст-инг возможен (SpellsSection сам рендерится по флагу).
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character, Spell } from "@shared/schema";

import { applyCharacterOps } from "@/lib/api/characters";

interface UpsertSpellInput {
  id: string;
  patch: Partial<Spell>;
}

export function useUpsertSpell(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patch }: UpsertSpellInput) => {
      return applyCharacterOps(characterId, [
        {
          op: "upsertItem",
          collection: "spells",
          id,
          patch: patch as Record<string, unknown>,
        },
      ]);
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev?.spellcasting) {
        const spells = prev.spellcasting.spells ?? [];
        const idx = spells.findIndex((s) => s.id === id);
        const next =
          idx >= 0
            ? spells.map((s, i) =>
                i === idx ? ({ ...s, ...patch, id } as Spell) : s,
              )
            : [...spells, { ...(patch as Spell), id }];
        queryClient.setQueryData(queryKeys.character(characterId), {
          ...prev,
          spellcasting: { ...prev.spellcasting, spells: next },
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
