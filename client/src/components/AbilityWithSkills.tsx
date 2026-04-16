import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Badge } from "@/components/ui/badge";
import { HelpTooltip, TooltipBody } from "@/components/ui/help-tooltip";
import {
  calculateModifier,
  formatModifier,
  getProficiencyBonus,
  getRacialBonuses,
  ABILITY_LABELS,
  SKILLS_BY_ABILITY,
  type AbilityName,
  type SkillProficiency,
} from "@shared/schema";
import { Star } from "lucide-react";
import {
  ABILITY_TOOLTIPS_EXTENDED,
  ABILITY_MODIFIER_FORMULA,
  ABILITY_MODIFIER_EXAMPLES,
  SAVING_THROW_BY_ABILITY,
  SAVING_THROW_SECTION_TOOLTIP,
} from "@/lib/tooltip-content";

interface AbilityWithSkillsProps {
  ability: AbilityName;
  baseScore: number;
  customBonus: number;
  race: string;
  subrace?: string;
  selectedRacialAbilityBonuses?: Partial<Record<AbilityName, number>>;
  level: number;
  skills: Record<string, SkillProficiency>;
  savingThrowProficient: boolean;
  onScoreChange: (value: number) => void;
  onCustomBonusChange: (value: number) => void;
  onSkillProficiencyChange: (skillName: string, proficiency: SkillProficiency) => void;
  onSavingThrowProficiencyChange: () => void;
  onRollAbility: () => void;
  onRollSavingThrow: () => void;
  onRollSkill: (skillName: string) => void;
  isEditing: boolean;
}



