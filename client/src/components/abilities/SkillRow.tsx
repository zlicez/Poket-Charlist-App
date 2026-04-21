import { HelpTooltip } from "@/components/ui/help-tooltip";
import { Star } from "lucide-react";
import { formatModifier, type SkillProficiency } from "@shared/schema";

interface SkillLike {
  name: string;
  description?: string;
}

export interface SkillRowProps {
  skill: SkillLike;
  proficiency: SkillProficiency;
  modifier: number;
  profBonus: number;
  isEditing: boolean;
  compact: boolean;
  onProficiencyClick: (skillName: string, current: SkillProficiency) => void;
  onRollSkill: (skillName: string) => void;
}

export function SkillRow({
  skill,
  proficiency,
  modifier,
  profBonus,
  isEditing,
  compact,
  onProficiencyClick,
  onRollSkill,
}: SkillRowProps) {
  let skillBonus = modifier;
  if (proficiency.expertise) {
    skillBonus += profBonus * 2;
  } else if (proficiency.proficient) {
    skillBonus += profBonus;
  }

  const testIdSlug = skill.name.toLowerCase().replace(/\s/g, "-");

  return (
    <div
      className={`
        flex items-center gap-2 px-2 rounded
        ${compact ? "py-1 min-h-[36px]" : "py-1.5 min-h-[40px] sm:min-h-[26px]"}
        ${!isEditing ? "cursor-pointer active:bg-ability-proficient-bg" : ""}
        ${proficiency.proficient ? "bg-ability-proficient-bg" : ""}
      `}
      onClick={() => !isEditing && onRollSkill(skill.name)}
      data-testid={`skill-${testIdSlug}`}
    >
      <button
        type="button"
        className={`
          flex items-center justify-center rounded-full shrink-0
          ${compact ? "w-4 h-4" : "w-9 h-9 sm:w-5 sm:h-5"}
          ${isEditing ? "cursor-pointer hover-elevate" : "pointer-events-none"}
          ${proficiency.proficient ? "bg-accent/30" : "bg-muted border border-border"}
        `}
        onClick={(e) => {
          e.stopPropagation();
          onProficiencyClick(skill.name, proficiency);
        }}
        data-testid={`checkbox-skill-${testIdSlug}`}
      >
        {proficiency.expertise ? (
          <Star className="w-2.5 h-2.5 text-accent fill-current" />
        ) : proficiency.proficient ? (
          <div
            className={`rounded-full bg-accent ${
              compact ? "w-1.5 h-1.5" : "w-2.5 h-2.5 sm:w-2 sm:h-2"
            }`}
          />
        ) : null}
      </button>

      <span
        className={`
          flex-1 min-w-0 truncate uppercase tracking-wide
          ${compact ? "text-[11px]" : "text-xs sm:text-sm"}
          ${proficiency.proficient ? "font-medium text-foreground" : "text-muted-foreground"}
        `}
      >
        {skill.name}
      </span>

      {skill.description && (
        <span onClick={(e) => e.stopPropagation()} className="shrink-0">
          <HelpTooltip
            content={
              <div className="space-y-1">
                <p className="font-medium text-sm">{skill.name}</p>
                <p className="text-xs text-muted-foreground">{skill.description}</p>
                {proficiency.proficient && (
                  <p className="text-xs text-accent">
                    {proficiency.expertise ? "Мастерство" : "Профессия"}: +
                    {proficiency.expertise ? profBonus * 2 : profBonus} включено
                  </p>
                )}
              </div>
            }
            iconSize="xs"
            side="right"
          />
        </span>
      )}

      <span
        className={`
          font-bold font-mono tabular-nums
          ${compact ? "text-xs" : "text-xs sm:text-sm"}
          ${skillBonus >= 0 ? "text-positive" : "text-negative"}
        `}
      >
        {formatModifier(skillBonus)}
      </span>
    </div>
  );
}
