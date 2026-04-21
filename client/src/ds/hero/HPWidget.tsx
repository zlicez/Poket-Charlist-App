import { forwardRef } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/ds/primitives/Button";
import { useLongPress } from "@/ds/hooks/useLongPress";
import {
  clampHpPercentage,
  clampTempPercentage,
  getHpState,
  type HpState,
} from "./hp-state";

/**
 * DS HPWidget — hero-компонент 2/4.
 * Handoff: .hp-widget + .hp-bar в styles.css, B-01 / B-02 моки, README §2.
 *
 * Layout:
 *   [label «ОЧКИ ЗДОРОВЬЯ»]       [+N TEMP gold-badge]
 *   [Fraunces 44 current]  / max
 *   [hp-bar 12px ruby fill + temp gold fill]
 *   [− Урон (ruby)]  [+ Лечение (sage)]
 *
 * Interactions:
 *   onDamage → B-02 damage sheet (не открывает напрямую — это prop наружу).
 *   onHeal   → heal mirror sheet.
 *   onSetTemp → long-press на HP number (опционально, handoff §13.2 вопрос).
 *
 * Animation: hp-bar width transition 400ms cubic-bezier(.22,1,.36,1)
 * (honor prefers-reduced-motion — без transition).
 */

export interface HPWidgetProps {
  current: number;
  max: number;
  temp?: number;
  onDamage?: () => void;
  onHeal?: () => void;
  onSetTemp?: () => void;
  /** Принудительно переопределить выведенное состояние (для preview / тестов). */
  stateOverride?: HpState;
  className?: string;
}

const STATE_CLASS: Record<HpState, string> = {
  healthy: "",
  wounded: "ring-1 ring-ruby/30",
  critical: "ring-2 ring-ruby/60 motion-safe:animate-pulse",
  downed: "ring-2 ring-ruby",
};

export const HPWidget = forwardRef<HTMLDivElement, HPWidgetProps>(
  (
    { current, max, temp = 0, onDamage, onHeal, onSetTemp, stateOverride, className },
    ref,
  ) => {
    const state = stateOverride ?? getHpState(current, max);
    const hpPct = clampHpPercentage(current, max);
    const tempPct = clampTempPercentage(current, max, temp);

    const numberBindings = useLongPress({
      onLongPress: () => onSetTemp?.(),
      // Для Play-mode короткий tap по числу = ±1 через damage? Пока ничего.
    });

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-ds-md border border-ink-200 bg-paper-card p-3.5",
          STATE_CLASS[state],
          className,
        )}
        data-hp-state={state}
      >
        {/* Label + temp badge */}
        <div className="flex justify-between items-baseline">
          <div className="font-ds-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
            Очки здоровья
          </div>
          {temp > 0 && (
            <div className="font-ds-mono text-[10.5px] text-gold">+{temp} TEMP</div>
          )}
        </div>

        {/* Current / Max */}
        <div
          className="flex items-baseline gap-1 mt-0.5 select-none cursor-default"
          {...(onSetTemp ? numberBindings : {})}
        >
          <span className="font-ds-serif text-[44px] font-medium leading-none text-ink-900 tabular-nums">
            {current}
          </span>
          <span className="font-ds-serif text-[20px] text-ink-400">/ {max}</span>
        </div>

        {/* HP bar */}
        <div
          className="relative h-3 mt-2 bg-ink-100 rounded-full overflow-hidden border border-ink-200"
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label="Очки здоровья"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full motion-safe:transition-[width] motion-safe:duration-[400ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: `${hpPct}%`,
              background: "linear-gradient(90deg, #b13a3a, #d06060)",
            }}
          />
          {tempPct > 0 && (
            <div
              className="absolute inset-y-0 motion-safe:transition-[left,width] motion-safe:duration-[400ms]"
              style={{
                left: `${hpPct}%`,
                width: `${tempPct}%`,
                background: "linear-gradient(90deg, #b88020, #d9a040)",
              }}
            />
          )}
        </div>

        {/* Action buttons */}
        {(onDamage || onHeal) && (
          <div className="flex gap-1.5 mt-2.5">
            {onDamage && (
              <Button variant="ruby" onClick={onDamage} className="flex-1 py-2.5">
                − Урон
              </Button>
            )}
            {onHeal && (
              <Button
                variant="outline"
                onClick={onHeal}
                className="flex-1 py-2.5 bg-sage-bg border-sage-soft text-sage hover:border-sage"
              >
                + Лечение
              </Button>
            )}
          </div>
        )}
      </div>
    );
  },
);
HPWidget.displayName = "HPWidget";

export { getHpState, type HpState } from "./hp-state";
