/**
 * Discrete: атомарный батч keyed-op'ов над коллекцией equipment.
 * EquipmentSystem формирует multi-op батчи для сценариев вроде «надеть один
 * доспех → снять другой», где нужна атомарность: либо оба изменения
 * применяются, либо ни одно. Одиночные add/remove/reorder — это батчи из
 * одного элемента.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type {
  Character,
  CollectionOp,
  Equipment,
} from "@shared/schema";

import { applyCharacterOps } from "@/lib/api/characters";

// Оптимистичное применение ops к локальной копии коллекции — мирроит
// server/storage.applyOpsToCharacter, но ограничен equipment.
function applyEquipmentOpsLocally(
  equipment: Equipment[],
  ops: CollectionOp[],
): Equipment[] {
  let working = equipment;
  for (const op of ops) {
    if (op.collection !== "equipment") continue;
    if (op.op === "upsertItem") {
      const idx = working.findIndex((e) => e.id === op.id);
      if (idx >= 0) {
        working = working.map((e, i) =>
          i === idx ? ({ ...e, ...op.patch, id: op.id } as Equipment) : e,
        );
      } else {
        working = [...working, { ...(op.patch as Equipment), id: op.id }];
      }
    } else if (op.op === "removeItem") {
      working = working.filter((e) => e.id !== op.id);
    } else if (op.op === "reorderItems") {
      const byId = new Map(working.map((e) => [e.id, e] as const));
      working = op.orderedIds
        .map((id) => byId.get(id))
        .filter((e): e is Equipment => !!e);
    }
  }
  return working;
}

export function useEquipmentOps(characterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ops: CollectionOp[]) => {
      if (ops.length === 0) return null;
      return applyCharacterOps(characterId, ops);
    },
    onMutate: async (ops: CollectionOp[]) => {
      if (ops.length === 0) return {};
      await queryClient.cancelQueries({ queryKey: queryKeys.character(characterId) });
      const prev = queryClient.getQueryData<Character>(queryKeys.character(characterId));
      if (prev) {
        const nextEquipment = applyEquipmentOpsLocally(prev.equipment ?? [], ops);
        queryClient.setQueryData(queryKeys.character(characterId), {
          ...prev,
          equipment: nextEquipment,
        });
      }
      return { prev };
    },
    onError: (_err, _ops, ctx) => {
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

export { applyEquipmentOpsLocally as __applyEquipmentOpsLocally };
