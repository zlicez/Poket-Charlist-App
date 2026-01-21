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
    <Card className="stat-card p-3">
      <div className="flex gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex flex-col items-center justify-center min-w-[80px] p-2 rounded-md ${
                !isEditing ? 'cursor-pointer hover-elevate active-elevate-2' : ''
              }`}
              onClick={() => !isEditing && onRollAbility()}
              data-testid={`ability-${ability.toLowerCase()}`}
            >
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {ability}
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                {label.ru}
              </div>
              
              {isEditing ? (
                <div className="space-y-1">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={baseScore}
                    onChange={(e) => onScoreChange(parseInt(e.target.value) || 10)}
                    className="text-center text-sm font-bold h-8 w-14"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`input-ability-${ability.toLowerCase()}`}
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">+</span>
                    <Input
                      type="number"
                      value={customBonus}
                      onChange={(e) => onCustomBonusChange(parseInt(e.target.value) || 0)}
                      className="text-center text-xs h-6 w-10"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`input-ability-bonus-${ability.toLowerCase()}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold">{totalScore}</div>
              )}

              <div 
                className={`text-lg font-bold rounded-md py-0.5 px-2 mt-1 ${
                  modifier >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatModifier(modifier)}
              </div>

              {(racialBonus > 0 || customBonus !== 0) && !isEditing && (
                <div className="flex gap-1 mt-1">
                  {racialBonus > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                      Раса +{racialBonus}
                    </Badge>
                  )}
                  {customBonus !== 0 && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">
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
              <p className="text-xs text-muted-foreground mt-1">Нажмите для проверки характеристики</p>
            )}
          </TooltipContent>
        </Tooltip>

        {relatedSkills.length > 0 && (
          <div className="flex-1 space-y-1">
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
                  className={`flex items-center gap-2 py-1 px-2 rounded-md ${
                    !isEditing ? 'cursor-pointer hover-elevate active-elevate-2' : ''
                  } ${proficiency.proficient ? 'bg-accent/10' : ''}`}
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
                      <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                    ) : proficiency.proficient ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  
                  <span className={`text-sm flex-1 ${proficiency.proficient ? 'font-medium' : 'text-muted-foreground'}`}>
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
