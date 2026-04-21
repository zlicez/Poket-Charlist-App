import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { useRemoveSpell } from "@/hooks/character/useRemoveSpell";
import { useSetSpellSlots } from "@/hooks/character/useSetSpellSlots";
import { useUpsertSpell } from "@/hooks/character/useUpsertSpell";
import type { Character, Spell, Spellcasting } from "@shared/schema";

import { SpellListRow } from "./SpellListRow";

/**
 * S-03 — список заклинаний, сгруппированный по уровню. Заговоры — отдельной
 * секцией «Заговоры», 1-9 уровень — по секциям «N уровень (M подг.)».
 *
 * Действия:
 *   ● cantrip  → «Прочесть» (не тратит слот)
 *   ● spell    → «+1 слот» — инкремент spellSlots[level-1].used (потратить)
 *   ● dot tap  → toggle prepared (keyed op upsertItem)
 *   ● accordion open → details + кнопка удалить (removeItem)
 *
 * Cast spell through level-slot spend uses useSetSpellSlots, не keyed op.
 */

const LEVEL_LABELS: Record<number, string> = {
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

export function PreparedSpellsList({
  character,
}: {
  character: Character;
}) {
  const upsertSpell = useUpsertSpell(character.id);
  const removeSpell = useRemoveSpell(character.id);
  const setSpellSlots = useSetSpellSlots(character.id);

  const sc = character.spellcasting;

  const grouped = useMemo(() => {
    const map = new Map<number, Spell[]>();
    (sc?.spells ?? []).forEach((s) => {
      const arr = map.get(s.level) ?? [];
      arr.push(s);
      map.set(s.level, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [sc?.spells]);

  if (!sc) return null;

  if ((sc.spells ?? []).length === 0) {
    return (
      <div className="rounded-ds-md border border-dashed border-ink-300 p-4 text-center">
        <div className={cn(typeClass("body-sm"), "text-ink-500")}>
          Заклинаний пока нет. Открой библиотеку ниже.
        </div>
      </div>
    );
  }

  const castSpell = (spell: Spell) => {
    if (spell.level === 0) {
      // Cantrip — просто ролл / «прочесть», слот не тратится. Для MVP — no-op.
      // Alerting через внешний toast — Phase I polish.
      return;
    }
    const slot = sc.spellSlots[spell.level - 1];
    if (!slot || slot.used >= slot.max) return;
    const nextSlots = [...sc.spellSlots];
    nextSlots[spell.level - 1] = { ...slot, used: slot.used + 1 };
    setSpellSlots.mutate({ spellSlots: nextSlots });
  };

  const togglePrepared = (spell: Spell) => {
    upsertSpell.mutate({ id: spell.id, patch: { prepared: !spell.prepared } });
  };

  return (
    <div className="space-y-3">
      {grouped.map(([level, spells]) => {
        const preparedCount = spells.filter((s) => s.prepared).length;
        const canCast = canCastAtLevel(sc, level);
        return (
          <section key={level}>
            <div className="flex items-baseline justify-between px-0.5 pb-1.5">
              <div className="font-ds-sans text-[13.5px] font-semibold">
                {LEVEL_LABELS[level] ?? `${level} уровень`}
              </div>
              <div className={cn(typeClass("code"), "text-ink-500")}>
                {level === 0
                  ? `${spells.length} известно`
                  : `${preparedCount} подг.`}
              </div>
            </div>
            <div className="rounded-ds-md border border-ink-200 bg-paper-card overflow-hidden">
              {spells.map((s, i) => (
                <SpellListRow
                  key={s.id}
                  spell={s}
                  isLast={i === spells.length - 1}
                  isCantrip={level === 0}
                  onCast={canCast ? () => castSpell(s) : undefined}
                  onTogglePrepared={
                    level === 0 ? undefined : () => togglePrepared(s)
                  }
                  onRemove={() => removeSpell.mutate(s.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function canCastAtLevel(sc: Spellcasting, level: number): boolean {
  if (level === 0) return true;
  const slot = sc.spellSlots[level - 1];
  if (slot && slot.used < slot.max) return true;
  // Pact magic — warlock: можно кастовать slotLevel-экв. любого spell-a ≤ slotLevel.
  if (
    sc.pactMagic &&
    sc.pactMagic.slotLevel >= level &&
    sc.pactMagic.used < sc.pactMagic.max
  ) {
    return true;
  }
  return false;
}
