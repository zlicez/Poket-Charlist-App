/**
 * S-01 + S-02 + S-07 — Sheet tab оркестратор. Handoff 03-screens.jsx SheetScreen.
 *
 * Layout (mobile):
 *   [identity card: avatar + race/class + XP bar]
 *   [6 AbilityTile grid 3×2]
 *   [Skills label + SkillsList (18 rows)]
 *   [Features label + FeaturesList]
 *
 * AbilityTile tap → alert (ability roll — нужен flow позже, Phase I);
 * tile long-press → navigate in Skills list (future). Пока tap = simple roll.
 */
import { useState } from "react";

import { cn } from "@/lib/utils";
import { AbilityTile, formatModifier } from "@/ds/hero";
import { typeClass } from "@/ds/tokens";
import { useCharacterState } from "@/hooks/character/useCharacterState";
import {
  ABILITY_LABELS,
  ABILITY_NAMES,
  getCharacterClasses,
  getProficiencyBonus,
  getTotalLevel,
  getXPProgress,
} from "@shared/schema";

import { SkillsList } from "./SkillsList";
import { FeaturesList } from "./FeaturesList";
import { computeAbility } from "./skill-utils";
import { BottomSheet } from "@/ds/hero";
import { Button, Die } from "@/ds/primitives";

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function SheetTab({ characterId }: { characterId: string }) {
  const { character } = useCharacterState(characterId);

  const [abilityRoll, setAbilityRoll] = useState<{
    ability: (typeof ABILITY_NAMES)[number];
    d20: number;
    mod: number;
  } | null>(null);

  if (!character) {
    return <div className="p-6 text-center text-ink-500 font-ds-sans">Загрузка…</div>;
  }

  const classes = getCharacterClasses(character);
  const totalLevel = getTotalLevel(classes);
  const profBonus = getProficiencyBonus(totalLevel);
  const xp = getXPProgress(character.experience, totalLevel);
  const xpPct = Math.max(0, Math.min(100, xp.progress * 100));
  const primaryClass = classes[0]?.name ?? character.class;

  return (
    <div className="p-3 space-y-3 font-ds-sans">
      {/* Identity card */}
      <div className="rounded-ds-md border border-ink-200 bg-paper-card p-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-ruby-bg border-2 border-ruby-soft text-ruby flex items-center justify-center font-ds-serif font-medium shrink-0">
            {character.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className={cn(typeClass("code"), "text-ink-500 uppercase")}>
              {character.race} · {primaryClass}
              {character.subclass ? ` · ${character.subclass}` : ""}
            </div>
            <div className="font-ds-sans text-[14px] font-semibold mt-0.5">
              Ур. {totalLevel} · {xp.current.toLocaleString("ru")} /{" "}
              {xp.next.toLocaleString("ru")} XP
            </div>
            <div className="h-1 bg-ink-100 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gold rounded-full motion-safe:transition-[width] motion-safe:duration-500"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ability tiles 3×2 */}
      <div className="grid grid-cols-3 gap-1.5">
        {ABILITY_NAMES.map((a) => {
          const { total, mod } = computeAbility(character, a);
          return (
            <AbilityTile
              key={a}
              label={a}
              modifier={mod}
              score={total}
              hasSaveProficiency={Boolean(character.savingThrows[a])}
              onPress={() => setAbilityRoll({ ability: a, d20: rollD20(), mod })}
            />
          );
        })}
      </div>

      {/* Skills */}
      <section>
        <div className="flex items-baseline justify-between px-0.5 pb-1.5">
          <div className="font-ds-sans text-[13.5px] font-semibold">Навыки</div>
          <div className={cn(typeClass("code"), "text-ink-500")}>
            БО {formatModifier(profBonus)}
          </div>
        </div>
        <SkillsList character={character} />
        <p className={cn(typeClass("caption"), "text-ink-500 mt-1.5 px-0.5")}>
          ● профицент · <span className="inline-block w-2 h-2 rounded-full bg-ruby align-middle" />{" "}
          мастерство · серый — без владения. Tap по строке — подробнее + d20.
        </p>
      </section>

      {/* Features */}
      <section>
        <div className="flex items-baseline justify-between px-0.5 pb-1.5">
          <div className="font-ds-sans text-[13.5px] font-semibold">Способности</div>
          <div className={cn(typeClass("code"), "text-ink-500")}>
            {character.features.length}
          </div>
        </div>
        <FeaturesList features={character.features} />
      </section>

      {/* Ability roll toast (simple modal for now) */}
      <BottomSheet
        open={Boolean(abilityRoll)}
        onOpenChange={(o) => !o && setAbilityRoll(null)}
        title={
          abilityRoll
            ? `Проверка ${ABILITY_LABELS[abilityRoll.ability].ru}`
            : "Проверка"
        }
      >
        {abilityRoll && (
          <div className="flex flex-col items-center py-6">
            <Die
              sides={20}
              value={abilityRoll.d20}
              variant={
                abilityRoll.d20 === 20 ? "active" : abilityRoll.d20 === 1 ? "muted" : "default"
              }
              size={64}
            />
            <div className="font-ds-serif text-[48px] font-medium mt-4 tabular-nums">
              {abilityRoll.d20 + abilityRoll.mod}
            </div>
            <div className={cn(typeClass("code"), "text-ink-500 mt-1")}>
              d20({abilityRoll.d20}) {formatModifier(abilityRoll.mod)}
            </div>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() =>
                setAbilityRoll({
                  ability: abilityRoll.ability,
                  d20: rollD20(),
                  mod: abilityRoll.mod,
                })
              }
            >
              Перебросить
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