export function AbilityWithSkills({
  ability,
  baseScore,
  customBonus,
  race,
  subrace,
  selectedRacialAbilityBonuses,
  level,
  skills,
  savingThrowProficient,
  onScoreChange,
  onCustomBonusChange,
  onSkillProficiencyChange,
  onSavingThrowProficiencyChange,
  onRollAbility,
  onRollSavingThrow,
  onRollSkill,
  isEditing,
}: AbilityWithSkillsProps) {
  const racialBonuses = getRacialBonuses(
    race,
    subrace,
    selectedRacialAbilityBonuses,
  );
  const racialBonus = racialBonuses[ability] || 0;
  const totalScore = baseScore + racialBonus + customBonus;
  const modifier = calculateModifier(totalScore);
  const profBonus = getProficiencyBonus(level);
  const label = ABILITY_LABELS[ability];
  const relatedSkills = SKILLS_BY_ABILITY[ability];
  const savingThrowBonus = modifier + (savingThrowProficient ? profBonus : 0);

  const handleSkillProficiencyClick = (skillName: string, currentProf: SkillProficiency) => {
    if (!isEditing) return;
    if (!currentProf.proficient) {
      onSkillProficiencyChange(skillName, { proficient: true, expertise: false });
    } else if (!currentProf.expertise) {
      onSkillProficiencyChange(skillName, { proficient: true, expertise: true });
    } else {
      onSkillProficiencyChange(skillName, { proficient: false, expertise: false });
    }
  };

  // ── Shared skill rows renderer ────────────────────────────────────────────
  const renderSkills = (compact: boolean) =>
    relatedSkills.map((skill) => {
      const proficiency = skills[skill.name] || { proficient: false, expertise: false };
      let skillBonus = modifier;
      if (proficiency.expertise) {
        skillBonus += profBonus * 2;
      } else if (proficiency.proficient) {
        skillBonus += profBonus;
      }

      return (
        <div
          key={skill.name}
          className={`
            flex items-center gap-2 px-2 rounded
            ${compact ? 'py-1 min-h-[36px]' : 'py-1.5 min-h-[40px] sm:min-h-[26px]'}
            ${!isEditing ? 'cursor-pointer active:bg-ability-proficient-bg' : ''}
            ${proficiency.proficient ? 'bg-ability-proficient-bg' : ''}
          `}
          onClick={() => !isEditing && onRollSkill(skill.name)}
          data-testid={`skill-${skill.name.toLowerCase().replace(/\s/g, '-')}`}
        >
          <button
            type="button"
            className={`
              flex items-center justify-center rounded-full shrink-0
              ${compact ? 'w-4 h-4' : 'w-9 h-9 sm:w-5 sm:h-5'}
              ${isEditing ? 'cursor-pointer hover-elevate' : 'pointer-events-none'}
              ${proficiency.proficient ? 'bg-accent/30' : 'bg-muted border border-border'}
            `}
            onClick={(e) => {
              e.stopPropagation();
              handleSkillProficiencyClick(skill.name, proficiency);
            }}
            data-testid={`checkbox-skill-${skill.name.toLowerCase().replace(/\s/g, '-')}`}
          >
            {proficiency.expertise ? (
              <Star className="w-2.5 h-2.5 text-accent fill-current" />
            ) : proficiency.proficient ? (
              <div className={`rounded-full bg-accent ${compact ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5 sm:w-2 sm:h-2'}`} />
            ) : null}
          </button>

          <span className={`
            flex-1 min-w-0 truncate uppercase tracking-wide
            ${compact ? 'text-[11px]' : 'text-xs sm:text-sm'}
            ${proficiency.proficient ? 'font-medium text-foreground' : 'text-muted-foreground'}
          `}>
            {skill.name}
          </span>

          {'description' in skill && (
            <span onClick={(e) => e.stopPropagation()} className="shrink-0">
              <HelpTooltip
                content={
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{skill.name}</p>
                    <p className="text-xs text-muted-foreground">{(skill as any).description}</p>
                    {proficiency.proficient && (
                      <p className="text-xs text-accent">
                        {proficiency.expertise ? 'Мастерство' : 'Профессия'}: +{proficiency.expertise ? profBonus * 2 : profBonus} включено
                      </p>
                    )}
                  </div>
                }
                iconSize="xs"
                side="right"
              />
            </span>
          )}

          <span className={`
            font-bold font-mono tabular-nums
            ${compact ? 'text-xs' : 'text-xs sm:text-sm'}
            ${skillBonus >= 0 ? 'text-positive' : 'text-negative'}
          `}>
            {formatModifier(skillBonus)}
          </span>
        </div>
      );
    });

  return (
    <Card className="stat-card flex flex-col h-full">

      {/* ── Mobile layout (< sm) ──────────────────────────────────────────── */}
      <div className="sm:hidden p-2 flex flex-col gap-0.5">

        {/* Header: ability name + score */}
        <div className="flex items-center justify-between px-1 py-0.5">
          <span className="text-sm font-bold uppercase tracking-widest">
            {label.ru}
          </span>
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <NumericInput
                min={1}
                max={30}
                value={baseScore}
                onChange={onScoreChange}
                className="text-center text-sm font-bold h-7 w-12 bg-background"
                data-testid={`input-ability-${ability.toLowerCase()}`}
              />
              <NumericInput
                value={customBonus}
                onChange={onCustomBonusChange}
                className="text-center text-xs h-7 w-10 bg-background"
                data-testid={`input-ability-bonus-${ability.toLowerCase()}`}
              />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold font-mono text-ability-score">
                {totalScore}
              </span>
              <HelpTooltip
                content={
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{ABILITY_TOOLTIPS_EXTENDED[ability].title}</p>
                    <p className="text-xs text-muted-foreground">{ABILITY_TOOLTIPS_EXTENDED[ability].description}</p>
                    <div className="border-t border-border/40 pt-1">
                      <p className="text-xs text-muted-foreground">Спасбросок: {SAVING_THROW_BY_ABILITY[ability]}</p>
                    </div>
                  </div>
                }
                iconSize="xs"
                side="top"
              />
            </div>
          )}
        </div>

        {/* ПРОВЕРКА + СПАСБРОСОК row */}
        <div className="flex items-center gap-1.5 px-1 pb-1">
          <button
            type="button"
            className={`
              flex items-center gap-1 px-2 py-1 rounded
              ability-block text-xs font-medium
              ${!isEditing ? 'cursor-pointer hover-elevate active:opacity-80' : 'pointer-events-none'}
            `}
            onClick={() => !isEditing && onRollAbility()}
            data-testid={`ability-${ability.toLowerCase()}`}
          >
            <span className="uppercase tracking-wide text-ability-text">Проверка</span>
            <span className={`font-mono font-bold ${modifier >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatModifier(modifier)}
            </span>
          </button>

          <button
            type="button"
            className={`
              flex items-center gap-1 px-2 py-1 rounded
              ability-block text-xs font-medium
              ${isEditing ? 'cursor-pointer hover-elevate active:opacity-80' : ''}
              ${!isEditing ? 'cursor-pointer hover-elevate active:opacity-80' : ''}
            `}
            onClick={() => isEditing ? onSavingThrowProficiencyChange() : onRollSavingThrow()}
            data-testid={`saving-throw-mobile-${ability.toLowerCase()}`}
          >
            <div className={`w-2 h-2 rounded-full shrink-0 border ${savingThrowProficient ? 'bg-accent border-accent' : 'border-muted-foreground/40'}`} />
            <span className="uppercase tracking-wide text-ability-text">Спасбросок</span>
            <span className={`font-mono font-bold ${savingThrowBonus >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatModifier(savingThrowBonus)}
            </span>
          </button>

          {racialBonus > 0 && !isEditing && (
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 ml-auto">
              раса +{racialBonus}
            </Badge>
          )}
        </div>

        {/* Skills */}
        <div className="space-y-0">
          {renderSkills(true)}
          {relatedSkills.length === 0 && (
            <div className="text-xs text-muted-foreground italic py-1 px-2">
              Нет связанных навыков
            </div>
          )}
        </div>
      </div>

      {/* ── Desktop layout (≥ sm) ─────────────────────────────────────────── */}
      <div className="hidden sm:flex items-stretch gap-3 flex-1 p-3">
        <HelpTooltip
          side="right"
          asChild
          content={
            <div className="space-y-1.5 max-w-[240px]">
              <p className="font-medium text-sm">{ABILITY_TOOLTIPS_EXTENDED[ability].title}</p>
              <p className="text-xs text-muted-foreground">{ABILITY_TOOLTIPS_EXTENDED[ability].description}</p>
              <p className="text-xs text-muted-foreground">{ABILITY_TOOLTIPS_EXTENDED[ability].usedFor}</p>
              <div className="border-t border-border/40 pt-1">
                <p className="text-xs text-muted-foreground">Модификатор: {ABILITY_MODIFIER_FORMULA}</p>
                <p className="text-xs text-muted-foreground">{ABILITY_MODIFIER_EXAMPLES}</p>
              </div>
              {!isEditing && <p className="text-xs text-muted-foreground/60 mt-0.5">Нажмите для броска</p>}
            </div>
          }
        >
            <div
              className={`
                flex flex-col items-center justify-center
                w-[76px] shrink-0
                py-3 px-2 rounded-lg
                ability-block
                ${!isEditing ? 'cursor-pointer hover-elevate' : ''}
              `}
              onClick={() => !isEditing && onRollAbility()}
              data-testid={`ability-${ability.toLowerCase()}`}
            >
              <div className="text-[11px] font-bold text-ability-text uppercase tracking-wider">
                {ability}
              </div>
              <div className="mt-0.5 max-w-[60px] text-[11px] text-ability-label leading-[1.05] text-center [overflow-wrap:anywhere]">
                {label.ru}
              </div>

              {isEditing ? (
                <div className="mt-1.5 space-y-1">
                  <NumericInput
                    min={1}
                    max={30}
                    value={baseScore}
                    onChange={onScoreChange}
                    className="text-center text-base font-bold h-10 w-14 bg-background"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`input-ability-${ability.toLowerCase()}`}
                  />
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs text-muted-foreground">бонус</span>
                    <NumericInput
                      value={customBonus}
                      onChange={onCustomBonusChange}
                      className="text-center text-xs h-8 w-10 bg-background"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`input-ability-bonus-${ability.toLowerCase()}`}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-ability-score font-mono mt-1">
                    {totalScore}
                  </div>
                  <div className={`
                    text-sm font-bold font-mono px-2.5 py-0.5 rounded-full mt-0.5
                    ${modifier >= 0
                      ? 'text-positive bg-positive-muted'
                      : 'text-negative bg-negative-muted'
                    }
                  `}>
                    {formatModifier(modifier)}
                  </div>
                  {racialBonus > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 mt-1">
                      +{racialBonus}
                    </Badge>
                  )}
                </>
              )}
            </div>
        </HelpTooltip>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          {/* Saving throw row — visually distinct from skills */}
          <div
            className={`
              flex items-center gap-2 px-2 py-1.5 rounded
              bg-accent/8 border border-accent/20
              ${!isEditing ? 'cursor-pointer hover-elevate' : 'cursor-pointer hover-elevate'}
            `}
            onClick={() => isEditing ? onSavingThrowProficiencyChange() : onRollSavingThrow()}
            data-testid={`saving-throw-desktop-${ability.toLowerCase()}`}
          >
            <div className={`w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center border ${
              savingThrowProficient ? 'bg-accent border-accent' : 'border-muted-foreground/40'
            }`}>
              {savingThrowProficient && <div className="w-1.5 h-1.5 rounded-full bg-accent-foreground" />}
            </div>
            <span className="tx-l4">Спасбросок</span>
            <span onClick={(e) => e.stopPropagation()} className="shrink-0">
              <HelpTooltip
                content={
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{SAVING_THROW_SECTION_TOOLTIP.title}</p>
                    {SAVING_THROW_SECTION_TOOLTIP.lines.map((l, i) => (
                      <p key={i} className="text-xs text-muted-foreground">{l}</p>
                    ))}
                    <div className="border-t border-border/40 pt-1">
                      <p className="text-xs text-muted-foreground/80">{SAVING_THROW_BY_ABILITY[ability]}</p>
                    </div>
                  </div>
                }
                iconSize="xs"
                side="top"
              />
            </span>
            <span className="flex-1" />
            <span className={`text-xs font-bold font-mono tabular-nums ${savingThrowBonus >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatModifier(savingThrowBonus)}
            </span>
          </div>

          {relatedSkills.length > 0 && (
            <div className="border-t border-border/40 my-0.5" />
          )}

          <div className="space-y-0.5 flex-1">
            {renderSkills(false)}
            {relatedSkills.length === 0 && (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground italic py-1">
                Нет связанных навыков
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
