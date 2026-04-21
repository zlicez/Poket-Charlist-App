import { Button } from "@/components/ui/button";
import { NumericInput } from "@/components/ui/numeric-input";
import { Minus, Plus, Sparkles } from "lucide-react";

import { MAX_SLOTS_PER_LEVEL } from "./constants";

export function SpellSlotTracker({
  testIdPrefix = "spell-slots",
  rowLabel,
  level,
  max,
  used,
  calculatedMax,
  onChange,
  isEditing,
  isLocked,
  noCap = false,
}: {
  testIdPrefix?: string;
  rowLabel?: string;
  level: number;
  max: number;
  used: number;
  calculatedMax?: number;
  onChange: (max: number, used: number) => void;
  isEditing: boolean;
  isLocked?: boolean;
  noCap?: boolean; // skip D&D 5e cap (for pact magic)
}) {
  if (max === 0 && !isEditing) return null;

  const cap = !noCap ? MAX_SLOTS_PER_LEVEL[level - 1] : undefined;
  const displayMax = cap !== undefined ? Math.min(max, cap) : max;

  // Count-based: spent slots fill from the right
  const spent = Math.min(used, displayMax);
  const available = displayMax - spent;
  // Cell i is spent if it is in the right-side (spent) zone
  const isCellSpent = (i: number) => i >= available;

  return (
    <div
      className="grid items-center gap-x-3"
      style={{ gridTemplateColumns: "1.5rem 1fr auto" }}
      data-testid={`${testIdPrefix}-level-${level}`}
    >
      <span className="text-xs font-medium text-right text-muted-foreground">
        {rowLabel ?? level}
      </span>
      {isEditing ? (
        <div className="flex items-center gap-1.5">
          <NumericInput
            min={0}
            max={20}
            value={max}
            onChange={(v) => onChange(v, Math.min(used, v))}
            className="h-8 w-14 text-center text-sm font-mono"
            data-testid={`input-${testIdPrefix}-max-${level}`}
          />
          {calculatedMax !== undefined && calculatedMax !== max && (
            <button
              className="text-[11px] text-muted-foreground hover:text-accent tabular-nums"
              onClick={() =>
                onChange(calculatedMax, Math.min(used, calculatedMax))
              }
              title="Заполнить расчётным значением"
              data-testid={`button-${testIdPrefix}-calc-${level}`}
            >
              /{calculatedMax}
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: displayMax }, (_, i) => {
            const isSpent = isCellSpent(i);
            return (
              <div
                key={i}
                className={`w-10 h-10 sm:w-8 sm:h-8 rounded border-2 flex items-center justify-center ${
                  isSpent
                    ? "bg-muted border-muted-foreground/30 opacity-40"
                    : "border-accent/50 bg-accent/10"
                }`}
                data-testid={`${testIdPrefix}-cell-${level}-${i}`}
              >
                {!isSpent && <Sparkles className="w-4 h-4 text-accent" />}
              </div>
            );
          })}
          {displayMax === 0 && (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      )}
      {!isEditing && !isLocked && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-8 sm:w-8"
            onClick={() => onChange(max, Math.min(displayMax, used + 1))}
            disabled={spent >= displayMax}
            aria-label="Потратить ячейку"
            data-testid={`button-${testIdPrefix}-minus-${level}`}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-8 sm:w-8"
            onClick={() => onChange(max, Math.max(0, used - 1))}
            disabled={spent <= 0}
            aria-label="Восстановить ячейку"
            data-testid={`button-${testIdPrefix}-plus-${level}`}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
