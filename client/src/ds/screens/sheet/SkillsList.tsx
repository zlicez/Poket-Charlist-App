import { Star } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import {
  SKILLS,
  formatModifier,
  getProficiencyBonus,
  getTotalLevel,
  getCharacterClasses,
  type Character,
} from "@shared/schema";

import { SkillDetailSheet } from "./SkillDetailSheet";
import {
  computeAbility,
  computeSkillBonus,
  proficiencyTier,
} from "./skill-utils";

/**
 * S-01 (нижняя часть): список всех 18 навыков.
 * Handoff 03-screens.jsx SheetScreen:
 *   [dot (tier)] [name] [ability tag] [bonus]
 *     tier 0 → ink-200 outline
 *     tier 1 → ink-700 filled
 *     tier 2 → ruby filled (expertise)
 *
 * Tap по ряду → SkillDetailSheet (S-02) с deep-view и roll-кнопкой.
 */
export function SkillsList({ character }: { character: Character }) {
  const [openSkill, setOpenSkill] = useState<(typeof SKILLS)[number] | null>(null);

  const totalLevel = getTotalLevel(getCharacterClasses(character));
  const profBonus = getProficiencyBonus(totalLevel);

  // Кешируем рассчитанные абилити-моды (6 абилок, 18 навыков ссылаются).
  const abilityMods = useMemo(() => {
    return {
      STR: computeAbility(character, "STR").mod,
      DEX: computeAbility(character, "DEX").mod,
      CON: computeAbility(character, "CON").mod,
      INT: computeAbility(character, "INT").mod,
      WIS: computeAbility(character, "WIS").mod,
      CHA: computeAbility(character, "CHA").mod,
    };
  }, [character]);

  return (
    <>
      <div className="rounded-ds-md border border-ink-200 bg-paper-card overflow-hidden">
        {SKILLS.map((skill, i) => {
          const proficiency =
            character.skills[skill.name] ?? { proficient: false, expertise: false };
          const tier = proficiencyTier(proficiency);
          const abilityMod = abilityMods[skill.ability];
          const bonus = computeSkillBonus(abilityMod, proficiency, profBonus);

          return (
            <button
              key={skill.name}
              type="button"
              onClick={() => setOpenSkill(skill)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5",
                "text-left transition-colors duration-150",
                "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
                "hover:bg-paper-2 active:bg-ink-100",
                i < SKILLS.length - 1 && "border-b border-ink-100",
              )}
              data-testid={`skill-row-${skill.name}`}
            >
              <ProficiencyDot tier={tier} />
              <span className="flex-1 text-[13.5px] font-ds-sans text-ink-900 min-w-0 truncate">
                {skill.name}
              </span>
              <span className={cn(typeClass("code"), "text-ink-500 uppercase")}>
                {skill.ability}
              </span>
              <span
                className={cn(
                  "font-ds-mono text-[13px] font-semibold tabular-nums w-9 text-right",
                  bonus >= 0 ? "text-ink-900" : "text-ruby",
                )}
              >
                {formatModifier(bonus)}
              </span>
            </button>
          );
        })}
      </div>

      <SkillDetailSheet
        open={Boolean(openSkill)}
        onOpenChange={(o) => !o && setOpenSkill(null)}
        skill={openSkill}
        character={character}
        abilityMod={openSkill ? abilityMods[openSkill.ability] : 0}
        profBonus={profBonus}
      />
    </>
  );
}

function ProficiencyDot({ tier }: { tier: 0 | 1 | 2 }) {
  if (tier === 2) {
    return (
      <span
        className="w-3 h-3 rounded-full bg-ruby flex items-center justify-center shrink-0"
        aria-label="мастерство"
      >
        <Star className="w-2 h-2 text-white fill-current" />
      </span>
    );
  }
  if (tier === 1) {
    return <span className="w-2.5 h-2.5 rounded-full bg-ink-700 shrink-0" aria-label="профицент" />;
  }
  return <span className="w-2.5 h-2.5 rounded-full border border-ink-300 shrink-0" aria-hidden />;
}
