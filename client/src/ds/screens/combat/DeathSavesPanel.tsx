import { Skull } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, Tag } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useSetDeathSaves } from "@/hooks/character/useSetDeathSaves";
import { useHapticFeedback } from "@/ds/hooks/useHapticFeedback";
import type { DeathSaves } from "@shared/schema";

/**
 * B-06 — Death saves panel. Появляется автоматически при currentHp === 0.
 *
 * 3 успеха + 3 провала дота. Кнопка «Бросить d20» — клиентский ролл:
 *   1          → 2 провала (crit fail)
 *   2..9       → 1 провал
 *   10..19     → 1 успех
 *   20         → восстановление 1 HP (stabilize + wake, но это уже logic
 *                уровня heal — для MVP просто reset death saves + heal=1)
 *
 * При 3 успехах — Tag «Стабилизирован» sage. При 3 провалах — «Мёртв» ruby.
 *
 * MVP нюанс: crit (20) на d20 должен поднять HP до 1. Для этого потребуется
 * дополнительно вызвать useApplyHeal. Пока оставим просто сброс saves
 * (stabilize + revive отдельной кнопкой — добавить в Phase I polish).
 */
export function DeathSavesPanel({
  characterId,
  deathSaves,
  onRevive,
}: {
  characterId: string;
  deathSaves: DeathSaves;
  onRevive?: () => void;
}) {
  const setDeathSaves = useSetDeathSaves(characterId);
  const haptic = useHapticFeedback();

  const isStable = deathSaves.successes >= 3;
  const isDead = deathSaves.failures >= 3;

  const rollD20 = () => {
    if (isStable || isDead) return;
    const roll = Math.floor(Math.random() * 20) + 1;

    if (roll === 20) {
      // Natural 20 → stabilize и revive (handoff §13.2: «reset when HP ≥1»).
      setDeathSaves.mutate({ successes: 0, failures: 0 });
      haptic("success");
      onRevive?.();
      return;
    }
    if (roll === 1) {
      setDeathSaves.mutate({
        ...deathSaves,
        failures: Math.min(3, deathSaves.failures + 2),
      });
      haptic("warn");
      return;
    }
    if (roll >= 10) {
      setDeathSaves.mutate({
        ...deathSaves,
        successes: Math.min(3, deathSaves.successes + 1),
      });
      haptic("tick");
    } else {
      setDeathSaves.mutate({
        ...deathSaves,
        failures: Math.min(3, deathSaves.failures + 1),
      });
      haptic("warn");
    }
  };

  const toggleSuccess = (index: number) => {
    if (isStable || isDead) return;
    const next = deathSaves.successes >= index + 1 ? index : index + 1;
    setDeathSaves.mutate({ ...deathSaves, successes: next });
  };
  const toggleFailure = (index: number) => {
    if (isStable || isDead) return;
    const next = deathSaves.failures >= index + 1 ? index : index + 1;
    setDeathSaves.mutate({ ...deathSaves, failures: next });
  };

  return (
    <div
      className={cn(
        "rounded-ds-md border-2 p-4 bg-paper-2",
        isStable && "border-sage",
        isDead && "border-ruby",
        !isStable && !isDead && "border-ruby",
      )}
      data-testid="death-saves-panel"
    >
      <div className={cn(typeClass("label"), "text-ruby")}>HP = 0 · БЕЗ СОЗНАНИЯ</div>
      <div className="flex items-center justify-between mt-1">
        <div className="inline-flex items-center gap-2">
          <Skull
            className={cn(
              "w-5 h-5 shrink-0",
              isDead ? "text-ruby" : isStable ? "text-sage" : "text-ink-500",
            )}
          />
          <span className={cn(typeClass("h2"), "text-ink-900")}>
            Смертельные спасброски
          </span>
        </div>
        {isDead && <Tag variant="ruby">Мёртв</Tag>}
        {isStable && <Tag variant="sage">Стабилизирован</Tag>}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3">
        <div>
          <div className={cn(typeClass("label"), "text-sage mb-1.5")}>Успехи</div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleSuccess(i)}
                aria-label={`Успех ${i + 1}`}
                className={cn(
                  "w-9 h-9 rounded-full transition-all active:scale-95",
                  "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
                  deathSaves.successes > i
                    ? "bg-sage border-2 border-sage"
                    : "bg-transparent border-2 border-ink-300",
                )}
              />
            ))}
          </div>
        </div>
        <div>
          <div className={cn(typeClass("label"), "text-ruby mb-1.5")}>Провалы</div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleFailure(i)}
                aria-label={`Провал ${i + 1}`}
                className={cn(
                  "w-9 h-9 rounded-full transition-all active:scale-95",
                  "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
                  deathSaves.failures > i
                    ? "bg-ruby border-2 border-ruby"
                    : "bg-transparent border-2 border-ink-300",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        className="w-full mt-4"
        onClick={rollD20}
        disabled={isStable || isDead}
        data-testid="death-save-roll"
      >
        Бросить d20
      </Button>
    </div>
  );
}
