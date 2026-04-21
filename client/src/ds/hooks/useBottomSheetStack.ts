/**
 * Zustand-стек открытых BottomSheet'ов. Несколько sheet'ов могут быть
 * активны одновременно (level-up over sheet-tab, damage sheet over rest).
 * Topmost — последний в массиве. Backdrop общий (рендерится только для
 * topmost'а).
 *
 * Использование (внутри экрана):
 *   const push = useBottomSheetStack(s => s.push);
 *   push({ id: "damage", render: () => <DamageSheet /> });
 *
 * Или проще — компонент сам рендерит <BottomSheet open={open}/> локально
 * без стека. Стек нужен только для multi-layered flows (wizard over sheet).
 */
import { create } from "zustand";

export interface BottomSheetEntry {
  id: string;
  render: () => React.ReactNode;
}

interface BottomSheetStackState {
  stack: BottomSheetEntry[];
  push: (entry: BottomSheetEntry) => void;
  pop: (id?: string) => void;
  replace: (id: string, entry: BottomSheetEntry) => void;
  clear: () => void;
  isOpen: (id: string) => boolean;
}

export const useBottomSheetStack = create<BottomSheetStackState>((set, get) => ({
  stack: [],
  push: (entry) =>
    set((state) => {
      // Если уже есть с таким id — не дублируем, просто перемещаем наверх.
      const withoutExisting = state.stack.filter((e) => e.id !== entry.id);
      return { stack: [...withoutExisting, entry] };
    }),
  pop: (id) =>
    set((state) => {
      if (!id) return { stack: state.stack.slice(0, -1) };
      return { stack: state.stack.filter((e) => e.id !== id) };
    }),
  replace: (id, entry) =>
    set((state) => ({
      stack: state.stack.map((e) => (e.id === id ? entry : e)),
    })),
  clear: () => set({ stack: [] }),
  isOpen: (id) => get().stack.some((e) => e.id === id),
}));
