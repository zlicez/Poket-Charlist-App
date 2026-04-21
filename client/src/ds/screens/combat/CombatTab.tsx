/**
 * B-01 — Combat tab (play-mode). Handoff 03-screens.jsx CombatScreen mock.
 * Это 80% траффика игры: HP, атаки, слоты, отдых. Всё делается за 1 тап.
 *
 * Слои:
 *   [LevelUpBadge]                       — если XP ≥ порог
 *   [DeathSavesPanel]                    — если currentHp === 0
 *   [HPWidget]                           — центральное действие
 *   [AttackToast]                        — после tap на weapon
 *   [КД / Иниц / Скор 3-card row]
 *   [Attacks list (ListRow с атк/damage)]
 *   [Rest buttons (короткий / долгий)]
 *   [Slots mini (первые 3 уровня + pact)]
 *
 * Открытые sheet'ы (Radix Dialog под капотом) — Damage / Heal / TempHp /
 * LongRest / ShortRest.
 */
import { useMemo, useState } from "react";
import { Coffee, Moon, Swords } from "lucide-react";

import { cn } from "@/lib/utils";
import { HPWidget } from "@/ds/hero";
import { Button, SlotRow } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useCharacterState } from "@/hooks/character/useCharacterState";
import { useSetSpellSlots } from "@/hooks/character/useSetSpellSlots";
import { useApplyHeal } from "@/hooks/character/useApplyHeal";
import {
  calculateAC,
  calculateModifier,
  calculateSpellSaveDC,
  formatModifier,
  getCharacterClasses,
  getProficiencyBonus,
  getRacialBonuses,
  getTotalLevel,
  isWeaponProficient,
  resolveClassState,
  type ArmorData,
  type Weapon,
} from "@shared/schema";
import {
  getActiveWeaponDamage,
  getEquippedInventoryWeapons,
} from "@/lib/weapons";

import { DamageSheet } from "./sheets/DamageSheet";
import { HealSheet } from "./sheets/HealSheet";
import { TempHpSheet } from "./sheets/TempHpSheet";
import { LongRestSheet } from "./sheets/LongRestSheet";
import { ShortRestScreen } from "./sheets/ShortRestScreen";
import { AttackToast, type AttackToastData } from "./sheets/AttackToast";
import { DeathSavesPanel } from "./DeathSavesPanel";
import { LevelUpBadge } from "./LevelUpBadge";

