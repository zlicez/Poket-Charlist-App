/**
 * S-05 + S-06 — Bag tab. Handoff 03-screens.jsx BagScreen + NotesScreen.
 *
 * Layout:
 *   [WalletCard — 5-coin grid + per-coin adjust sheet]
 *   [InventoryList — chip filter bar + ListRow + swipe delete + equip toggle]
 *   [NotesEditor — Текст/Предпросмотр tabs + fullscreen]
 *
 * Wallet / notes → handleChange из useCharacterState (debounced track —
 * low frequency, идеально для useDebouncedCharacterUpdate).
 * Inventory → useEquipmentOps (keyed ops, discrete).
 */
import { typeClass } from "@/ds/tokens";
import { useCharacterState } from "@/hooks/character/useCharacterState";

import { WalletCard } from "./WalletCard";
import { InventoryList } from "./InventoryList";
import { NotesEditor } from "./NotesEditor";

export function BagTab({ characterId }: { characterId: string }) {
  const { character, handleChange } = useCharacterState(characterId);

  if (!character) {
    return <div className="p-6 text-center text-ink-500 font-ds-sans">Загрузка…</div>;
  }

  return (
    <div className="p-3 space-y-4 font-ds-sans">
      <WalletCard
        money={character.money ?? { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }}
        onChange={(money) => handleChange({ money })}
      />

      <section>
        <div className="flex items-baseline justify-between px-0.5 pb-1.5">
          <div className="font-ds-sans text-[13.5px] font-semibold">Снаряжение</div>
          <div className={`${typeClass("code")} text-ink-500`}>
            {character.equipment.length}
          </div>
        </div>
        <InventoryList characterId={characterId} equipment={character.equipment} />
      </section>

      <NotesEditor
        value={character.notes ?? ""}
        onChange={(notes) => handleChange({ notes })}
      />
    </div>
  );
}
