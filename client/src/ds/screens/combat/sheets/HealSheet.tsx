import { useEffect, useState } from "react";

import { BottomSheet } from "@/ds/hero";
import { Button } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useApplyHeal } from "@/hooks/character/useApplyHeal";
import { useHapticFeedback } from "@/ds/hooks/useHapticFeedback";

/**
 * B-02' — Heal bottom-sheet. Зеркало DamageSheet в sage-палитре.
 * onApply → useApplyHeal.mutate(n). Heal capped at maxHp внутри хука.
 */
export function HealSheet({
  open,
  onOpenChange,
  characterId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterId: string;
}) {
  const [value, setValue] = useState<number>(0);
  const applyHeal = useApplyHeal(characterId);
  const haptic = useHapticFeedback();

  useEffect(() => {
    if (open) setValue(0);
  }, [open]);

  const apply = () => {
    if (value > 0) {
      applyHeal.mutate(value);
      haptic("bump");
    }
    onOpenChange(false);
  };

  const bump = (n: number) => setValue((v) => Math.max(0, v + n));

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Восстановить HP"
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
          data-testid="heal-sheet-input"
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
            className="border-sage-soft text-sage"
            data-testid={`heal-chip-${n}`}
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
          variant="outline"
          className="flex-1 bg-sage-bg border-sage-soft text-sage hover:border-sage"
          disabled={value <= 0}
          onClick={apply}
          data-testid="heal-sheet-apply"
        >
          Восстановить {value} HP
        </Button>
      </div>

      <div className={`${typeClass("caption")} text-ink-500 text-center mt-3`}>
        Лечение упирается в максимальное HP.
      </div>
    </BottomSheet>
  );
}
