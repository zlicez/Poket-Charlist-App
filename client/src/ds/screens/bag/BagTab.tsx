/**
 * PLACEHOLDER — Phase D routing wire-up. Реальный экран — Phase E4.
 */
import { typeClass } from "@/ds/tokens";
import { useCharacterState } from "@/hooks/character/useCharacterState";

const COIN_LABELS: Record<string, string> = {
  cp: "ММ",
  sp: "СМ",
  ep: "ЭМ",
  gp: "ЗМ",
  pp: "ПМ",
};

export function BagTab({ characterId }: { characterId: string }) {
  const { character } = useCharacterState(characterId);

  if (!character) return <div className="p-5 text-ink-500">Загрузка…</div>;

  const money = character.money ?? { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

  return (
    <div className="p-3 space-y-3">
      <div className={`${typeClass("label")} text-ink-500`}>PHASE D · PLACEHOLDER</div>
      <div className="rounded-ds-md border border-ink-200 bg-paper-card p-3">
        <div className="font-ds-sans text-[13.5px] font-semibold mb-2">Кошелёк</div>
        <div className="grid grid-cols-5 gap-1.5">
          {(["cp", "sp", "ep", "gp", "pp"] as const).map((k) => (
            <div
              key={k}
              className="text-center p-2 bg-paper-2 border border-ink-200 rounded-ds-sm"
            >
              <div className="font-ds-mono text-[9.5px] text-ink-500">{COIN_LABELS[k]}</div>
              <div className="font-ds-serif text-[18px] font-medium mt-0.5">
                {money[k] ?? 0}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-ds-md border border-dashed border-ink-300 p-4 text-center text-ink-600 text-[13px]">
        Далее (Phase E4): снаряжение list, заметки с rich-text.
      </div>
    </div>
  );
}
