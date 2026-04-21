import { TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { getLevelFromXP, getXPProgress } from "@shared/schema";

/**
 * B-07 — Level-up badge. Появляется когда XP пересекает порог следующего уровня.
 * Float-pill в верхней части Combat tab'а. Клик → S-09 level-up wizard
 * (Phase F; сейчас — alert-заглушка).
 */
export function LevelUpBadge({
  xp,
  currentLevel,
  onOpenWizard,
}: {
  xp: number;
  currentLevel: number;
  onOpenWizard?: () => void;
}) {
  const levelFromXp = getLevelFromXP(xp);
  const progress = getXPProgress(xp, currentLevel);
  const pending = levelFromXp > currentLevel;
  if (!pending) return null;

  return (
    <div
      className={cn(
        "rounded-ds-md border-2 border-gold bg-gold-bg p-3",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2",
      )}
      data-testid="level-up-badge"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gold text-white flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn(typeClass("label"), "text-gold")}>
            УРОВЕНЬ ВВЕРХ · {currentLevel} → {levelFromXp}
          </div>
          <div className="font-ds-sans text-[13.5px] font-semibold text-ink-900">
            XP {xp.toLocaleString("ru")} / {progress.next.toLocaleString("ru")}
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={onOpenWizard}>
          Прокачать
        </Button>
      </div>
    </div>
  );
}
