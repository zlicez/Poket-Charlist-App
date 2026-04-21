import type { Spellcasting } from "@shared/schema";

export function buildSyncedSpellSlots(
  currentSlots: Spellcasting["spellSlots"],
  calculatedSlots: number[] | null,
) {
  return Array.from({ length: 9 }, (_, i) => {
    const currentSlot = currentSlots[i] ?? { max: 0, used: 0 };
    const nextMax = calculatedSlots?.[i] ?? 0;

    return {
      max: nextMax,
      used: Math.min(currentSlot.used, nextMax),
    };
  });
}

export function spellSlotsChanged(
  currentSlots: Spellcasting["spellSlots"],
  nextSlots: Spellcasting["spellSlots"],
) {
  return nextSlots.some((slot, i) => {
    const currentSlot = currentSlots[i] ?? { max: 0, used: 0 };
    return currentSlot.max !== slot.max || currentSlot.used !== slot.used;
  });
}

export function buildSyncedPactMagic(
  currentPactMagic: Spellcasting["pactMagic"],
  calculatedPactMagic: { slotLevel: number; max: number } | null,
) {
  const nextMax = calculatedPactMagic?.max ?? 0;

  return {
    slotLevel: calculatedPactMagic?.slotLevel ?? 1,
    max: nextMax,
    used: Math.min(currentPactMagic.used, nextMax),
  };
}

export function pactMagicChanged(
  currentPactMagic: Spellcasting["pactMagic"],
  nextPactMagic: Spellcasting["pactMagic"],
) {
  return (
    currentPactMagic.slotLevel !== nextPactMagic.slotLevel ||
    currentPactMagic.max !== nextPactMagic.max ||
    currentPactMagic.used !== nextPactMagic.used
  );
}

export function getLegacyPactMagicFromSpellSlots(
  currentSlots: Spellcasting["spellSlots"],
  calculatedPactMagic: { slotLevel: number; max: number } | null,
) {
  if (!calculatedPactMagic) return null;

  const nonEmptySlots = currentSlots
    .map((slot, index) => ({ slot, level: index + 1 }))
    .filter(({ slot }) => slot.max > 0);

  if (nonEmptySlots.length !== 1) return null;

  const [legacySlot] = nonEmptySlots;
  if (legacySlot.level !== calculatedPactMagic.slotLevel) return null;

  return {
    slotLevel: legacySlot.level,
    max: legacySlot.slot.max,
    used: Math.min(legacySlot.slot.used, legacySlot.slot.max),
  };
}
