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
  type AbilityScores,
  type AbilityBonuses
} from "@shared/schema";
import { Star } from "lucide-react";

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
  STR: "Сила определяет физическую мощь персонажа. Влияет на броски атаки и урона в ближнем бою, проверки Атлетики и переносимый вес.",
  DEX: "Ловкость отражает быстроту и координацию. Влияет на инициативу, КД, броски дальних атак и навыки Акробатика, Ловкость рук, Скрытность.",
  CON: "Телосложение показывает выносливость и здоровье. Определяет количество хитов персонажа и спасброски на концентрацию.",
  INT: "Интеллект отвечает за логику и память. Важен для волшебников. Влияет на Анализ, Историю, Магию, Природу и Религию.",
  WIS: "Мудрость отражает интуицию и внимательность. Важна для жрецов и друидов. Влияет на Восприятие, Проницательность, Медицину, Выживание.",
  CHA: "Харизма определяет силу личности. Важна для бардов, паладинов и колдунов. Влияет на Обман, Запугивание, Выступление, Убеждение.",
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
    <Card className="stat-card p-3 overflow-visible">
      <div className="flex gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`relative flex flex-col items-center justify-center min-w-[100px] ${
                !isEditing ? 'cursor-pointer' : ''
              }`}
              onClick={() => !isEditing && onRollAbility()}
              data-testid={`ability-${ability.toLowerCase()}`}
            >
              <div className={`
                relative flex flex-col items-center justify-center
                w-[90px] h-[110px]
                bg-gradient-to-b from-amber-50 to-amber-100
                dark:from-amber-900/30 dark:to-amber-800/20
                border-2 border-amber-300 dark:border-amber-700
                rounded-lg shadow-md
                ${!isEditing ? 'hover:shadow-lg hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-200' : ''}
              `}>
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-200 dark:bg-amber-800 rounded-full border border-amber-300 dark:border-amber-600">
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                    {ability}
                  </span>
                </div>
                
                <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-2">
                  {label.ru}
                </div>
                
                {isEditing ? (
                  <div className="space-y-1 mt-1">
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={baseScore}
                      onChange={(e) => onScoreChange(parseInt(e.target.value) || 10)}
                      className="text-center text-sm font-bold h-7 w-12 bg-white dark:bg-gray-900"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`input-ability-${ability.toLowerCase()}`}
                    />
                    <div className="flex items-center gap-0.5">
                      <span className="text-[10px] text-muted-foreground">+</span>
                      <Input
                        type="number"
                        value={customBonus}
                        onChange={(e) => onCustomBonusChange(parseInt(e.target.value) || 0)}
                        className="text-center text-[10px] h-5 w-8 bg-white dark:bg-gray-900"
                        onClick={(e) => e.stopPropagation()}
                        data-testid={`input-ability-bonus-${ability.toLowerCase()}`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                    {totalScore}
                  </div>
                )}

                <div className={`
                  absolute -bottom-3 left-1/2 -translate-x-1/2
                  w-10 h-10 rounded-full
                  flex items-center justify-center
                  bg-gradient-to-b from-amber-100 to-amber-200
                  dark:from-amber-800 dark:to-amber-900
                  border-2 border-amber-400 dark:border-amber-600
                  shadow-md
                `}>
                  <span className={`text-base font-bold ${
                    modifier >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                  }`}>
                    {formatModifier(modifier)}
                  </span>
                </div>
              </div>

              {(racialBonus > 0 || customBonus !== 0) && !isEditing && (
                <div className="flex gap-1 mt-5">
                  {racialBonus > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700">
                      Раса +{racialBonus}
                    </Badge>
                  )}
                  {customBonus !== 0 && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                      {customBonus > 0 ? '+' : ''}{customBonus}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-sm">{ABILITY_TOOLTIPS[ability]}</p>
            {!isEditing && (
              <p className="text-xs text-muted-foreground mt-1">Нажмите для броска d20</p>
            )}
          </TooltipContent>
        </Tooltip>

        {relatedSkills.length > 0 && (
          <div className="flex-1 space-y-0.5 pt-2">
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
                    flex items-center gap-2 py-1.5 px-2 rounded-md
                    transition-colors duration-150
                    ${!isEditing ? 'cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20' : ''}
                    ${proficiency.proficient ? 'bg-amber-50/70 dark:bg-amber-900/30' : ''}
                  `}
                  onClick={() => !isEditing && onRollSkill(skill.name)}
                  data-testid={`skill-${skill.name.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div
                    className={`flex items-center justify-center w-4 h-4 ${isEditing ? 'cursor-pointer' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSkillProficiencyClick(skill.name, proficiency);
                    }}
                    data-testid={`checkbox-skill-${skill.name.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {proficiency.expertise ? (
                      <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500 dark:fill-amber-500" />
                    ) : proficiency.proficient ? (
                      <div className="w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-500 shadow-sm" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                    )}
                  </div>
                  
                  <span className={`text-sm flex-1 ${
                    proficiency.proficient 
                      ? 'font-medium text-amber-900 dark:text-amber-100' 
                      : 'text-muted-foreground'
                  }`}>
                    {skill.name}
                  </span>
                  
                  <span className={`text-sm font-bold min-w-[2rem] text-right ${
                    skillBonus >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatModifier(skillBonus)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
