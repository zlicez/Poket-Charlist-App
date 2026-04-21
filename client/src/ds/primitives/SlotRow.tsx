import { cn } from "@/lib/utils";

import { useLongPress } from "@/ds/hooks/useLongPress";

/**
 * DS SlotRow. Handoff README §3 + styles.css .slot-sq + S-03 screen.
 * Ряд квадратных тик-боксов: unused → violet border, used → violet filled.
 *
 *  tap (short press)  → onToggle(index)  — «потратить» или «восстановить»
 *  long press (500ms) → onLongPress()    — «reset level?» confirm
 *
 * Size: 16×16 квадрат, radius 3px, border 1.5px. Tap target обернут в
 * <button> с padding ≥ 14px чтобы общая touch-зона достигала 44×44.
 */
export interface SlotRowProps {
  level: number | string;
  used: number;
  max: number;
  onToggle?: (index: number) => void;
  onLongPress?: () => void;
  disabled?: boolean;
  className?: string;
  /** Переопределить label слева. По умолчанию — `{level} ур`. */
  label?: React.ReactNode;
  /** Показать счётчик `used/max` справа. */
  showCount?: boolean;
}

function SlotCell({
  used,
  index,
  onToggle,
  onLongPress,
  disabled,
}: {
  used: boolean;
  index: number;
  onToggle?: (index: number) => void;
  onLongPress?: () => void;
  disabled?: boolean;
}) {
  const bindings = useLongPress({
    onLongPress: () => {
      if (!disabled) onLongPress?.();
    },
    onPress: () => {
      if (!disabled) onToggle?.(index);
    },
  });

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={used}
      aria-label={`Слот ${index + 1}${used ? " (потрачен)" : ""}`}
      className={cn(
        "relative inline-flex items-center justify-center p-[14px]",
        "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg rounded-ds-sm",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      {...(!disabled ? bindings : {})}
    >
      <span
        className={cn(
          "block w-5 h-5 rounded-[3px] transition-colors",
          used
            ? "bg-violet border-[1.5px] border-violet"
            : "bg-paper-2 border-[1.5px] border-ink-400",
        )}
      />
    </button>
  );
}

export function SlotRow({
  level,
  used,
  max,
  onToggle,
  onLongPress,
  disabled,
  className,
  label,
  showCount = true,
}: SlotRowProps) {
  const cells = Array.from({ length: Math.max(max, 0) }, (_, i) => i < used);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="text-[11px] font-ds-mono text-ink-600 w-10 shrink-0">
        {label ?? `ур ${level}`}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {max === 0 ? (
          <span className="text-[11px] font-ds-mono text-ink-400">нет</span>
        ) : (
          cells.map((isUsed, i) => (
            <SlotCell
              key={i}
              used={isUsed}
              index={i}
              onToggle={onToggle}
              onLongPress={onLongPress}
              disabled={disabled}
            />
          ))
        )}
      </div>
      {showCount && max > 0 && (
        <div className="ml-auto text-[11px] font-ds-mono text-ink-500 tabular-nums">
          {max - used}/{max}
        </div>
      )}
    </div>
  );
}
