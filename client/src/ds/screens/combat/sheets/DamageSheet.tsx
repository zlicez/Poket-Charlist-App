import { useEffect, useState } from "react";

import { BottomSheet } from "@/ds/hero";
import { Button } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useApplyDamage } from "@/hooks/character/useApplyDamage";

/**
 * B-02 — Damage bottom-sheet. Handoff 03-screens.jsx CombatDamage.
 * Numeric input + ±1 inc/dec + quick chips +1/+2/+5/+10 + apply/cancel.
 *
 * onApply → useApplyDamage.mutate(n) — discrete с undo в toast'е (useApplyDamage
 * пушит UndoEntry в characterStore → UndoToastHost показывает «Отменить»).
 */
export function DamageSheet({
  open,
  onOpenChange,
  characterId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterId: string;
}) {
  const [value, setValue] = useState<number>(0);
  const applyDamage = useApplyDamage(characterId);

  useEffect(() => {
    if (open) setValue(0);
  }, [open]);

  const apply = () => {
    if (value > 0) applyDamage.mutate(value);
    onOpenChange(false);
  };

  const bump = (n: number) => setValue((v) => Math.max(0, v + n));

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Получить урон"
      description="Введите число или жмите +N"
    >
      <div className="flex items-center gap-2 mt-2 p-3 bg-paper-2 rounded-ds-md">
        <Button variant="outline" onClick={() => bump(-1)} className="w-11 h-11 p-0 text-lg">
          −
        </Button>
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
          className="flex-1 text-center font-ds-serif text-2xl bg-paper-card border border-ink-300 rounded-ds-md outline-none focus:border-ink-900 py-2"
          data-testid="damage-sheet-input"
        />
        <Button variant="outline" onClick={() => bump(1)} className="w-11 h-11 p-0 text-lg">
          +
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-1.5 mt-2.5">
        {[1, 2, 5, 10].map((n) => (
          <Button
            key={n}
            variant="outline"
            size="sm"
            onClick={() => bump(n)}
            data-testid={`damage-chip-${n}`}
          >
            +{n}
          </Button>
        ))}
      </div>

      <div className="flex gap-2.5 mt-3.5">
        <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
          Отмена
        </Button>
        <Button
          variant="ruby"
          className="flex-1"
          disabled={value <= 0}
          onClick={apply}
          data-testid="damage-sheet-apply"
        >
          Применить {value} урона
        </Button>
      </div>

      <div className={`${typeClass("caption")} text-ink-500 text-center mt-3`}>
        При HP=0 появится панель смертельных спасбросков.
      </div>
    </BottomSheet>
  );
}
