import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { type Character } from "@shared/schema";

// Client-side deepMerge: applies all source keys including undefined
// (differs from server version which skips undefined values)
function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = target[key];
    if (
      sourceValue !== null &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  }
  return result;
}

interface ShareData {
  shareToken: string | null;
  isShared: boolean;
}

interface CharacterContextValue {
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

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function CharacterProvider({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [localChanges, setLocalChanges] = useState<Partial<Character>>({});
  const [copied, setCopied] = useState(false);

  const pendingChangesRef = useRef<Partial<Character>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  // Redirect to login if unauthenticated
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

  const { data: character, isLoading, error } = useQuery<Character>({
    queryKey: ["/api/characters", id],
    enabled: !!id && isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Character>) =>
      apiRequest("PATCH", `/api/characters/${id}`, updates),
    onMutate: async (updates: Partial<Character>) => {
      await queryClient.cancelQueries({ queryKey: ["/api/characters", id] });
      const previous = queryClient.getQueryData<Character>(["/api/characters", id]);
      if (previous) {
        queryClient.setQueryData(["/api/characters", id], deepMerge(previous, updates));
      }
      return { previous };
    },
    onSuccess: async (res: Response) => {
      try {
        const updated: Character = await res.json();
        if (updated?.id) {
          queryClient.setQueryData(["/api/characters", id], updated);
        }
      } catch {}
    },
    onError: (_err, _updates, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["/api/characters", id], context.previous);
      }
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        variant: "destructive",
      });
    },
    onSettled: () => {
      isSavingRef.current = false;
      queryClient.invalidateQueries({ queryKey: ["/api/characters", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
    },
  });

  const shareQuery = useQuery<ShareData>({
    queryKey: ["/api/characters", id, "share"],
    enabled: !!id && isAuthenticated,
  });

  const enableShareMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/characters/${id}/share`),
    onSuccess: async (res) => {
      const data = await res.json();
      queryClient.setQueryData(["/api/characters", id, "share"], {
        shareToken: data.shareToken,
        isShared: true,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось включить общий доступ", variant: "destructive" });
    },
  });

  const disableShareMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/characters/${id}/share`),
    onSuccess: () => {
      queryClient.setQueryData(["/api/characters", id, "share"], {
        shareToken: null,
        isShared: false,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
    },
    onError: () => {
      toast({ title: "Ошибка", description: "Не удалось отключить общий доступ", variant: "destructive" });
    },
  });

  const shareUrl = shareQuery.data?.shareToken
    ? `${window.location.origin}/shared/${shareQuery.data.shareToken}`
    : null;

  const handleToggleShare = useCallback((enabled: boolean) => {
    if (enabled) {
      enableShareMutation.mutate();
    } else {
      disableShareMutation.mutate();
    }
  }, [enableShareMutation, disableShareMutation]);

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

  const flushPendingChanges = useCallback(() => {
    if (Object.keys(pendingChangesRef.current).length > 0 && !isSavingRef.current) {
      isSavingRef.current = true;
      const changes = pendingChangesRef.current;
      pendingChangesRef.current = {};
      updateMutation.mutate(changes);
    }
  }, [updateMutation]);

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(flushPendingChanges, 500);
  }, [flushPendingChanges]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (Object.keys(pendingChangesRef.current).length > 0) flushPendingChanges();
    };
  }, [flushPendingChanges]);

  const currentCharacter = character ? (deepMerge(character, localChanges) as Character) : null;

  const handleChange = useCallback(
    (updates: Partial<Character>) => {
      if (isEditing) {
        setLocalChanges((prev) => deepMerge(prev, updates));
      } else {
        if (character) {
          const optimistic = deepMerge(
            character,
            deepMerge(pendingChangesRef.current, updates),
          );
          queryClient.setQueryData(["/api/characters", id], optimistic);
        }
        pendingChangesRef.current = deepMerge(pendingChangesRef.current, updates);
        scheduleSave();
      }
    },
    [isEditing, character, id, scheduleSave],
  );

  const saveChanges = useCallback(async () => {
    if (Object.keys(localChanges).length > 0) {
      if (character) {
        queryClient.setQueryData(
          ["/api/characters", id],
          deepMerge(character, localChanges),
        );
      }
      await updateMutation.mutateAsync(localChanges);
      setLocalChanges({});
    }
    setIsEditing(false);
  }, [character, id, localChanges, updateMutation]);

  return (
    <CharacterContext.Provider
      value={{
        character: currentCharacter,
        isLoading: isAuthLoading || isLoading,
        error: error as Error | null,
        isEditing,
        setIsEditing,
        handleChange,
        saveChanges,
        isSaving: updateMutation.isPending,
        shareData: shareQuery.data,
        shareUrl,
        handleToggleShare,
        handleCopyShareLink,
        copied,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter(): CharacterContextValue {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error("useCharacter must be used within CharacterProvider");
  return ctx;
}
