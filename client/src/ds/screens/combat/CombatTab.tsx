/**
 * PLACEHOLDER — Phase D routing wire-up. Реальный экран — Phase E1.
 * Использует готовые hero-компоненты (HPWidget + AbilityTile), данные из
 * useCharacterState, но без discrete-хуков — те подключатся в Phase E.
 */
import { HPWidget } from "@/ds/hero";
import { Button } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useCharacterState } from "@/hooks/character/useCharacterState";

export function CombatTab({ characterId }: { characterId: string }) {
  const { character } = useCharacterState(characterId);

  if (!character) {
    return (
      <div className="p-5 text-ink-500">
        <div className={typeClass("body-sm")}>Загрузка персонажа…</div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      <div className={`${typeClass("label")} text-ink-500`}>PHASE D · PLACEHOLDER</div>

      <HPWidget
        current={character.currentHp}
        max={character.maxHp}
        temp={character.tempHp}
        onDamage={() => alert("TODO Phase E1: damage bottom-sheet")}
        onHeal={() => alert("TODO Phase E1: heal bottom-sheet")}
      />

      <div className="grid grid-cols-3 gap-1.5">
        {[
          ["КД", character.armorClass],
          ["ИНИЦ", character.initiative >= 0 ? `+${character.initiative}` : character.initiative],
          ["СКОР", `${character.speed} фт`],
        ].map(([l, v]) => (
          <div
            key={String(l)}
            className="bg-paper-card border border-ink-200 rounded-ds-md p-2 text-center"
          >
            <div className="font-ds-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-500">
              {l}
            </div>
            <div className="font-ds-serif text-[22px] font-medium mt-0.5 text-ink-900">
              {v}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-ds-md border border-dashed border-ink-300 p-4 text-center">
        <div className={`${typeClass("body-sm")} text-ink-600`}>
          Далее (Phase E1): атаки, слоты мини, кнопки короткого / долгого отдыха.
        </div>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => alert("Phase E")}
        >
          Phase E coming soon
        </Button>
      </div>
    </div>
  );
}
