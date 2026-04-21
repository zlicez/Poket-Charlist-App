/**
 * Замена CharacterContext: собирает всё состояние персонажа в одном хуке,
 * вызываемом в корне экрана (CharacterSheet). Context-обёртки больше нет —
 * прокидываем значения в children обычными props'ами.
 *
 * Внутри разведено:
 * - `useQuery` по character(id) — серверная правда.
 * - `useDebouncedCharacterUpdate` — дебаунсовая дорожка (для text-fields
 *   и всех неперевёденных consumers, см. feedback_mutation_architecture).
 * - Edit-mode накопитель (`localChanges` + `saveChanges`) — режимная логика,
 *   применяется только когда isEditing=true.
 * - Share (query + 2 mutations + copy link).
 *
 * Discrete-хуки (useApplyDamage, useSetInspiration, …) этот хук НЕ оборачивает —
 * они остаются отдельными вызовами на уровне экрана.
 */
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@shared/constants";
import type { Character } from "@shared/schema";

import { disableShare, enableShare } from "@/lib/api/characters";
import { deepMerge } from "@/lib/deep-merge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedCharacterUpdate } from "./useDebouncedCharacterUpdate";

export interface ShareData {
  shareToken: string | null;
  isShared: boolean;
}

export interface CharacterState {
  character: Character | null;
  isLoading: boolean;
  error: Error | null;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  handleChange: (updates: Partial<Character>) => void;
  saveChanges: () => Promise<void>;
  isSaving: boolean;
  shareData: ShareData | undefined;
  shareUrl: string | null;
  handleToggleShare: (enabled: boolean) => void;
  handleCopyShareLink: () => Promise<void>;
  copied: boolean;
}

export function useCharacterState(id: string): CharacterState {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [localChanges, setLocalChanges] = useState<Partial<Character>>({});
  const [copied, setCopied] = useState(false);

  // Redirect to login if unauthenticated (раньше жило в CharacterProvider).
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Перенаправление на страницу входа...",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isAuthenticated, isAuthLoading, toast, setLocation]);

  const {
    data: character,
    isLoading,
    error,
  } = useQuery<Character>({
    queryKey: queryKeys.character(id),
    enabled: !!id && isAuthenticated,
  });

  const debounced = useDebouncedCharacterUpdate({ id });

  // ── Share ─────────────────────────────────────────────────────────────────
  const shareQuery = useQuery<ShareData>({
    queryKey: queryKeys.characterShare(id),
    enabled: !!id && isAuthenticated,
  });

  const enableShareMutation = useMutation({
    mutationFn: () => enableShare(id),
    onSuccess: ({ shareToken }) => {
      queryClient.setQueryData(queryKeys.characterShare(id), {
        shareToken,
        isShared: true,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.charactersList() });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось включить общий доступ",
        variant: "destructive",
      });
    },
  });

  const disableShareMutation = useMutation({
    mutationFn: () => disableShare(id),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.characterShare(id), {
        shareToken: null,
        isShared: false,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.charactersList() });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отключить общий доступ",
        variant: "destructive",
      });
    },
  });

  const shareUrl = shareQuery.data?.shareToken
    ? `${window.location.origin}/shared/${shareQuery.data.shareToken}`
    : null;

  const handleToggleShare = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        enableShareMutation.mutate();
      } else {
        disableShareMutation.mutate();
      }
    },
    [enableShareMutation, disableShareMutation],
  );

  const handleCopyShareLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Ссылка скопирована" });
    } catch {
      toast({ title: "Не удалось скопировать", variant: "destructive" });
    }
  }, [shareUrl, toast]);

  // ── Change handlers ──────────────────────────────────────────────────────
  //
  // В edit-mode все правки складываются в локальный state и не улетают на
  // сервер до `saveChanges`. В play-mode — уходят через дебаунсовую дорожку.
  // Discrete actions (HP/inspiration/deathSaves/...) сюда не ходят вовсе.
  const handleChange = useCallback(
    (updates: Partial<Character>) => {
      if (isEditing) {
        setLocalChanges((prev) => deepMerge(prev, updates));
      } else {
        debounced.scheduleUpdate(updates);
      }
    },
    [isEditing, debounced],
  );

  const saveChanges = useCallback(async () => {
    if (Object.keys(localChanges).length > 0) {
      if (character) {
        queryClient.setQueryData(
          queryKeys.character(id),
          deepMerge(character, localChanges),
        );
      }
      // Используем дебаунс-мутацию: scheduleUpdate + flush гарантируют, что
      // накопленное в пендинг-рефе (если было) и localChanges уйдут одним
      // PATCH'ем. Поскольку scheduleUpdate тоже мержит в pending, пост flush
      // сервер получит полный diff.
      debounced.scheduleUpdate(localChanges);
      await debounced.flush();
      setLocalChanges({});
    }
    setIsEditing(false);
  }, [character, id, localChanges, debounced, queryClient]);

  // Merged view: серверные данные + аккумулированные правки edit-mode.
  const currentCharacter = character
    ? (deepMerge(character, localChanges) as Character)
    : null;

  return {
    character: currentCharacter,
    isLoading: isAuthLoading || isLoading,
    error: error as Error | null,
    isEditing,
    setIsEditing,
    handleChange,
    saveChanges,
    isSaving: debounced.isSaving,
    shareData: shareQuery.data,
    shareUrl,
    handleToggleShare,
    handleCopyShareLink,
    copied,
  };
}
