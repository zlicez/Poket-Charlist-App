import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, SlotRow } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useSetSpellSlots } from "@/hooks/character/useSetSpellSlots";
import type { Character } from "@shared/schema";

/**
 * S-03 (верхняя часть) — слоты заклинаний.
 * 9 уровней + pact magic (warlock). Уровни с max=0 показываются как "нет",
 * чтобы игрок видел структуру прогрессии класса.
 *
 * Tap → потратить; long-press → сбросить ВЕСЬ уровень (handoff §3 SlotRow).
 * Кнопка «↻ Сбросить все» в заголовке — для DM/housekeeping, не для long-rest.
 */
export function SlotsPanel({ character }: { character: Character }) {
  const setSpellSlots = useSetSpellSlots(character.id);
  const sc = character.spellcasting;

  if (!sc) {
    return (
      <div className="rounded-ds-md border border-dashed border-ink-300 p-4 text-center">
        <div className={cn(typeClass("body-sm"), "text-ink-500")}>
          Этот персонаж не владеет заклинаниями.
        </div>
      </div>
    );
  }

  const toggleSlot = (level: number, index: number) => {
    const slots = [...sc.spellSlots];
    const slot = slots[level - 1];
    if (!slot) return;
    const used = index < slot.used ? index : index + 1;
    slots[level - 1] = { ...slot, used: Math.max(0, Math.min(slot.max, used)) };
    setSpellSlots.mutate({ spellSlots: slots });
  };

  const resetLevel = (level: number) => {
    const slots = [...sc.spellSlots];
    slots[level - 1] = { ...slots[level - 1], used: 0 };
    setSpellSlots.mutate({ spellSlots: slots });
  };

  const resetAll = () => {
    setSpellSlots.mutate({
      spellSlots: sc.spellSlots.map((s) => ({ ...s, used: 0 })),
      pactMagic: sc.pactMagic ? { ...sc.pactMagic, used: 0 } : sc.pactMagic,
    });
  };

  const togglePact = (index: number) => {
    if (!sc.pactMagic) return;
    const used = index < sc.pactMagic.used ? index : index + 1;
    setSpellSlots.mutate({
      pactMagic: {
        ...sc.pactMagic,
        used: Math.max(0, Math.min(sc.pactMagic.max, used)),
      },
    });
  };

  const resetPact = () => {
    if (!sc.pactMagic) return;
    setSpellSlots.mutate({ pactMagic: { ...sc.pactMagic, used: 0 } });
  };

  return (
    <div className="rounded-ds-md border border-ink-200 bg-paper-card p-3">
      <div className="flex items-baseline justify-between">
        <div className="font-ds-sans text-[13.5px] font-semibold">Ячейки</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetAll}
          className="text-ink-500 gap-1"
          data-testid="slots-reset-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Сбросить всё
        </Button>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {sc.spellSlots.map((s, i) =>
          s.max > 0 ? (
            <SlotRow
              key={i}
              level={i + 1}
              used={s.used}
              max={s.max}
              onToggle={(idx) => toggleSlot(i + 1, idx)}
              onLongPress={() => resetLevel(i + 1)}
            />
          ) : (
            <div
              key={i}
              className="flex items-center gap-2 opacity-40"
              aria-hidden
            >
              <div className="text-[11px] font-ds-mono text-ink-600 w-10 shrink-0">
                ур {i + 1}
              </div>
              <span className="text-[11px] font-ds-mono text-ink-400">нет</span>
            </div>
          ),
        )}

        {sc.pactMagic && sc.pactMagic.max > 0 && (
          <div className="pt-1.5 mt-1.5 border-t border-ink-100">
            <SlotRow
              level="P"
              label={`пакт ${sc.pactMagic.slotLevel} ур`}
              used={sc.pactMagic.used}
              max={sc.pactMagic.max}
              onToggle={togglePact}
              onLongPress={resetPact}
            />
          </div>
        )}
      </div>

      <p className={cn(typeClass("caption"), "text-ink-500 mt-2")}>
        Tap — потратить · long-press на ряду — сбросить весь уровень.
      </p>
    </div>
  );
}
