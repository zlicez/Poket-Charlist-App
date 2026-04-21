/**
 * Дебаунсовая дорожка мутаций для текстовых полей и других изменений
 * «печатаемого» ритма (notes, appearance, allies, name, background...).
 * Накапливает частичные правки в ref, делает optimistic setQueryData
 * немедленно, а настоящий PATCH шлёт через `debounceMs` тишины.
 *
 * См. feedback_mutation_architecture: две дорожки — discrete (±1 HP,
 * toggle slot) со своей useMutation и undo, и debounced (этот хук) для
 * печатаемых полей.
 *
 * Главное: hook **не знает** про edit-mode — он просто дебаунсит любые
 * изменения. Режимную логику «копить в localChanges и flush на exit»
 * держит `useCharacterState`.
 */
import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys, CHARACTERS_LIST_URL } from "@shared/constants";
import type { Character } from "@shared/schema";

import { updateCharacter } from "@/lib/api/characters";
import { deepMerge } from "@/lib/deep-merge";
import { useToast } from "@/hooks/use-toast";

export interface DebouncedCharacterUpdate {
  /** Запланировать слияние этих полей с текущим кешем; реальный PATCH через debounceMs тишины. */
  scheduleUpdate: (updates: Partial<Character>) => void;
  /** Немедленно отправить накопленное. Возвращает promise, завершающийся после ответа сервера. */
  flush: () => Promise<void>;
  isSaving: boolean;
}

interface UseDebouncedCharacterUpdateArgs {
  id: string;
  debounceMs?: number;
}

export function useDebouncedCharacterUpdate({
  id,
  debounceMs = 500,
}: UseDebouncedCharacterUpdateArgs): DebouncedCharacterUpdate {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const pendingRef = useRef<Partial<Character>>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  const mutation = useMutation({
    mutationFn: (updates: Partial<Character>) => updateCharacter(id, updates),
    onSuccess: (updated) => {
      if (updated && "id" in updated && updated.id) {
        queryClient.setQueryData(queryKeys.character(id), updated);
      }
    },
    onError: () => {
      // Серверная правда перечитается — откатывать по context.previous тут
      // опасно, т.к. в интервале между optimistic и ошибкой юзер мог
      // напечатать ещё. Invalidate — безопаснее.
      queryClient.invalidateQueries({ queryKey: queryKeys.character(id) });
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        variant: "destructive",
      });
    },
    onSettled: () => {
      isSavingRef.current = false;
      queryClient.invalidateQueries({ queryKey: [CHARACTERS_LIST_URL] });
    },
  });

  const flush = useCallback(async (): Promise<void> => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (isSavingRef.current) return;
    if (Object.keys(pendingRef.current).length === 0) return;
    isSavingRef.current = true;
    const updates = pendingRef.current;
    pendingRef.current = {};
    try {
      await mutation.mutateAsync(updates);
    } catch {
      // onError уже обработал toast + invalidate
    }
  }, [mutation]);

  const scheduleUpdate = useCallback(
    (updates: Partial<Character>) => {
      const prev = queryClient.getQueryData<Character>(queryKeys.character(id));
      if (prev) {
        queryClient.setQueryData(
          queryKeys.character(id),
          deepMerge(prev, deepMerge(pendingRef.current, updates)),
        );
      }
      pendingRef.current = deepMerge(pendingRef.current, updates);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        void flush();
      }, debounceMs);
    },
    [id, queryClient, flush, debounceMs],
  );

  // Flush on unmount: не теряем набранный, но не отправленный текст.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (Object.keys(pendingRef.current).length > 0) {
        void flush();
      }
    };
  }, [flush]);

  return {
    scheduleUpdate,
    flush,
    isSaving: mutation.isPending,
  };
}
