import { Moon } from "lucide-react";

import { BottomSheet } from "@/ds/hero";
import { Button } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useCommitRest } from "@/hooks/character/useCommitRest";
import {
  getCharacterClasses,
  getTotalLevel,
  type Character,
  type Spellcasting,
} from "@shared/schema";

/**
 * B-05 — Long rest bottom-sheet. One-button full restore (handoff README §Rest flows).
 *
 * Applies:
 *   currentHp → maxHp
 *   hitDiceRemaining += ceil(totalLevel / 2)  [capped at totalLevel]
 *   spellcasting.spellSlots[].used → 0 (все восстановлены)
 *   spellcasting.pactMagic.used → 0
 *   deathSaves → { successes: 0, failures: 0 }
 */
export function LongRestSheet({
  open,
  onOpenChange,
  character,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
}) {
  const commitRest = useCommitRest(character.id);

  const totalLevel = getTotalLevel(getCharacterClasses(character));
  const hdGain = Math.min(
    Math.max(1, Math.ceil(totalLevel / 2)),
    totalLevel - (character.hitDiceRemaining ?? 0),
  );
  const newHd = Math.min(totalLevel, (character.hitDiceRemaining ?? 0) + hdGain);

  const apply = () => {
    const patch: Partial<Character> = {
      currentHp: character.maxHp,
      hitDiceRemaining: newHd,
      deathSaves: { successes: 0, failures: 0 },
    };
    if (character.spellcasting) {
      const next: Spellcasting = {
        ...character.spellcasting,
        spellSlots: character.spellcasting.spellSlots.map((s) => ({ ...s, used: 0 })),
        pactMagic: character.spellcasting.pactMagic
          ? { ...character.spellcasting.pactMagic, used: 0 }
          : character.spellcasting.pactMagic,
      };
      patch.spellcasting = next;
    }
    commitRest.mutate(patch);
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="inline-flex items-center gap-2">
          <Moon className="w-4 h-4 text-ocean" />
          Долгий отдых
        </span>
      }
      description="Полное восстановление за один клик"
    >
      <div className="mt-2 space-y-2 p-3 bg-paper-2 rounded-ds-md">
        <Row label="HP" value={`${character.currentHp} → ${character.maxHp}`} />
        <Row
          label="Кости хитов"
          value={`${character.hitDiceRemaining ?? 0} → ${newHd}  (из ${totalLevel})`}
        />
        {character.spellcasting && (
          <Row label="Ячейки заклинаний" value="всё восстановлено" />
        )}
        <Row label="Спасброски от смерти" value="0 / 0" />
      </div>

      <div className="flex gap-2.5 mt-3.5">
        <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
          Отмена
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={apply}
          data-testid="long-rest-apply"
        >
          Отдохнуть до утра
        </Button>
      </div>

      <div className={`${typeClass("caption")} text-ink-500 text-center mt-3`}>
        Половина HD восстанавливается, все ячейки полные.
      </div>
    </BottomSheet>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className={typeClass("label") + " text-ink-500"}>{label}</span>
      <span className="font-ds-mono text-ink-900">{value}</span>
    </div>
  );
}
