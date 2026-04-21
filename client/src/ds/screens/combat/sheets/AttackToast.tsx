import { useEffect } from "react";
import { Swords } from "lucide-react";

import { Button, Die } from "@/ds/primitives";
import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";

/**
 * B-03 — Attack toast. Transient card под HP widget, показывает результат
 * атаки: d20(N) + atk = total. Кнопка «Нанести урон» → открывает DamageSheet
 * с pre-заполненным damage rolled.
 *
 * Не BottomSheet — хочется, чтобы HP виджет оставался виден (это play-flow
 * tight loop: attack → damage → attack…).
 *
 * dismissable: само закрытие по timeout (через auto-dismiss) или вручную ×.
 */

export interface AttackToastData {
  weaponName: string;
  attackBonus: number;
  damageNotation: string;
  d20: number;
  total: number;
  onRollDamage: () => void;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 10_000;

export function AttackToast({ data }: { data: AttackToastData | null }) {
  useEffect(() => {
    if (!data) return;
    const t = setTimeout(() => data.onDismiss(), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [data]);

  if (!data) return null;

  const isCrit = data.d20 === 20;
  const isFumble = data.d20 === 1;

  return (
    <div
      className={cn(
        "rounded-ds-md border bg-paper-card p-3 shadow-ds-1",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 motion-safe:duration-[220ms]",
        isCrit && "border-sage bg-sage-bg",
        isFumble && "border-ruby bg-ruby-bg",
        !isCrit && !isFumble && "border-ink-200",
      )}
      role="status"
      aria-live="polite"
      data-testid="attack-toast"
    >
      <div className="flex items-start gap-3">
        <Swords className="w-4 h-4 text-ink-700 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-ds-sans text-[13.5px] font-semibold truncate">
            {data.weaponName}
            {isCrit && <span className={cn(typeClass("label"), "text-sage ml-2")}>КРИТ!</span>}
            {isFumble && <span className={cn(typeClass("label"), "text-ruby ml-2")}>ПРОМАХ</span>}
          </div>
          <div className={cn(typeClass("code"), "text-ink-500 mt-0.5")}>
            d20({data.d20}) {data.attackBonus >= 0 ? "+" : ""}
            {data.attackBonus} = <span className="font-semibold text-ink-900">{data.total}</span>
            <span className="ml-2 text-ink-400">→ {data.damageNotation}</span>
          </div>
        </div>
        <Die sides={20} value={data.d20} variant={isCrit ? "active" : "default"} />
      </div>

      <div className="flex gap-2 mt-2.5">
        <Button
          variant="ruby"
          size="sm"
          onClick={data.onRollDamage}
          className="flex-1"
          data-testid="attack-toast-damage"
        >
          Нанести урон ({data.damageNotation})
        </Button>
        <Button variant="ghost" size="sm" onClick={data.onDismiss}>
          Закрыть
        </Button>
      </div>
    </div>
  );
}
