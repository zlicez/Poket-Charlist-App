/**
 * PLACEHOLDER — Phase D routing wire-up. Реальный экран — Phase E3.
 */
import { SlotRow } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useCharacterState } from "@/hooks/character/useCharacterState";

export function SpellsTab({ characterId }: { characterId: string }) {
  const { character } = useCharacterState(characterId);

  if (!character) {
    return <div className="p-5 text-ink-500">Загрузка…</div>;
  }

  const slots = character.spellcasting?.spellSlots ?? [];

  return (
    <div className="p-3 space-y-3">
      <div className={`${typeClass("label")} text-ink-500`}>PHASE D · PLACEHOLDER</div>
      <div className="rounded-ds-md border border-ink-200 bg-paper-card p-3">
        <div className="font-ds-sans text-[13.5px] font-semibold mb-2">Ячейки</div>
        {slots.length === 0 ? (
          <div className={`${typeClass("body-sm")} text-ink-500`}>
            Этот персонаж не владеет заклинаниями.
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((s, i) => (
              <SlotRow key={i} level={i + 1} used={s.used} max={s.max} />
            ))}
          </div>
        )}
      </div>
      <div className="rounded-ds-md border border-dashed border-ink-300 p-4 text-center text-ink-600 text-[13px]">
        Далее (Phase E3): подготовленные, библиотека заклинаний с фильтрами.
      </div>
    </div>
  );
}
