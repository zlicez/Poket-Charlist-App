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
  const [isExpanded, setIsExpanded] = useState(true);
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
    <Card className="stat-card p-2 sm:p-3">
      <div className="flex items-stretch gap-2 sm:gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`
                flex flex-col items-center justify-center
                min-w-[70px] sm:min-w-[80px]
                py-2 px-1 rounded-lg
                bg-gradient-to-b from-amber-50 to-amber-100
                dark:from-amber-900/40 dark:to-amber-800/30
                border border-amber-300 dark:border-amber-700
                ${!isEditing ? 'cursor-pointer hover-elevate' : ''}
              `}
              onClick={() => !isEditing && onRollAbility()}
              data-testid={`ability-${ability.toLowerCase()}`}
            >
              <div className="text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                {ability}
              </div>
              <div className="text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-400">
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
                    className="text-center text-base font-bold h-10 w-14 bg-white dark:bg-gray-900"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`input-ability-${ability.toLowerCase()}`}
                  />
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[10px] text-muted-foreground">бонус</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={customBonus}
                      onChange={(e) => onCustomBonusChange(parseInt(e.target.value) || 0)}
                      className="text-center text-xs h-8 w-10 bg-white dark:bg-gray-900"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`input-ability-bonus-${ability.toLowerCase()}`}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-2xl sm:text-3xl font-bold text-amber-900 dark:text-amber-100">
                    {totalScore}
                  </div>
                  <div className={`
                    text-base sm:text-lg font-bold px-2 py-0.5 rounded-full
                    ${modifier >= 0 
                      ? 'text-green-700 dark:text-green-400 bg-green-100/50 dark:bg-green-900/30' 
                      : 'text-red-700 dark:text-red-400 bg-red-100/50 dark:bg-red-900/30'
                    }
                  `}>
                    {formatModifier(modifier)}
                  </div>
                  {(racialBonus > 0 || customBonus !== 0) && (
                    <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                      {racialBonus > 0 && (
                        <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">
                          +{racialBonus}
                        </Badge>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[200px]">
            <p className="text-xs">{ABILITY_TOOLTIPS[ability]}</p>
            {!isEditing && <p className="text-[10px] text-muted-foreground mt-1">Нажмите для броска</p>}
          </TooltipContent>
        </Tooltip>

        <div className="flex-1 min-w-0">
          <button
            type="button"
            className="flex items-center gap-1 w-full text-left mb-1 sm:hidden"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid={`toggle-skills-${ability.toLowerCase()}`}
          >
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Навыки</span>
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
                    flex items-center gap-1.5 sm:gap-2 
                    py-1.5 sm:py-1 px-1.5 sm:px-2 rounded
                    min-h-[36px] sm:min-h-0
                    ${!isEditing ? 'cursor-pointer active:bg-amber-100 dark:active:bg-amber-900/40' : ''}
                    ${proficiency.proficient ? 'bg-amber-50/80 dark:bg-amber-900/20' : ''}
                  `}
                  onClick={() => !isEditing && onRollSkill(skill.name)}
                  data-testid={`skill-${skill.name.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <button
                    type="button"
                    className={`
                      flex items-center justify-center 
                      w-6 h-6 sm:w-5 sm:h-5 
                      rounded-full
                      ${isEditing ? 'cursor-pointer hover-elevate' : 'pointer-events-none'}
                      ${proficiency.proficient 
                        ? 'bg-amber-200 dark:bg-amber-800' 
                        : 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSkillProficiencyClick(skill.name, proficiency);
                    }}
                    data-testid={`checkbox-skill-${skill.name.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {proficiency.expertise ? (
                      <Star className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-amber-700 dark:text-amber-300 fill-current" />
                    ) : proficiency.proficient ? (
                      <div className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400" />
                    ) : null}
                  </button>
                  
                  <span className={`
                    text-xs sm:text-sm flex-1 truncate
                    ${proficiency.proficient ? 'font-medium text-foreground' : 'text-muted-foreground'}
                  `}>
                    {skill.name}
                  </span>
                  
                  <span className={`
                    text-xs sm:text-sm font-bold tabular-nums
                    ${skillBonus >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
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
