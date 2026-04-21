import { useEffect, useState } from "react";

import { BottomSheet } from "@/ds/hero";
import { Button } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useSetTempHp } from "@/hooks/character/useSetTempHp";

/**
 * B-02'' — Temp HP bottom-sheet. Открывается long-press'ом на HP number.
 * Правило D&D 5e: temp HP не складываются; новое больше → replace,
 * иначе остаётся. UI этого правила НЕ навязывает — это серверная/доменная
 * логика; здесь просто set value. (Политику применит игрок / future feature.)
 *
 * Handoff §13.2 — вопрос №5: long-press → temp-HP sheet. Подтверждено.
 */
export function TempHpSheet({
  open,
  onOpenChange,
  characterId,
  currentTemp,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterId: string;
  currentTemp: number;
}) {
  const [value, setValue] = useState<number>(currentTemp);
  const setTempHp = useSetTempHp(characterId);

  useEffect(() => {
    if (open) setValue(currentTemp);
  }, [open, currentTemp]);

  const apply = () => {
    setTempHp.mutate(value);
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Временные HP"
      description="Текущее значение заменится полностью"
    >
      <div className="flex items-center gap-2 mt-2 p-3 bg-paper-2 rounded-ds-md">
        <Button
          variant="outline"
          onClick={() => setValue((v) => Math.max(0, v - 1))}
          className="w-11 h-11 p-0 text-lg"
        >
          −
        </Button>
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(Math.max(0, parseInt(e.target.value) || 0))}
          className="flex-1 text-center font-ds-serif text-2xl bg-paper-card border border-ink-300 rounded-ds-md outline-none focus:border-ink-900 py-2"
          data-testid="temp-hp-input"
        />
        <Button
          variant="outline"
          onClick={() => setValue((v) => v + 1)}
          className="w-11 h-11 p-0 text-lg"
        >
          +
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-1.5 mt-2.5">
        {[0, 5, 10, 15].map((n) => (
          <Button
            key={n}
            variant="outline"
            size="sm"
            onClick={() => setValue(n)}
            className="border-gold-soft text-gold"
          >
            {n}
          </Button>
        ))}
      </div>

      <div className="flex gap-2.5 mt-3.5">
        <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
          Отмена
        </Button>
        <Button variant="primary" className="flex-1" onClick={apply}>
          Установить {value}
        </Button>
      </div>

      <div className={`${typeClass("caption")} text-ink-500 text-center mt-3`}>
        Правило 5e: «новое больше — заменить». Применяет игрок.
      </div>
    </BottomSheet>
  );
}