// Pure-module helper — линтер не флагает Math.random() в render, если
// вызов живёт за пределами компонента.
function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function CombatTab({ characterId }: { characterId: string }) {
  const { character } = useCharacterState(characterId);
  const setSpellSlots = useSetSpellSlots(characterId);
  const applyHeal = useApplyHeal(characterId);

  const [damageOpen, setDamageOpen] = useState(false);
  const [healOpen, setHealOpen] = useState(false);
  const [tempOpen, setTempOpen] = useState(false);
  const [shortRestOpen, setShortRestOpen] = useState(false);
  const [longRestOpen, setLongRestOpen] = useState(false);
  const [attackToast, setAttackToast] = useState<AttackToastData | null>(null);

  const racialBonuses = useMemo(
    () =>
      character
        ? getRacialBonuses(
            character.race,
            character.subrace,
            character.selectedRacialAbilityBonuses,
          )
        : null,
    [character],
  );

  if (!character || !racialBonuses) {
    return (
      <div className="p-6 text-center text-ink-500 font-ds-sans">
        Загрузка персонажа…
      </div>
    );
  }

  const classes = getCharacterClasses(character);
  const totalLevel = getTotalLevel(classes);
  const profBonus = getProficiencyBonus(totalLevel);

  const totalStr =
    character.abilityScores.STR +
    (racialBonuses.STR || 0) +
    (character.customAbilityBonuses?.STR || 0);
  const totalDex =
    character.abilityScores.DEX +
    (racialBonuses.DEX || 0) +
    (character.customAbilityBonuses?.DEX || 0);
  const strMod = calculateModifier(totalStr);
  const dexMod = calculateModifier(totalDex);

  // AC: пробуем calculateAC из schema на экипированных доспехах, иначе базовая.
  const equippedArmor = character.equipment.find(
    (e) => e.equipped && e.isArmor && e.armorType !== "shield",
  );
  const hasShield = character.equipment.some(
    (e) => e.equipped && e.isArmor && e.armorType === "shield",
  );
  const armorData: ArmorData | null = equippedArmor
    ? {
        name: equippedArmor.name,
        type: (equippedArmor.armorType ?? "light") as ArmorData["type"],
        baseAC: equippedArmor.armorBaseAC ?? 10,
        maxDexBonus: equippedArmor.armorMaxDexBonus ?? null,
        stealthDisadvantage: false,
      }
    : null;
  const ac = equippedArmor
    ? calculateAC(dexMod, armorData, hasShield, character.customACBonus ?? 0)
    : character.armorClass;

  // Initiative — DEX mod + custom.
  const initiative = dexMod + (character.customInitiativeBonus ?? 0);

  // Weapons + equipped inventory weapons (dual lists legacy behavior).
  const inventoryWeapons = getEquippedInventoryWeapons(character.equipment);
  const allWeapons: Weapon[] = [...character.weapons, ...inventoryWeapons];

  const rollAttack = (weapon: Weapon) => {
    const abilityMod = weapon.abilityMod === "dex" ? dexMod : strMod;
    const isProf = isWeaponProficient(
      weapon.name,
      character.proficiencies,
      weapon.weaponCategory,
    );
    const attackBonus = abilityMod + (isProf ? profBonus : 0) + (weapon.attackBonus ?? 0);
    const d20 = rollD20();
    const total = d20 + attackBonus;
    setAttackToast({
      weaponName: weapon.name,
      attackBonus,
      damageNotation: getActiveWeaponDamage(weapon),
      d20,
      total,
      onRollDamage: () => {
        setAttackToast(null);
        setDamageOpen(true);
      },
      onDismiss: () => setAttackToast(null),
    });
  };

  const downed = character.currentHp <= 0;

  // Spell slots for mini panel (first 3 levels + pact).
  const spellcasting = character.spellcasting;
  const resolvedSpellcasting = resolveClassState(character).spellcasting;
  const hasSpellcasting = Boolean(resolvedSpellcasting.hasSpellcasting);
  const spellAbilityMod = spellcasting
    ? calculateModifier(
        character.abilityScores[spellcasting.ability] +
          (racialBonuses[spellcasting.ability] || 0) +
          (character.customAbilityBonuses?.[spellcasting.ability] || 0),
      )
    : 0;
  const spellSaveDC = spellcasting
    ? calculateSpellSaveDC(spellAbilityMod, profBonus)
    : null;

  const toggleSlot = (level: number, index: number) => {
    if (!spellcasting) return;
    const slots = [...spellcasting.spellSlots];
    const slot = slots[level - 1];
    if (!slot) return;
    const used = index < slot.used ? index : index + 1;
    slots[level - 1] = { ...slot, used: Math.max(0, Math.min(slot.max, used)) };
    setSpellSlots.mutate({ spellSlots: slots });
  };

  const resetSlotLevel = (level: number) => {
    if (!spellcasting) return;
    const slots = [...spellcasting.spellSlots];
    slots[level - 1] = { ...slots[level - 1], used: 0 };
    setSpellSlots.mutate({ spellSlots: slots });
  };

  return (
    <div className="p-3 space-y-3 font-ds-sans">
      {/* LevelUp badge */}
      <LevelUpBadge
        xp={character.experience}
        currentLevel={totalLevel}
        onOpenWizard={() => alert("Phase F: level-up wizard")}
      />

      {/* Death saves (auto at HP=0) */}
      {downed && (
        <DeathSavesPanel
          characterId={characterId}
          deathSaves={character.deathSaves}
          onRevive={() => applyHeal.mutate(1)}
        />
      )}

      {/* HP widget */}
      <HPWidget
        current={character.currentHp}
        max={character.maxHp}
        temp={character.tempHp}
        onDamage={() => setDamageOpen(true)}
        onHeal={() => setHealOpen(true)}
        onSetTemp={() => setTempOpen(true)}
      />

      {/* Attack toast (transient, под HP) */}
      <AttackToast data={attackToast} />

      {/* Combat stats row */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="КД" value={ac} />
        <StatCard label="ИНИЦ" value={formatModifier(initiative)} />
        <StatCard label="СКОР" value={`${character.speed} фт`} />
      </div>

      {/* Attacks */}
      {allWeapons.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between px-0.5 pb-1.5">
            <div className="font-ds-sans text-[13.5px] font-semibold">Атаки</div>
            <div className={cn(typeClass("code"), "text-ink-500")}>
              Бонус мастерства {formatModifier(profBonus)}
            </div>
          </div>
          <div className="rounded-ds-md border border-ink-200 bg-paper-card overflow-hidden">
            {allWeapons.map((w, i) => {
              const abilityMod = w.abilityMod === "dex" ? dexMod : strMod;
              const isProf = isWeaponProficient(
                w.name,
                character.proficiencies,
                w.weaponCategory,
              );
              const attackBonus =
                abilityMod + (isProf ? profBonus : 0) + (w.attackBonus ?? 0);
              return (
                <div
                  key={`${w.id}-${i}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5",
                    i < allWeapons.length - 1 && "border-b border-ink-100",
                  )}
                >
                  <Swords className="w-4 h-4 text-ink-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-ds-sans text-[13.5px] font-semibold truncate">
                      {w.name}
                    </div>
                    <div className={cn(typeClass("code"), "text-ink-500 truncate")}>
                      {getActiveWeaponDamage(w)} · {w.damageType}
                      {isProf ? "" : " · без профицента"}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rollAttack(w)}
                    data-testid={`attack-roll-${w.id}`}
                  >
                    атк {formatModifier(attackBonus)}
                  </Button>
                  <Button
                    variant="ruby"
                    size="sm"
                    onClick={() => setDamageOpen(true)}
                    aria-label={`Нанести урон ${getActiveWeaponDamage(w)}`}
                  >
                    {getActiveWeaponDamage(w)}
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Rest buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="justify-start gap-2 py-3"
          onClick={() => setShortRestOpen(true)}
          data-testid="open-short-rest"
        >
          <Coffee className="w-4 h-4 text-amber-600" />
          <div className="text-left leading-tight">
            <div className="text-[13px] font-semibold">Короткий отдых</div>
            <div className={cn(typeClass("code"), "text-ink-500")}>
              {character.hitDiceRemaining ?? 0} / {totalLevel} HD
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="justify-start gap-2 py-3"
          onClick={() => setLongRestOpen(true)}
          data-testid="open-long-rest"
        >
          <Moon className="w-4 h-4 text-ocean" />
          <div className="text-left leading-tight">
            <div className="text-[13px] font-semibold">Долгий отдых</div>
            <div className={cn(typeClass("code"), "text-ink-500")}>
              полное восст.
            </div>
          </div>
        </Button>
      </div>

      {/* Spell slots mini */}
      {hasSpellcasting && spellcasting && (
        <section>
          <div className="flex items-baseline justify-between px-0.5 pb-1.5">
            <div className="font-ds-sans text-[13.5px] font-semibold">
              Ячейки заклинаний
            </div>
            <div className={cn(typeClass("code"), "text-ruby")}>
              DC {spellSaveDC ?? "—"}
            </div>
          </div>
          <div className="rounded-ds-md border border-ink-200 bg-paper-card p-3 space-y-2">
            {spellcasting.spellSlots.slice(0, 3).map((s, i) =>
              s.max > 0 ? (
                <SlotRow
                  key={i}
                  level={i + 1}
                  used={s.used}
                  max={s.max}
                  onToggle={(idx) => toggleSlot(i + 1, idx)}
                  onLongPress={() => resetSlotLevel(i + 1)}
                />
              ) : null,
            )}
            {spellcasting.pactMagic && spellcasting.pactMagic.max > 0 && (
              <SlotRow
                level="P"
                label={`пакт ${spellcasting.pactMagic.slotLevel}`}
                used={spellcasting.pactMagic.used}
                max={spellcasting.pactMagic.max}
                onToggle={(idx) => {
                  const pm = spellcasting.pactMagic!;
                  const used = idx < pm.used ? idx : idx + 1;
                  setSpellSlots.mutate({
                    pactMagic: {
                      ...pm,
                      used: Math.max(0, Math.min(pm.max, used)),
                    },
                  });
                }}
                onLongPress={() => {
                  const pm = spellcasting.pactMagic!;
                  setSpellSlots.mutate({ pactMagic: { ...pm, used: 0 } });
                }}
              />
            )}
          </div>
        </section>
      )}

      {/* Sheets */}
      <DamageSheet open={damageOpen} onOpenChange={setDamageOpen} characterId={characterId} />
      <HealSheet open={healOpen} onOpenChange={setHealOpen} characterId={characterId} />
      <TempHpSheet
        open={tempOpen}
        onOpenChange={setTempOpen}
        characterId={characterId}
        currentTemp={character.tempHp}
      />
      <LongRestSheet
        open={longRestOpen}
        onOpenChange={setLongRestOpen}
        character={character}
      />
      <ShortRestScreen
        open={shortRestOpen}
        onOpenChange={setShortRestOpen}
        character={character}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-center p-2 bg-paper-card border border-ink-200 rounded-ds-md">
      <div className="font-ds-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-500">
        {label}
      </div>
      <div className="font-ds-serif text-[22px] font-medium text-ink-900 mt-0.5">
        {value}
      </div>
    </div>
  );
}
