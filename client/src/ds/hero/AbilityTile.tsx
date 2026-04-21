import { forwardRef, useRef } from "react";

import { cn } from "@/lib/utils";
import { useLongPress } from "@/ds/hooks/useLongPress";

/**
 * DS AbilityTile — hero-компонент 1/4.
 * Handoff: .ability-tile + 02-system.jsx Ability block + 03-screens.jsx mock.
 *
 * Play-mode: tap → onPress (ролл d20+mod); long-press → onLongPress (expand skills).
 * Edit-mode: inline NumericInput вместо crypto-численных блоков.
 *
 * Layout (per styles.css):
 *   label (mono 9.5 uppercase ink-500)
 *   ↓
 *   mod  (Fraunces 36 ink-900)
 *   ↓
 *   score (mono 11 в чипе paper-card + ink-200 border)
 *   [save-dot 8×8 ruby в top-right если hasSaveProficiency]
 */

export interface AbilityTileProps {
  /** 3-буквенный код (СИЛ, ЛОВ, ТЕЛ, ИНТ, МДР, ХАР). */
  label: string;
  /** Модификатор. Автоформат: `+3`, `−1`, `+0`. */
  modifier: number;
  /** Итоговое значение характеристики. */
  score: number;
  hasSaveProficiency?: boolean;
  /** Play-mode tap. Не вызывается в edit-mode. */
  onPress?: () => void;
  /** Play-mode long-press — открыть skill expand. */
  onLongPress?: () => void;
  isEditing?: boolean;
  /** Edit-mode render — custom inputs замещают mod/score. */
  editControls?: React.ReactNode;
  className?: string;
}

export function formatModifier(n: number): string {
  if (n === 0) return "+0";
  return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

export const AbilityTile = forwardRef<HTMLButtonElement, AbilityTileProps>(
  (
    {
      label,
      modifier,
      score,
      hasSaveProficiency,
      onPress,
      onLongPress,
      isEditing,
      editControls,
      className,
    },
    ref,
  ) => {
    const longPressBindings = useLongPress({
      onLongPress: () => onLongPress?.(),
      onPress: () => onPress?.(),
    });
    const tileRef = useRef<HTMLButtonElement | null>(null);

    const isInteractive = !isEditing && (onPress || onLongPress);
    const tileClassName = cn(
      "relative block w-full text-center",
      "px-2.5 pt-[14px] pb-[10px]",
      "border border-ink-300 rounded-ds-lg",
      // Gradient per styles.css .ability-tile
      "bg-gradient-to-b from-[#fbf6ec] to-[#f4ead8]",
      "transition-transform duration-150",
      "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg focus-visible:border-ruby",
      isInteractive && "cursor-pointer hover:shadow-ds-1 active:scale-[0.98]",
      !isInteractive && "cursor-default",
      className,
    );

    const content = (
      <>
        <div className="font-ds-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-500 mb-0.5">
          {label}
        </div>
        {isEditing && editControls ? (
          <div className="flex flex-col items-center gap-1 mt-1.5">{editControls}</div>
        ) : (
          <>
            <div className="font-ds-serif text-[36px] leading-none font-medium text-ink-900 my-1">
              {formatModifier(modifier)}
            </div>
            <div
              className={cn(
                "inline-block font-ds-mono text-[11px] text-ink-600",
                "bg-paper-card border border-ink-200 rounded-full px-2 py-[2px]",
              )}
            >
              {score}
            </div>
          </>
        )}
        {hasSaveProficiency && (
          <span
            aria-label="Профиценция спасброска"
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-ruby"
          />
        )}
      </>
    );

    if (isInteractive) {
      return (
        <button
          ref={(el) => {
            tileRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
          }}
          type="button"
          aria-label={`${label} ${formatModifier(modifier)}`}
          className={tileClassName}
          {...longPressBindings}
        >
          {content}
        </button>
      );
    }

    return (
      <div className={tileClassName} role="group" aria-label={`${label} ${formatModifier(modifier)}`}>
        {content}
      </div>
    );
  },
);
AbilityTile.displayName = "AbilityTile";
