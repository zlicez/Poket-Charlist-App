import { Card } from "@/components/ui/card";
import { NumericInput } from "@/components/ui/numeric-input";
import { Button } from "@/components/ui/button";
import { HelpTooltip, TooltipBody } from "@/components/ui/help-tooltip";
import { Heart, Plus, Minus } from "lucide-react";
import { HP_TOOLTIP, TEMP_HP_TOOLTIP } from "@/lib/tooltip-content";

export interface HpTrackerProps {
  current: number;
  max: number;
  calculatedMax: number;
  customMaxHpBonus: number;
  isAutoCalc: boolean;
  temp: number;
  onChange: (updates: { currentHp?: number; maxHp?: number; customMaxHpBonus?: number; tempHp?: number }) => void;
  // Дискретные мутации из discrete-дорожки (Risk 3). Если не переданы, ±1
  // кнопки продолжают слать через onChange (debounce-дорожка) — совместимо с
  // read-only /shared/:token view, где мутаций нет вовсе.
  onDamage?: (amount: number) => void;
  onHeal?: (amount: number) => void;
  isEditing: boolean;
}

export function HpTracker({
  current,
  max,
  calculatedMax,
  customMaxHpBonus,
  isAutoCalc,
  temp,
  onChange,
  onDamage,
  onHeal,
  isEditing
}: HpTrackerProps) {
  // Discrete-дорожка (onDamage/onHeal) делает optimistic setQueryData внутри
  // useMutation.onMutate — prop `current` обновляется синхронно ещё до ответа
  // сервера. Fallback на onChange даёт прежнее поведение debounce-дорожки.
  const adjustHp = (delta: number) => {
    if (delta < 0) {
      if (onDamage) {
        onDamage(-delta);
        return;
      }
    } else if (delta > 0) {
      if (onHeal) {
        onHeal(delta);
        return;
      }
    }
    // Fallback: full-field PATCH через debounce.
    const newHp = Math.min(max, Math.max(0, current + delta));
    onChange({ currentHp: newHp });
  };

  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const tempPercentage = Math.max(0, Math.min(100 - percentage, (temp / max) * 100));

  return (
    <Card className="stat-card-primary p-3" data-testid="stat-hp">
      <div className="flex items-center gap-2 mb-2">
        <Heart className="w-5 h-5 text-negative" />
        <span className="font-semibold text-sm">Хиты</span>
        <HelpTooltip
          content={<TooltipBody title={HP_TOOLTIP.title} lines={HP_TOOLTIP.lines} />}
          side="right"
        />
        {temp > 0 && (
          <span className="text-xs text-info font-mono ml-auto">+{temp} врем.</span>
        )}
      </div>

      <div className="hp-bar mb-2">
        <div
          className="hp-fill absolute left-0 top-0"
          style={{ width: `${percentage}%` }}
        />
        {temp > 0 && (
          <div
            className="hp-temp absolute top-0 h-full"
            style={{ left: `${percentage}%`, width: `${tempPercentage}%` }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center text-destructive-foreground text-sm font-bold font-mono drop-shadow">
          {current} / {max}
        </div>
      </div>

      {isEditing ? (
        isAutoCalc ? (
          <div className="grid grid-cols-4 gap-1.5 mt-2">
            <div>
              <label className="text-xs text-muted-foreground">Текущие</label>
              <NumericInput
                value={current}
                min={0}
                max={max}
                onChange={(v) => onChange({ currentHp: v })}
                className="h-10 text-center font-mono"
                data-testid="input-current-hp"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Расч.</label>
              <div className="h-10 flex items-center justify-center font-mono text-sm border rounded-md bg-muted/50 text-muted-foreground" data-testid="display-calc-hp">
                {calculatedMax}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Бонус</label>
              <NumericInput
                value={customMaxHpBonus}
                onChange={(v) => onChange({ customMaxHpBonus: v })}
                className="h-10 text-center font-mono"
                data-testid="input-max-hp-bonus"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                Врем.
                <HelpTooltip
                  content={<TooltipBody title={TEMP_HP_TOOLTIP.title} lines={TEMP_HP_TOOLTIP.lines} />}
                  side="top"
                  iconSize="xs"
                />
              </label>
              <NumericInput
                value={temp}
                min={0}
                onChange={(v) => onChange({ tempHp: v })}
                className="h-10 text-center font-mono"
                data-testid="input-temp-hp"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div>
              <label className="text-xs text-muted-foreground">Текущие</label>
              <NumericInput
                value={current}
                min={0}
                max={max}
                onChange={(v) => onChange({ currentHp: v })}
                className="h-10 text-center font-mono"
                data-testid="input-current-hp"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Макс.</label>
              <NumericInput
                value={max}
                min={1}
                onChange={(v) => onChange({ maxHp: v })}
                className="h-10 text-center font-mono"
                data-testid="input-max-hp"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs text-muted-foreground">
                Врем.
                <HelpTooltip
                  content={<TooltipBody title={TEMP_HP_TOOLTIP.title} lines={TEMP_HP_TOOLTIP.lines} />}
                  side="top"
                  iconSize="xs"
                />
              </label>
              <NumericInput
                value={temp}
                min={0}
                onChange={(v) => onChange({ tempHp: v })}
                className="h-10 text-center font-mono"
                data-testid="input-temp-hp"
              />
            </div>
          </div>
        )
      ) : (
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 sm:h-9 sm:w-9"
            onClick={() => adjustHp(-1)}
            data-testid="button-hp-minus"
          >
            <Minus className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 sm:h-9 sm:w-9"
            onClick={() => adjustHp(1)}
            data-testid="button-hp-plus"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      )}
    </Card>
  );
}
