import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { Button } from "@/ds/primitives";
import { StatusPillLive } from "@/ds/screens/edge/StatusPillLive";
import { AccountSheet } from "@/ds/screens/auth";
import {
  CreateCharacterSheet,
  DeleteConfirmSheet,
  EmptyList,
  ImportReviewSheet,
  PopulatedList,
  type ImportReviewState,
} from "@/ds/screens/list";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  createCharacter,
  deleteCharacter,
} from "@/lib/api/characters";
import { parseLSSJson } from "@/lib/lss-import";
import {
  createDefaultCharacter,
  type Character,
  type InsertCharacter,
} from "@shared/schema";
import { queryKeys } from "@shared/constants";

/**
 * Phase H2 — DS-реализация списка персонажей. Заменяет legacy CharactersList
 * под `VITE_NEW_DS=true`.
 *
 * Поведение одинаково с legacy: create / import / delete / open. Разница
 * только в UI (DS токены, BottomSheet-основанные confirm'ы, swipe-to-reveal).
 *
 * Авторизация уже отсечена на уровне NewRouter (AuthGate + AuthScreen), сюда
 * попадает только залогиненный пользователь.
 */

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function CharactersListPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: queryKeys.charactersList(),
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [review, setReview] = useState<ImportReviewState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useMutation({
    mutationFn: async (patch: Partial<InsertCharacter>) => {
      const next = { ...createDefaultCharacter(), ...patch };
      return createCharacter(next);
    },
    onSuccess: (next) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.charactersList(),
      });
      setCreateOpen(false);
      setLocation(`/character/${next.id}/combat`);
      toast({
        title: "Создан новый персонаж",
        description: "Дополните имя, класс и способности на листе.",
      });
    },
    onError: (err) => {
      toast({
        title: "Не удалось создать персонажа",
        description: getErrorMessage(err, "Повторите попытку."),
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: (data: InsertCharacter) => createCharacter(data),
    onSuccess: (next) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.charactersList(),
      });
      setReview(null);
      setLocation(`/character/${next.id}/combat`);
      toast({
        title: "Персонаж импортирован",
        description: "Проверьте поля на листе — всё перенесено.",
      });
    },
    onError: (err) => {
      toast({
        title: "Не удалось импортировать",
        description: getErrorMessage(err, "Проверьте формат файла."),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCharacter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.charactersList(),
      });
      setDeleteId(null);
      toast({ title: "Персонаж удалён" });
    },
    onError: (err) => {
      toast({
        title: "Не удалось удалить",
        description: getErrorMessage(err, "Повторите попытку."),
        variant: "destructive",
      });
    },
  });

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const content = loadEvent.target?.result as string;
      try {
        const parsed = parseLSSJson(content);
        setReview({ data: parsed, filename: file.name });
      } catch (err) {
        setReview({
          filename: file.name,
          error: getErrorMessage(
            err,
            "Файл повреждён или имеет неизвестный формат.",
          ),
        });
      }
    };
    reader.onerror = () => {
      setReview({
        filename: file.name,
        error: "Не удалось прочесть файл.",
      });
    };
    reader.readAsText(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImportConfirm = () => {
    if (!review?.data) return;
    importMutation.mutate(review.data);
  };

  const deleteTarget = deleteId
    ? characters.find((c) => c.id === deleteId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 bg-paper-card/95 backdrop-blur border-b border-ink-200">
        <div className="max-w-[480px] mx-auto px-3.5 py-2.5 flex items-center gap-2">
          <div className={cn(typeClass("label"), "text-ruby flex-1")}>
            POCKET CHARLIST
          </div>
          <StatusPillLive />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAccountOpen(true)}
            data-testid="header-account"
            aria-label="Аккаунт"
          >
            {user?.firstName || user?.email?.split("@")[0] || "Аккаунт"}
          </Button>
        </div>
      </header>

      <main className="pb-24">
        {isLoading ? (
          <div
            className="px-6 py-16 text-center"
            data-testid="list-loading"
          >
            <div
              className={cn(typeClass("body-sm"), "text-ink-500")}
            >
              Загружаем ваших героев…
            </div>
          </div>
        ) : characters.length === 0 ? (
          <EmptyList
            onCreate={() => setCreateOpen(true)}
            onImport={handleImportClick}
            isCreating={createMutation.isPending}
            isImporting={importMutation.isPending}
          />
        ) : (
          <PopulatedList
            characters={characters}
            onOpenCharacter={(id) =>
              setLocation(`/character/${id}/combat`)
            }
            onDeleteRequest={(id) => setDeleteId(id)}
            onCreate={() => setCreateOpen(true)}
            onImport={handleImportClick}
            isCreating={createMutation.isPending}
            isImporting={importMutation.isPending}
          />
        )}
      </main>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
        data-testid="list-file-input"
      />

      <CreateCharacterSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onConfirm={(name) => createMutation.mutate({ name })}
        isCreating={createMutation.isPending}
      />

      <ImportReviewSheet
        open={review !== null}
        onOpenChange={(open) => {
          if (!open) setReview(null);
        }}
        review={review ?? {}}
        onConfirm={handleImportConfirm}
        onPickAnother={handleImportClick}
        isConfirming={importMutation.isPending}
      />

      <DeleteConfirmSheet
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        character={deleteTarget}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
        }}
        isDeleting={deleteMutation.isPending}
      />

      <AccountSheet open={accountOpen} onOpenChange={setAccountOpen} />
    </div>
  );
}
