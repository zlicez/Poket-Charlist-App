import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface AbilityWithSkillsProps {
  ability: AbilityName;
  baseScore: number;
  customBonus: number;
  race: string;
  subrace?: string;
  level: number;
  skills: Record<string, SkillProficiency>;
  onScoreChange: (value: number) => void;
  onCustomBonusChange: (value: number) => void;
  onSkillProficiencyChange: (skillName: string, proficiency: SkillProficiency) => void;
  onRollAbility: () => void;
  onRollSkill: (skillName: string) => void;
  isEditing: boolean;
}

const ABILITY_TOOLTIPS: Record<AbilityName, string> = {
  STR: "Сила определяет физическую мощь персонажа",
  DEX: "Ловкость отражает быстроту и координацию",
  CON: "Телосложение показывает выносливость и здоровье",
  INT: "Интеллект отвечает за логику и память",
  WIS: "Мудрость отражает интуицию и внимательность",
  CHA: "Харизма определяет силу личности",
};

export function AbilityWithSkills({
  ability,
  baseScore,
  customBonus,
  race,
  subrace,
  level,
  skills,
  onScoreChange,
  onCustomBonusChange,
  onSkillProficiencyChange,
  onRollAbility,
  onRollSkill,
  isEditing,
}: AbilityWithSkillsProps) {
  const isMobile = !useMediaQuery("(min-width: 640px)");
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const racialBonuses = getRacialBonuses(race, subrace);
  const racialBonus = racialBonuses[ability] || 0;
  const totalScore = baseScore + racialBonus + customBonus;
  const modifier = calculateModifier(totalScore);
  const profBonus = getProficiencyBonus(level);
  const label = ABILITY_LABELS[ability];
  const relatedSkills = SKILLS_BY_ABILITY[ability];

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

  return (
    <Card className="stat-card p-3">
      <div className="flex items-stretch gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`
                flex flex-col items-center justify-center
                min-w-[72px] sm:min-w-[80px]
                py-2 px-2 rounded-lg
                ability-block
                ${!isEditing ? 'cursor-pointer hover-elevate' : ''}
              `}
              onClick={() => !isEditing && onRollAbility()}
              data-testid={`ability-${ability.toLowerCase()}`}
            >
              <div className="text-xs font-bold text-ability-text uppercase tracking-wide">
                {ability}
              </div>
              <div className="text-xs text-ability-label">
                {label.ru}
              </div>
              
              {isEditing ? (
                <div className="mt-1 space-y-1">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={30}
                    value={baseScore}
                    onChange={(e) => onScoreChange(parseInt(e.target.value) || 10)}
                    className="text-center text-base font-bold h-10 w-14 bg-background"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`input-ability-${ability.toLowerCase()}`}
                  />
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs text-muted-foreground">бонус</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={customBonus}
                      onChange={(e) => onCustomBonusChange(parseInt(e.target.value) || 0)}
                      className="text-center text-xs h-8 w-10 bg-background"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`input-ability-bonus-${ability.toLowerCase()}`}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-bold text-ability-score font-mono">
                    {totalScore}
                  </div>
                  <div className={`
                    text-base sm:text-lg font-bold font-mono px-2 py-0.5 rounded-full
                    ${modifier >= 0 
                      ? 'text-positive bg-positive-muted' 
                      : 'text-negative bg-negative-muted'
                    }
                  `}>
                    {formatModifier(modifier)}
                  </div>
                  {racialBonus > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                      <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                        +{racialBonus}
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[200px]">
            <p className="text-xs">{ABILITY_TOOLTIPS[ability]}</p>
            {!isEditing && <p className="text-xs text-muted-foreground mt-1">Нажмите для броска</p>}
          </TooltipContent>
        </Tooltip>

        <div className="flex-1 min-w-0">
          <button
            type="button"
            className="flex items-center gap-1 w-full text-left mb-1 sm:hidden min-h-[36px]"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid={`toggle-skills-${ability.toLowerCase()}`}
          >
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Навыки</span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            )}
          </button>

          <div className={`space-y-0.5 ${!isExpanded ? 'hidden sm:block' : ''}`}>
            {relatedSkills.map((skill) => {
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
                    flex items-center gap-2 
                    py-1.5 px-2 rounded
                    min-h-[40px] sm:min-h-0
                    ${!isEditing ? 'cursor-pointer active:bg-ability-proficient-bg' : ''}
                    ${proficiency.proficient ? 'bg-ability-proficient-bg' : ''}
                  `}
                  onClick={() => !isEditing && onRollSkill(skill.name)}
                  data-testid={`skill-${skill.name.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <button
                    type="button"
                    className={`
                      flex items-center justify-center 
                      w-9 h-9 sm:w-5 sm:h-5 
                      rounded-full shrink-0
                      ${isEditing ? 'cursor-pointer hover-elevate' : 'pointer-events-none'}
                      ${proficiency.proficient 
                        ? 'bg-accent/30' 
                        : 'bg-muted border border-border'
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSkillProficiencyClick(skill.name, proficiency);
                    }}
                    data-testid={`checkbox-skill-${skill.name.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {proficiency.expertise ? (
                      <Star className="w-4 h-4 sm:w-3 sm:h-3 text-accent fill-current" />
                    ) : proficiency.proficient ? (
                      <div className="w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full bg-accent" />
                    ) : null}
                  </button>
                  
                  <span className={`
                    text-xs sm:text-sm flex-1 truncate
                    ${proficiency.proficient ? 'font-medium text-foreground' : 'text-muted-foreground'}
                  `}>
                    {skill.name}
                  </span>
                  
                  <span className={`
                    text-xs sm:text-sm font-bold font-mono tabular-nums
                    ${skillBonus >= 0 ? 'text-positive' : 'text-negative'}
                  `}>
                    {formatModifier(skillBonus)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
