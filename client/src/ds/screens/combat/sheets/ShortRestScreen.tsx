import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Coffee, Heart } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Button, Die } from "@/ds/primitives";
import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { useCommitRest } from "@/hooks/character/useCommitRest";
import {
  calculateModifier,
  getCharacterClasses,
  getRacialBonuses,
  getTotalLevel,
  type Character,
} from "@shared/schema";

/**
 * B-04 — Short rest. Handoff 03-screens.jsx RestScreen и README §Rest flows:
 * «Short rest is a full-screen modal (not a bottom sheet) because it has
 * multiple HD rolls.»
 *
 * Flow:
 *   1. Показать доступные HD (diceRemaining / totalDice).
 *   2. По кнопке «Бросить d{die} + CON» — анимация бросок + append в лог.
 *   3. «Завершить отдых» → useCommitRest с currentHp + hitDiceRemaining.
 */

interface RollEntry {
  raw: number;
  mod: number;
  total: number;
}

export function ShortRestScreen({
  open,
  onOpenChange,
  character,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
}) {
  const commitRest = useCommitRest(character.id);
  const [rolls, setRolls] = useState<RollEntry[]>([]);
  const [rolling, setRolling] = useState(false);
  const [animVal, setAnimVal] = useState<number | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const racialBonuses = getRacialBonuses(
    character.race,
    character.subrace,
    character.selectedRacialAbilityBonuses,
  );
  const totalCon =
    character.abilityScores.CON +
    (racialBonuses.CON || 0) +
    (character.customAbilityBonuses?.CON || 0);
  const conMod = calculateModifier(totalCon);

  const parsedDice = character.hitDice?.match(/d(\d+)/);
  const dieFaces = parsedDice ? parseInt(parsedDice[1]) : 6;
  const totalDice = getTotalLevel(getCharacterClasses(character));
  const diceRemaining = (character.hitDiceRemaining ?? totalDice) - rolls.length;

  const totalRestored = rolls.reduce((s, r) => s + r.total, 0);
  const newHp = Math.min(character.maxHp, character.currentHp + totalRestored);
  const isHpFull = newHp >= character.maxHp;
  const canRoll = diceRemaining > 0 && !isHpFull && !rolling;

  useEffect(() => {
    if (open) {
      setRolls([]);
      setAnimVal(null);
      setRolling(false);
    }
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [open]);

  const rollHitDie = () => {
    if (!canRoll) return;
    const raw = Math.floor(Math.random() * dieFaces) + 1;
    const total = Math.max(1, raw + conMod);

    setRolling(true);
    setAnimVal(Math.floor(Math.random() * dieFaces) + 1);
    animRef.current = setInterval(() => {
      setAnimVal(Math.floor(Math.random() * dieFaces) + 1);
    }, 60);

    setTimeout(() => {
      if (animRef.current) clearInterval(animRef.current);
      setAnimVal(null);
      setRolls((prev) => [...prev, { raw, mod: conMod, total }]);
      setRolling(false);
    }, 500);
  };

  const finish = () => {
    if (rolls.length > 0) {
      commitRest.mutate({
        currentHp: newHp,
        hitDiceRemaining: (character.hitDiceRemaining ?? totalDice) - rolls.length,
      });
    }
    onOpenChange(false);
  };

  const modStr = conMod >= 0 ? `+${conMod}` : `${conMod}`;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-ink-900/70",
            "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0",
            "motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-paper text-ink-900 font-ds-sans",
            "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0",
            "motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0",
          )}
          onEscapeKeyDown={(e) => rolling && e.preventDefault()}
        >
          <DialogPrimitive.Title asChild>
            <header className="flex items-center gap-2 px-4 py-3 border-b border-ink-200 bg-paper-2 flex-shrink-0">
              <Button
                variant="icon"
                size="sm"
                onClick={() => onOpenChange(false)}
                aria-label="Закрыть"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="inline-flex items-center gap-2 text-[15px] font-semibold">
                <Coffee className="w-4 h-4 text-amber-600" />
                Короткий отдых
              </span>
            </header>
          </DialogPrimitive.Title>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Status cards */}
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={<Heart className="w-4 h-4 text-ruby shrink-0" />}
                label="Хиты"
                value={
                  <>
                    <span className={isHpFull ? "text-sage" : ""}>{newHp}</span>
                    <span className="text-ink-400"> / {character.maxHp}</span>
                    {totalRestored > 0 && (
                      <span className="text-sage text-xs ml-1">(+{totalRestored})</span>
                    )}
                  </>
                }
              />
              <StatCard
                icon={<Die sides={dieFaces as 4 | 6 | 8 | 10 | 12 | 20} size={18} />}
                label={`Кости хитов (d${dieFaces})`}
                value={
                  <>
                    {diceRemaining}
                    <span className="text-ink-400"> / {totalDice}</span>
                  </>
                }
              />
            </div>

            {/* Animation / hint */}
            {rolling && animVal !== null ? (
              <div className="flex flex-col items-center py-6">
                <div className="font-ds-serif text-5xl font-bold text-ruby motion-safe:animate-pulse tabular-nums">
                  {animVal}
                </div>
                <div className={cn(typeClass("caption"), "text-ink-500 mt-1.5")}>
                  Бросок d{dieFaces}…
                </div>
              </div>
            ) : rolls.length === 0 ? (
              <p className={cn(typeClass("body-sm"), "text-ink-500 text-center py-3")}>
                Каждая кость: d{dieFaces} {modStr} (КОН) → восстановление HP
              </p>
            ) : null}

            {/* Roll log */}
            {rolls.length > 0 && !rolling && (
              <div>
                <div className={cn(typeClass("label"), "text-ink-500 mb-2")}>
                  Броски этого отдыха
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {rolls.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-ds-sm bg-sage-bg border border-sage-soft"
                    >
                      <span className={cn(typeClass("code"), "text-ink-600")}>
                        d{dieFaces} → <b className="text-ink-900">{r.raw}</b>{" "}
                        {r.mod >= 0 ? "+" : ""}
                        {r.mod} КОН
                      </span>
                      <span className="font-ds-serif text-lg font-medium text-sage">
                        +{r.total} HP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isHpFull && !rolling && (
              <div className="flex items-center justify-center gap-1.5 py-1 text-sage text-[13px] font-medium">
                ✓ HP восстановлены до максимума
              </div>
            )}
            {diceRemaining <= 0 && !isHpFull && !rolling && (
              <p className={cn(typeClass("body-sm"), "text-center text-ink-500 py-1")}>
                Кости хитов закончились.
              </p>
            )}
          </div>

          <footer className="px-4 py-3 border-t border-ink-200 bg-paper-2 flex gap-2 flex-shrink-0 pb-[max(12px,env(safe-area-inset-bottom))]">
            <Button
              variant="primary"
              onClick={rollHitDie}
              disabled={!canRoll}
              className="flex-1"
              data-testid="short-rest-roll"
            >
              {rolling ? "Бросок…" : `Потратить кость (d${dieFaces})`}
            </Button>
            <Button
              variant="outline"
              onClick={finish}
              className="flex-1"
              data-testid="short-rest-finish"
            >
              Завершить{rolls.length > 0 ? ` (${rolls.length})` : ""}
            </Button>
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-ds-md border border-ink-200 bg-paper-card px-3 py-2 flex items-center gap-2">
      {icon}
      <div className="min-w-0">
        <div className={cn(typeClass("label"), "text-ink-500")}>{label}</div>
        <div className="font-ds-sans font-semibold text-[14px] tabular-nums">{value}</div>
      </div>
    </div>
  );
}
