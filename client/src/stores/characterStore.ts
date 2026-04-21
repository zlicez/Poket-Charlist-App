/**
 * Zustand-стор UI-состояния персонажа и undo-дорожки.
 *
 * Разделение ответственности (см. feedback_mutation_architecture.md):
 * - React Query владеет серверными данными (полный `Character` в кеше).
 * - Этот стор владеет UI-состоянием (play/edit, активный таб, стек sheet'ов)
 *   и **очередью undo-действий** для дискретной дорожки мутаций (damage,
 *   heal, slot toggle, HD spend и т.д.).
 *
 * Дебаунсовая дорожка (name, notes, backstory...) сюда не ходит — она остаётся
 * в React Query mutation с debounced flush.
 *
 * Пока — скелет. Конкретные actions для дискретных мутаций (`applyDamage`,
 * `toggleSlot`, ...) переедут сюда в следующем батче вместе с переписью
 * CharacterContext на два track'а и его удалением.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { LS_KEYS } from "@shared/constants";
import type { PlayMode } from "@shared/schema";

export type { PlayMode };

/**
 * Запись в undo-stack'е. `undoFn` — обратная мутация (damage → heal той же
 * величины; НЕ «вырезать дельту из общего буфера»). Когда тост истекает
 * (expiresAt < Date.now()), запись вычищается `sweepExpiredUndo`.
 */
export interface UndoEntry {
  id: string;
  type: string;
  characterId: string;
  description?: string;
  undoFn: () => Promise<void> | void;
  createdAt: number;
  expiresAt: number;
}

interface CharacterStoreState {
  // ── UI state ─────────────────────────────────────────────────────────────
  mode: PlayMode;
  setMode: (next: PlayMode) => void;
  toggleMode: () => void;

  activeTab: string | null;
  setActiveTab: (tab: string | null) => void;

  // ── Undo stack для дискретных мутаций ─────────────────────────────────────
  undoStack: UndoEntry[];
  pushUndo: (entry: Omit<UndoEntry, "createdAt">) => void;
  consumeUndo: (id: string) => UndoEntry | undefined;
  sweepExpiredUndo: () => void;
  clearUndoStack: () => void;
}

export const useCharacterStore = create<CharacterStoreState>()(
  persist(
    (set, get) => ({
      mode: "play",
      setMode: (next) => set({ mode: next }),
      toggleMode: () => set((state) => ({ mode: state.mode === "play" ? "edit" : "play" })),

      activeTab: null,
      setActiveTab: (tab) => set({ activeTab: tab }),

      undoStack: [],
      pushUndo: (entry) =>
        set((state) => ({
          undoStack: [...state.undoStack, { ...entry, createdAt: Date.now() }],
        })),
      consumeUndo: (id) => {
        const current = get().undoStack;
        const entry = current.find((e) => e.id === id);
        if (!entry) return undefined;
        set({ undoStack: current.filter((e) => e.id !== id) });
        return entry;
      },
      sweepExpiredUndo: () => {
        const now = Date.now();
        set((state) => ({
          undoStack: state.undoStack.filter((e) => e.expiresAt > now),
        }));
      },
      clearUndoStack: () => set({ undoStack: [] }),
    }),
    {
      name: LS_KEYS.characterUi,
      storage: createJSONStorage(() => localStorage),
      // Персистим только UI-пилюлю mode; undoStack и activeTab — эфемерны.
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);
