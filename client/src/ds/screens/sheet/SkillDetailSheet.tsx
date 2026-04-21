import { useEffect, useState } from "react";
import { Dice6 } from "lucide-react";

import { cn } from "@/lib/utils";
import { BottomSheet } from "@/ds/hero";
import { Button, Die, Tag } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import {
  ABILITY_LABELS,
  formatModifier,
  type AbilityName,
  type Character,
} from "@shared/schema";

import { computeSkillBonus } from "./skill-utils";

/**
 * S-02 — skill expand. Bottom-sheet с расшифровкой навыка:
 *   - описание
 *   - разбор бонуса (ability mod + prof / expertise)
 *   - Roll d20 + история бросков (ephemeral, живёт в useState на время
 *     открытой sheet-сессии; handoff §13.2 вопрос №2 — persistence отложен).
 *
 * rollD20 — pure-module helper (ESLint не любит Math.random в component body).
 */

function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

interface Skill {
  name: string;
  ability: AbilityName;
  description: string;
}

interface RollEntry {
  d20: number;
  total: number;
  at: number; // timestamp
}

const MAX_HISTORY = 5;

export function SkillDetailSheet({
  open,
  onOpenChange,
  skill,
  character,
  abilityMod,
  profBonus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: Skill | null;
  character: Character;
  abilityMod: number;
  profBonus: number;
}) {
  const [history, setHistory] = useState<RollEntry[]>([]);

  useEffect(() => {
    if (open) setHistory([]); // сброс при каждом открытии
  }, [open, skill?.name]);

  if (!skill) return null;

  const proficiency =
    character.skills[skill.name] ?? { proficient: false, expertise: false };
  const bonus = computeSkillBonus(abilityMod, proficiency, profBonus);

  const tier = proficiency.expertise
    ? "мастерство"
    : proficiency.proficient
      ? "профицент"
      : null;

  const roll = () => {
    const d20 = rollD20();
    const total = d20 + bonus;
    setHistory((h) => [{ d20, total, at: Date.now() }, ...h].slice(0, MAX_HISTORY));
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={skill.name}
      description={`${ABILITY_LABELS[skill.ability].ru} · ${skill.ability}`}
    >
      {/* Description */}
      <p className={cn(typeClass("body-sm"), "text-ink-700 mt-2")}>
        {skill.description}
      </p>

      {/* Breakdown */}
      <div className="rounded-ds-md bg-paper-2 border border-ink-200 p-3 mt-3">
        <div className="flex items-baseline justify-between">
          <div className={cn(typeClass("label"), "text-ink-500")}>Итого</div>
          <div className="font-ds-serif text-[30px] font-medium text-ink-900 leading-none">
            {formatModifier(bonus)}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Tag>
            {skill.ability} {formatModifier(abilityMod)}
          </Tag>
          {proficiency.proficient && (
            <Tag variant="ruby">+{profBonus} проф.</Tag>
          )}
          {proficiency.expertise && (
            <Tag variant="ruby">+{profBonus} ×2 мастер.</Tag>
          )}
          {tier && <Tag variant="sage">{tier}</Tag>}
        </div>
      </div>

      {/* Roll button */}
      <Button
        variant="primary"
        className="w-full mt-3"
        onClick={roll}
        data-testid="skill-roll-d20"
      >
        <Dice6 className="w-4 h-4" />
        Бросить d20 {formatModifier(bonus)}
      </Button>

      {/* Roll history (ephemeral) */}
      {history.length > 0 && (
        <div className="mt-4">
          <div className={cn(typeClass("label"), "text-ink-500 mb-2")}>
            Броски этой сессии
          </div>
          <div className="space-y-1.5">
            {history.map((h, i) => {
              const isCrit = h.d20 === 20;
              const isFumble = h.d20 === 1;
              return (
                <div
                  key={h.at}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-ds-sm border",
                    isCrit && "bg-sage-bg border-sage-soft",
                    isFumble && "bg-ruby-bg border-ruby-soft",
                    !isCrit && !isFumble && "bg-paper-card border-ink-200",
                    i === 0 && "ring-1 ring-ink-300",
                  )}
                >
                  <Die
                    sides={20}
                    value={h.d20}
                    variant={isCrit ? "active" : "default"}
                    size={26}
                  />
                  <div className="flex-1">
                    <span className={cn(typeClass("code"), "text-ink-500")}>
                      d20({h.d20}) {formatModifier(bonus)} ={" "}
                      <span className="font-semibold text-ink-900">{h.total}</span>
                    </span>
                  </div>
                  {isCrit && (
                    <span className={cn(typeClass("label"), "text-sage")}>КРИТ</span>
                  )}
                  {isFumble && (
                    <span className={cn(typeClass("label"), "text-ruby")}>ПРОМАХ</span>
                  )}
                  {i === 0 && !isCrit && !isFumble && (
                    <span className={cn(typeClass("label"), "text-ink-400")}>
                      последний
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className={cn(typeClass("caption"), "text-ink-500 mt-2")}>
            Хранятся последние {MAX_HISTORY} бросков. Persistent-лог — позже.
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
