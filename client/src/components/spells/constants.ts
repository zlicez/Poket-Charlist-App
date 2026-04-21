import type { Spellcasting } from "@shared/schema";

export const SPELL_LEVEL_LABELS: Record<number, string> = {
  0: "Заговоры",
  1: "1 уровень",
  2: "2 уровень",
  3: "3 уровень",
  4: "4 уровень",
  5: "5 уровень",
  6: "6 уровень",
  7: "7 уровень",
  8: "8 уровень",
  9: "9 уровень",
};

export const DEFAULT_SPELLCASTING: Spellcasting = {
  ability: "INT",
  spellSlots: Array.from({ length: 9 }, () => ({ max: 0, used: 0 })),
  pactMagic: { slotLevel: 1, max: 0, used: 0 },
  spells: [],
};

// D&D 5e максимум ячеек на каждом уровне: индекс 0 = 1 уровень.
export const MAX_SLOTS_PER_LEVEL = [4, 3, 3, 3, 3, 2, 2, 1, 1];
