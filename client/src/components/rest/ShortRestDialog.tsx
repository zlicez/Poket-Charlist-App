import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { CheckCircle2, Coffee, Dice6, Heart } from "lucide-react";
import {
  getCharacterClasses,
  getTotalLevel,
  type Character,
} from "@shared/schema";

interface RollEntry {
  raw: number;
  mod: number;
  total: number;
}

export function ShortRestDialog({
  character,
  conMod,
  open,
  onOpenChange,
  onApply,
}: {
  character: Character;
  conMod: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (updates: Partial<Character>) => void;
}) {
  const [rolls, setRolls] = useState<RollEntry[]>([]);
  const [rolling, setRolling] = useState(false);
  const [animVal, setAnimVal] = useState<number | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleFinish = () => {
    if (rolls.length > 0) {
      onApply({
        currentHp: newHp,
        hitDiceRemaining: (character.hitDiceRemaining ?? totalDice) - rolls.length,
      });
    }
    onOpenChange(false);
  };

  const modStr = conMod >= 0 ? `+${conMod}` : `${conMod}`;

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-500" />
            Короткий отдых
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="space-y-3">
          {/* HP and hit dice status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50">
              <Heart className="w-4 h-4 text-red-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground">Хиты</div>
                <div className="text-sm font-bold tabular-nums">
                  <span className={isHpFull ? "text-green-500" : ""}>{newHp}</span>
                  <span className="text-muted-foreground font-normal"> / {character.maxHp}</span>
                  {totalRestored > 0 && (
                    <span className="text-green-500 text-xs ml-1">(+{totalRestored})</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/50">
              <Dice6 className="w-4 h-4 text-accent shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-muted-foreground">Кости хитов (d{dieFaces})</div>
                <div className="text-sm font-bold tabular-nums">
                  {diceRemaining}
                  <span className="text-muted-foreground font-normal"> / {totalDice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Animation or hint */}
          {rolling && animVal !== null ? (
            <div className="flex flex-col items-center py-4">
              <div className="text-5xl font-black tabular-nums text-accent animate-pulse">
                {animVal}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Бросок d{dieFaces}...</div>
            </div>
          ) : rolls.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">
              Каждая кость: d{dieFaces} {modStr} (КОН) → восстановление ХП
            </p>
          ) : null}

          {/* Roll history */}
          {rolls.length > 0 && !rolling && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Броски этого отдыха
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {rolls.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm px-2.5 py-1.5 rounded-md bg-green-500/10 border border-green-500/20"
                  >
                    <span className="text-muted-foreground text-xs">
                      d{dieFaces} → <span className="font-semibold text-foreground">{r.raw}</span>
                      {" "}{r.mod >= 0 ? "+" : ""}{r.mod} КОН
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      +{r.total} ХП
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status messages */}
          {isHpFull && !rolling && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-green-600 dark:text-green-400 font-medium py-1">
              <CheckCircle2 className="w-4 h-4" />
              Хиты восстановлены до максимума!
            </div>
          )}
          {diceRemaining <= 0 && !isHpFull && !rolling && (
            <p className="text-sm text-center text-muted-foreground py-1">
              Кости хитов закончились
            </p>
          )}

          {/* Roll button */}
          <Button
            className="w-full gap-2 h-11"
            onClick={rollHitDie}
            disabled={!canRoll}
          >
            <Dice6 className="w-4 h-4" />
            {rolling ? "Бросок..." : `Потратить кость хитов (d${dieFaces})`}
          </Button>
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleFinish}>
            Завершить отдых
            {rolls.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {rolls.length} {rolls.length === 1 ? "кость" : rolls.length < 5 ? "кости" : "костей"}
              </Badge>
            )}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
