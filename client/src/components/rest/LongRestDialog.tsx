import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { CheckCircle2, Dice6, Heart, Moon, Wand2 } from "lucide-react";
import {
  getCharacterClasses,
  getTotalLevel,
  type Character,
} from "@shared/schema";

export function LongRestDialog({
  character,
  open,
  onOpenChange,
  onApply,
}: {
  character: Character;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (updates: Partial<Character>) => void;
}) {
  const totalDice = getTotalLevel(getCharacterClasses(character));
  const diceRestored = Math.max(1, Math.floor(totalDice / 2));
  const currentDice = character.hitDiceRemaining ?? totalDice;
  const newDice = Math.min(totalDice, currentDice + diceRestored);

  const hpMissing = character.maxHp - character.currentHp;
  const spellcasting = character.spellcasting;
  const hasSpellSlots =
    spellcasting?.spellSlots?.some((s) => s.max > 0) ||
    (spellcasting?.pactMagic?.max ?? 0) > 0;
  const usedSpellSlots =
    (spellcasting?.spellSlots?.reduce((s, slot) => s + slot.used, 0) ?? 0) +
    (spellcasting?.pactMagic?.used ?? 0);

  const handleRest = () => {
    const updates: Partial<Character> = {
      currentHp: character.maxHp,
      hitDiceRemaining: newDice,
    };

    if (spellcasting) {
      updates.spellcasting = {
        ...spellcasting,
        spellSlots: spellcasting.spellSlots.map((slot) => ({
          ...slot,
          used: 0,
        })),
        pactMagic: spellcasting.pactMagic
          ? { ...spellcasting.pactMagic, used: 0 }
          : spellcasting.pactMagic,
      };
    }

    onApply(updates);
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            Продолжительный отдых
          </ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            8 часов отдыха полностью восстанавливают силы персонажа.
          </p>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              После отдыха
            </div>

            {/* HP */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50">
              <Heart className="w-4 h-4 text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Хиты</div>
                <div className="text-xs text-muted-foreground">
                  {character.currentHp} / {character.maxHp}
                  {hpMissing > 0 && (
                    <span className="text-green-500 ml-1">→ {character.maxHp} (+{hpMissing})</span>
                  )}
                </div>
              </div>
              {hpMissing === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <span className="text-xs font-bold text-green-500">Макс.</span>
              )}
            </div>

            {/* Hit Dice */}
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50">
              <Dice6 className="w-4 h-4 text-accent shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Кости хитов</div>
                <div className="text-xs text-muted-foreground">
                  {currentDice} / {totalDice}
                  {newDice > currentDice && (
                    <span className="text-green-500 ml-1">→ {newDice} (+{newDice - currentDice})</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Восстанавливается половина максимума (минимум 1): +{diceRestored}
                </div>
              </div>
              {currentDice === totalDice ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <span className="text-xs font-bold text-green-500 shrink-0">+{diceRestored}</span>
              )}
            </div>

            {/* Spell slots */}
            {hasSpellSlots && (
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border/50">
                <Wand2 className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">Ячейки заклинаний</div>
                  <div className="text-xs text-muted-foreground">
                    {usedSpellSlots > 0
                      ? `${usedSpellSlots} потраченных → все восстановлены`
                      : "Все ячейки уже восстановлены"}
                  </div>
                </div>
                {usedSpellSlots === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <span className="text-xs font-bold text-green-500 shrink-0">Восст.</span>
                )}
              </div>
            )}
          </div>
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleRest} className="gap-2">
            <Moon className="w-3.5 h-3.5" />
            Отдохнуть
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
